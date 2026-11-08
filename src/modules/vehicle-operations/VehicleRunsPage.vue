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
          kind === 'worker' ? 'Tạo chuyến công nhân' : 'Tạo chuyến du lịch'
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
      :persist="{
        key: `${kind}-vehicle-runs-v2`,
        queryPrefix: `${kind}-vehicle-runs-v2`,
        url: true,
      }"
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
import { formatVietnameseDate, formatVietnameseDateTime } from '@/shared/helpers/date.helper'
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
const moneyCell = (value?: string) => currency(value ?? '0')
const sourceLabel = (run: VehicleRun) => (run.is_company_vehicle ? 'Xe công ty' : 'Xe ngoài')
const driverLabel = (run: VehicleRun) =>
  run.driver_name ?? run.hired_driver_name ?? 'Chưa phân công'
const attendanceLabel = (run: VehicleRun) =>
  run.attendance
    ? `${{ pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', payroll_locked: 'Đã chốt lương' }[run.attendance.status] ?? run.attendance.status} · ${moneyCell(run.attendance.calculated_wage)}`
    : 'Chưa có'
const columns = computed<DataGridColumnDef<VehicleRun>[]>(() => [
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
  {
    accessorKey: 'return_date',
    header: 'Ngày về',
    width: 125,
    cell: ({ row }) => formatVietnameseDate(row.original.return_date ?? row.original.run_date),
    meta: { label: 'Ngày về' },
  },
  { accessorKey: 'pickup_time', header: 'Giờ đón', width: 100, meta: { label: 'Giờ đón' } },
  {
    accessorKey: 'return_time',
    header: 'Giờ về',
    width: 100,
    cell: ({ row }) => row.original.return_time ?? '—',
    meta: { label: 'Giờ về' },
  },
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
  ...(props.kind === 'worker'
    ? ([
        {
          accessorKey: 'shift_name',
          header: 'Ca chạy',
          width: 120,
          cell: ({ row }: { row: { original: VehicleRun } }) => row.original.shift_name ?? '—',
          meta: { label: 'Ca chạy' },
        },
        {
          accessorKey: 'schedule_rule_id',
          header: 'Nguồn chuyến',
          width: 145,
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            row.original.schedule_rule_id ? 'Theo lịch lặp' : 'Chuyến tạo tay',
          meta: { label: 'Nguồn chuyến' },
        },
      ] as DataGridColumnDef<VehicleRun>[])
    : ([
        {
          accessorKey: 'journey',
          header: 'Hành trình',
          width: 220,
          cell: ({ row }: { row: { original: VehicleRun } }) => row.original.journey ?? '—',
          meta: { label: 'Hành trình' },
        },
      ] as DataGridColumnDef<VehicleRun>[])),
  { accessorKey: 'license_plate', header: 'Biển số', width: 125, meta: { label: 'Biển số' } },
  {
    accessorKey: 'vehicle_model',
    header: 'Hãng / loại xe',
    width: 180,
    cell: ({ row }) => row.original.vehicle_model ?? '—',
    meta: { label: 'Hãng / loại xe' },
  },
  {
    accessorKey: 'seat_count',
    header: 'Số chỗ',
    width: 95,
    align: 'right',
    cell: ({ row }) => (row.original.seat_count ? `${row.original.seat_count} chỗ` : '—'),
    meta: { label: 'Số chỗ' },
  },
  {
    accessorKey: 'is_company_vehicle',
    header: 'Nguồn xe',
    width: 125,
    cell: ({ row }) => sourceLabel(row.original),
    meta: { label: 'Nguồn xe' },
  },
  {
    accessorKey: 'partner_name',
    header: 'Đối tác xe',
    width: 170,
    cell: ({ row }) => row.original.partner_name ?? '—',
    meta: { label: 'Đối tác xe' },
  },
  {
    accessorKey: 'driver_name',
    header: 'Tài xế',
    width: 170,
    cell: ({ row }) => driverLabel(row.original),
    meta: { label: 'Tài xế' },
  },
  {
    accessorKey: 'is_hired_driver',
    header: 'Hình thức lái',
    width: 135,
    cell: ({ row }) => (row.original.is_hired_driver ? 'Thuê lái' : 'Lái nội bộ'),
    meta: { label: 'Hình thức lái' },
  },
  {
    accessorKey: 'hired_driver_name',
    header: 'Tên lái thuê',
    width: 165,
    cell: ({ row }) => row.original.hired_driver_name ?? '—',
    meta: { label: 'Tên lái thuê' },
  },
  {
    accessorKey: 'hired_driver_cost',
    header: 'Chi phí thuê lái',
    width: 155,
    align: 'right',
    cell: ({ row }) =>
      row.original.is_hired_driver ? moneyCell(row.original.hired_driver_cost ?? '0') : '—',
    meta: { label: 'Chi phí thuê lái' },
  },
  {
    accessorKey: 'pickup_location',
    header: 'Điểm đón',
    width: 190,
    cell: ({ row }) => row.original.pickup_location ?? '—',
    meta: { label: 'Điểm đón' },
  },
  {
    accessorKey: 'dropoff_location',
    header: 'Điểm trả',
    width: 190,
    cell: ({ row }) => row.original.dropoff_location ?? '—',
    meta: { label: 'Điểm trả' },
  },
  {
    accessorKey: 'freight_amount',
    header: 'Cước',
    width: 145,
    align: 'right',
    cell: ({ row }) => currency(row.original.freight_amount),
    meta: { label: 'Cước', mobile: 'primary' },
  },
  {
    accessorKey: 'driver_wage',
    header: 'Lương lái',
    width: 145,
    align: 'right',
    cell: ({ row }) => moneyCell(row.original.driver_wage),
    meta: { label: 'Lương lái' },
  },
  ...(props.kind === 'tourist'
    ? ([
        {
          accessorKey: 'driver_wage_rate',
          header: 'Tỷ lệ lương',
          width: 125,
          align: 'right',
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            `${Number(row.original.driver_wage_rate ?? 0) * 100}%`,
          meta: { label: 'Tỷ lệ lương' },
        },
        {
          accessorKey: 'partner_vehicle_cost',
          header: 'Thuê xe ngoài',
          width: 160,
          align: 'right',
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            moneyCell(row.original.partner_vehicle_cost),
          meta: { label: 'Thuê xe ngoài' },
        },
        {
          accessorKey: 'driver_collected_amount',
          header: 'Lái xe thu',
          width: 140,
          align: 'right',
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            moneyCell(row.original.driver_collected_amount),
          meta: { label: 'Lái xe thu' },
        },
        {
          accessorKey: 'company_collected_amount',
          header: 'Công ty thu',
          width: 140,
          align: 'right',
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            moneyCell(row.original.company_collected_amount),
          meta: { label: 'Công ty thu' },
        },
        {
          accessorKey: 'driver_remitted_amount',
          header: 'Lái xe nộp',
          width: 140,
          align: 'right',
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            moneyCell(row.original.driver_remitted_amount),
          meta: { label: 'Lái xe nộp' },
        },
        {
          accessorKey: 'driver_expense_amount',
          header: 'Lái xe chi',
          width: 140,
          align: 'right',
          cell: ({ row }: { row: { original: VehicleRun } }) =>
            moneyCell(row.original.driver_expense_amount),
          meta: { label: 'Lái xe chi' },
        },
      ] as DataGridColumnDef<VehicleRun>[])
    : []),
  {
    accessorKey: 'actual_started_at',
    header: 'Bắt đầu thực tế',
    width: 175,
    cell: ({ row }) => formatVietnameseDateTime(row.original.actual_started_at),
    meta: { label: 'Bắt đầu thực tế' },
  },
  {
    accessorKey: 'actual_completed_at',
    header: 'Hoàn thành thực tế',
    width: 180,
    cell: ({ row }) => formatVietnameseDateTime(row.original.actual_completed_at),
    meta: { label: 'Hoàn thành thực tế' },
  },
  {
    accessorKey: 'attendance',
    header: 'Chấm công',
    width: 175,
    cell: ({ row }) => attendanceLabel(row.original),
    meta: { label: 'Chấm công' },
  },
  {
    accessorKey: 'note',
    header: 'Ghi chú',
    width: 220,
    cell: ({ row }) => row.original.note ?? '—',
    meta: { label: 'Ghi chú' },
  },
])
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
