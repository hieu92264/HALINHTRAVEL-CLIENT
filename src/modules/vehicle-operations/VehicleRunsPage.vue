<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-primary">Điều hành xe chạy</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ title }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Tìm nhanh, lọc từng cột, sắp xếp và phân trang danh sách chuyến chạy.
        </p>
      </div>
      <Button
        class="w-full sm:w-auto"
        @click="
          router.push({
            name: kind === 'worker' ? 'worker-vehicles-create' : 'tourist-vehicles-create',
          })
        "
        ><Plus class="size-4" />{{
          kind === 'worker' ? 'Tạo chuyến ngoại lệ' : 'Tạo chuyến du lịch'
        }}</Button
      >
    </header>
    <WorkerOperationsTabs v-if="kind === 'worker'" />

    <DataGrid
      :data-source="dataSource"
      :columns="columns"
      :get-row-id="(run) => String(run.id)"
      :pagination="{ mode: 'client', pageSize: 25 }"
      filtering-mode="client"
      sorting-mode="client"
      filter-row
      global-filter
      show-actions
      mobile-mode="cards"
      height="calc(100svh - 260px)"
      :persist="{ key: `${kind}-vehicle-runs`, url: true }"
      empty-title="Chưa có chuyến chạy"
      empty-description="Các chuyến phù hợp với điều kiện lọc sẽ hiển thị tại đây."
      @row-click="openRun"
      @retry="load"
    >
      <template #toolbar-end
        ><Button size="sm" variant="outline" :disabled="isLoading" @click="load"
          ><RefreshCw class="size-4" :class="isLoading ? 'animate-spin' : ''" />Làm mới</Button
        ></template
      >
      <template #actions="{ row }"
        ><Button variant="ghost" size="sm" @click.stop="openRun(row)"
          ><span class="sr-only">Xem chi tiết</span><ArrowUpRight class="size-4" /></Button
      ></template>
    </DataGrid>
  </section>
</template>

<script setup lang="ts">
import { VehicleOperationsService, type VehicleRun } from '@/services/vehicle-operations.service'
import { formatVietnameseDate } from '@/shared/helpers/date.helper'
import {
  DataGrid,
  type DataGridColumnDef,
  type DataGridDataSource,
} from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import WorkerOperationsTabs from './WorkerOperationsTabs.vue'
import { ArrowUpRight, Plus, RefreshCw } from '@lucide/vue'
import { computed, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ kind: 'worker' | 'tourist' }>()
const router = useRouter()
const runs = ref<VehicleRun[]>([])
const isLoading = ref(false)
const title = computed(() => (props.kind === 'worker' ? 'Xe chạy công nhân' : 'Xe chạy du lịch'))
const currency = (amount: string) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
const statusLabel: Record<string, string> = {
  planned: 'Kế hoạch',
  in_progress: 'Đang chạy',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}
const statusClass: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  in_progress: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
}
const columns: DataGridColumnDef<VehicleRun>[] = [
  {
    accessorKey: 'run_no',
    header: 'Mã chuyến',
    width: 150,
    fixed: 'left',
    meta: { label: 'Mã chuyến', mobile: 'primary' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    width: 130,
    cell: ({ row }) =>
      h(
        'span',
        {
          class: `inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass[row.original.status] ?? 'bg-muted'}`,
        },
        statusLabel[row.original.status] ?? row.original.status,
      ),
    meta: { label: 'Trạng thái', mobile: 'primary' },
  },
  {
    accessorKey: 'run_date',
    header: 'Ngày chạy',
    width: 125,
    cell: ({ getValue }) => formatVietnameseDate(String(getValue() ?? '')),
    meta: { label: 'Ngày chạy', mobile: 'primary' },
  },
  { accessorKey: 'pickup_time', header: 'Giờ đón', width: 100, meta: { label: 'Giờ đón' } },
  {
    accessorKey: 'customer_name',
    header: 'Khách hàng',
    width: 180,
    cell: ({ row }) => row.original.customer_name ?? '—',
    meta: { label: 'Khách hàng', mobile: 'primary' },
  },
  {
    accessorKey: 'route_name',
    header: 'Tuyến / hành trình',
    width: 190,
    cell: ({ row }) => row.original.route_name ?? row.original.journey ?? '—',
    meta: { label: 'Tuyến / hành trình' },
  },
  {
    accessorKey: 'shift_name',
    header: 'Ca',
    width: 120,
    cell: ({ row }) => row.original.shift_name ?? '—',
    meta: { label: 'Ca' },
  },
  { accessorKey: 'license_plate', header: 'Biển số', width: 125, meta: { label: 'Biển số' } },
  {
    accessorKey: 'driver_name',
    header: 'Tài xế',
    width: 170,
    cell: ({ row }) =>
      row.original.driver_name ?? row.original.hired_driver_name ?? 'Chưa phân công',
    meta: { label: 'Tài xế' },
  },
  {
    accessorKey: 'freight_amount',
    header: 'Cước',
    width: 145,
    align: 'right',
    cell: ({ row }) => currency(row.original.freight_amount),
    meta: { label: 'Cước', mobile: 'primary' },
  },
]
const dataSource = computed<DataGridDataSource<VehicleRun>>(() => ({
  data: runs.value,
  isLoading: isLoading.value,
}))
async function load() {
  isLoading.value = true
  try {
    runs.value = await VehicleOperationsService.runs(props.kind)
  } finally {
    isLoading.value = false
  }
}
function openRun(run: VehicleRun) {
  router.push({
    name: props.kind === 'worker' ? 'worker-vehicles-detail' : 'tourist-vehicles-detail',
    params: { id: run.id },
  })
}
onMounted(load)
</script>
