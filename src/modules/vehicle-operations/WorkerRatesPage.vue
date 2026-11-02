<template>
  <section class="space-y-5">
    <header>
      <p class="text-sm font-medium text-primary">Điều hành xe chạy</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">Bảng giá xe công nhân</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Cước và lương được chốt theo tuyến, biển số và thời hạn hiệu lực.
      </p>
    </header>
    <WorkerOperationsTabs />
    <DataGrid
      :data-source="dataSource"
      :columns="columns"
      :get-row-id="(rate) => String(rate.id)"
      :pagination="{ mode: 'client', pageSize: 25 }"
      filtering-mode="client"
      sorting-mode="client"
      filter-row
      global-filter
      show-actions
      mobile-mode="cards"
      height="calc(100svh - 260px)"
      :persist="{ key: 'worker-vehicle-rates', url: true }"
      empty-title="Chưa có bảng giá"
      empty-description="Bảng giá có hiệu lực sẽ xuất hiện tại đây."
      @retry="load"
    >
      <template #toolbar-end>
        <Button v-if="canManage" size="sm" @click="openCreate"
          ><Plus class="size-4" />Thêm bảng giá</Button
        >
        <Button size="sm" variant="outline" :disabled="isLoading" @click="load"
          ><RefreshCw class="size-4" :class="isLoading ? 'animate-spin' : ''" />Làm mới</Button
        >
      </template>
      <template #actions="{ row }">
        <Button v-if="canManage" size="sm" variant="ghost" @click.stop="openEdit(row)"
          ><PencilLine class="size-4" /><span class="sr-only">Sửa bảng giá</span></Button
        >
      </template>
    </DataGrid>
    <WorkerRateDialog
      ref="dialog"
      :open="isDialogOpen"
      :rate="selectedRate"
      :routes="routes"
      :pending="isSaving"
      @close="closeDialog"
      @save="save"
    />
  </section>
</template>

<script setup lang="ts">
import { VehicleOperationsService, type WorkerRate } from '@/services/vehicle-operations.service'
import type { Route } from '@/modules/master-data/master-data.type'
import { RouteService } from '@/services/route.service'
import { useAuthStore } from '@/modules/auth/auth.store'
import { formatVietnameseDate } from '@/shared/helpers/date.helper'
import {
  DataGrid,
  type DataGridColumnDef,
  type DataGridDataSource,
} from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { PencilLine, Plus, RefreshCw } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import WorkerOperationsTabs from './WorkerOperationsTabs.vue'
import WorkerRateDialog from './WorkerRateDialog.vue'

const rates = ref<WorkerRate[]>([])
const routes = ref<Route[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDialogOpen = ref(false)
const selectedRate = ref<WorkerRate | null>(null)
const dialog = ref<InstanceType<typeof WorkerRateDialog> | null>(null)
const auth = useAuthStore()
const canManage = computed(
  () => auth.user?.permissions.includes('worker-vehicle-rates.manage') ?? false,
)
const money = (value: string) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
const columns: DataGridColumnDef<WorkerRate>[] = [
  {
    accessorKey: 'route_name',
    header: 'Tuyến',
    width: 220,
    fixed: 'left',
    cell: ({ row }) => row.original.route_name ?? '—',
    meta: { label: 'Tuyến' },
  },
  { accessorKey: 'license_plate', header: 'Biển số', width: 145, meta: { label: 'Biển số' } },
  {
    accessorKey: 'freight_amount',
    header: 'Cước',
    width: 160,
    align: 'right',
    cell: ({ row }) => money(row.original.freight_amount),
    meta: { label: 'Cước' },
  },
  {
    accessorKey: 'driver_wage',
    header: 'Lương lái',
    width: 160,
    align: 'right',
    cell: ({ row }) => money(row.original.driver_wage),
    meta: { label: 'Lương lái' },
  },
  {
    accessorKey: 'effective_from',
    header: 'Hiệu lực từ',
    width: 140,
    cell: ({ getValue }) => formatVietnameseDate(String(getValue() ?? '')),
    meta: { label: 'Hiệu lực từ' },
  },
  {
    accessorKey: 'effective_to',
    header: 'Hiệu lực đến',
    width: 150,
    cell: ({ row }) =>
      row.original.effective_to
        ? formatVietnameseDate(row.original.effective_to)
        : 'Không thời hạn',
    meta: { label: 'Hiệu lực đến' },
  },
]
const dataSource = computed<DataGridDataSource<WorkerRate>>(() => ({
  data: rates.value,
  isLoading: isLoading.value,
}))
async function load() {
  isLoading.value = true
  try {
    const [rateList, routeList] = await Promise.all([
      VehicleOperationsService.rates(),
      RouteService.getRouteList(),
    ])
    rates.value = rateList
    routes.value = routeList
  } finally {
    isLoading.value = false
  }
}
function openCreate() {
  selectedRate.value = null
  isDialogOpen.value = true
}
function openEdit(rate: WorkerRate) {
  selectedRate.value = rate
  isDialogOpen.value = true
}
function closeDialog() {
  isDialogOpen.value = false
  selectedRate.value = null
}
async function save(payload: Omit<WorkerRate, 'id' | 'route_name'>) {
  isSaving.value = true
  try {
    if (selectedRate.value)
      await VehicleOperationsService.updateRate(selectedRate.value.id, payload)
    else await VehicleOperationsService.createRate(payload)
    toast.success(selectedRate.value ? 'Đã cập nhật bảng giá' : 'Đã tạo bảng giá')
    closeDialog()
    await load()
  } catch (error) {
    dialog.value?.showApiError(error)
  } finally {
    isSaving.value = false
  }
}
onMounted(load)
</script>
