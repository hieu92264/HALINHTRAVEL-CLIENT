<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-start justify-between gap-4"><div><p class="text-sm font-medium text-primary">Điều hành xe chạy</p><h1 class="mt-1 text-2xl font-semibold tracking-tight">Lịch xe công nhân</h1><p class="mt-1 text-sm text-muted-foreground">Các quy tắc dài hạn sinh sẵn chuyến chạy trong cửa sổ 90 ngày.</p></div><Button @click="router.push({ name: 'worker-vehicle-schedules-create' })"><Plus class="size-4" />Tạo lịch lặp</Button></header>
    <DataGrid :data-source="dataSource" :columns="columns" :get-row-id="(schedule) => String(schedule.id)" :pagination="{ mode: 'client', pageSize: 25 }" filtering-mode="client" sorting-mode="client" filter-row global-filter show-actions height="calc(100svh - 260px)" :persist="{ key: 'worker-vehicle-schedules', url: true }" empty-title="Chưa có lịch lặp" empty-description="Tạo một lịch để hệ thống tự sinh chuyến xe công nhân." @retry="load">
      <template #toolbar-end><Button size="sm" variant="outline" :disabled="isLoading" @click="load"><RefreshCw class="size-4" :class="isLoading ? 'animate-spin' : ''" />Làm mới</Button></template>
      <template #actions="{ row }"><div class="flex h-full"><Button variant="ghost" size="sm" title="Cập nhật lịch" @click.stop="router.push({ name: 'worker-vehicle-schedules-edit', params: { id: row.id } })"><PencilLine class="size-4" /></Button><Button variant="ghost" size="sm" title="Ngừng lịch" class="text-destructive hover:text-destructive" @click.stop="remove(row)"><Trash2 class="size-4" /></Button></div></template>
    </DataGrid>
  </section>
</template>

<script setup lang="ts">
import { VehicleOperationsService, type WorkerSchedule } from '@/services/vehicle-operations.service'
import { DataGrid, type DataGridColumnDef, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { PencilLine, Plus, RefreshCw, Trash2 } from '@lucide/vue'
import { computed, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const schedules = ref<WorkerSchedule[]>([])
const isLoading = ref(false)
const weekdayNames: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN' }
const columns: DataGridColumnDef<WorkerSchedule>[] = [
  { accessorKey: 'customer_name', header: 'Khách hàng', width: 175, fixed: 'left', cell: ({ row }) => row.original.customer_name ?? '—', meta: { label: 'Khách hàng' } },
  { accessorKey: 'route_name', header: 'Tuyến', width: 180, cell: ({ row }) => row.original.route_name ?? '—', meta: { label: 'Tuyến' } },
  { accessorKey: 'shift_name', header: 'Ca', width: 120, meta: { label: 'Ca' } },
  { accessorKey: 'license_plate', header: 'Biển số', width: 125, meta: { label: 'Biển số' } },
  { id: 'days', header: 'Ngày chạy', width: 220, cell: ({ row }) => row.original.days.map((day) => `${weekdayNames[day.weekday]} ${day.pickup_time}`).join(' · '), enableColumnFilter: false, meta: { label: 'Ngày chạy' } },
  { accessorKey: 'effective_from', header: 'Hiệu lực từ', width: 130, meta: { label: 'Hiệu lực từ' } },
  { accessorKey: 'runs_count', header: 'Đã sinh', width: 100, align: 'right', cell: ({ row }) => String(row.original.runs_count), meta: { label: 'Đã sinh' } },
  { accessorKey: 'is_active', header: 'Trạng thái', width: 125, cell: ({ row }) => h('span', { class: `inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.original.is_active === false ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'}` }, row.original.is_active === false ? 'Ngừng dùng' : 'Đang dùng'), meta: { label: 'Trạng thái' } },
]
const dataSource = computed<DataGridDataSource<WorkerSchedule>>(() => ({ data: schedules.value, isLoading: isLoading.value }))
async function load() { isLoading.value = true; try { schedules.value = await VehicleOperationsService.schedules() } finally { isLoading.value = false } }
async function remove(schedule: WorkerSchedule) { if (!window.confirm(`Ngừng lịch ${schedule.route_name ?? schedule.id}? Các chuyến kế hoạch chưa chạy sẽ không được sinh thêm.`)) return; try { await VehicleOperationsService.deleteSchedule(schedule.id); toast.success('Đã ngừng lịch xe'); await load() } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể ngừng lịch xe') } }
onMounted(load)
</script>
