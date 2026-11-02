<template>
  <section class="space-y-5">
    <header><p class="text-sm font-medium text-primary">Điều hành xe chạy</p><h1 class="mt-1 text-2xl font-semibold tracking-tight">Bảng giá xe công nhân</h1><p class="mt-1 text-sm text-muted-foreground">Cước và lương được chốt theo tuyến, biển số và thời hạn hiệu lực.</p></header>
    <DataGrid :data-source="dataSource" :columns="columns" :get-row-id="(rate) => String(rate.id)" :pagination="{ mode: 'client', pageSize: 25 }" filtering-mode="client" sorting-mode="client" filter-row global-filter height="calc(100svh - 260px)" :persist="{ key: 'worker-vehicle-rates', url: true }" empty-title="Chưa có bảng giá" empty-description="Bảng giá có hiệu lực sẽ xuất hiện tại đây." @retry="load">
      <template #toolbar-end><Button size="sm" variant="outline" :disabled="isLoading" @click="load"><RefreshCw class="size-4" :class="isLoading ? 'animate-spin' : ''" />Làm mới</Button></template>
    </DataGrid>
  </section>
</template>

<script setup lang="ts">
import { VehicleOperationsService, type WorkerRate } from '@/services/vehicle-operations.service'
import { DataGrid, type DataGridColumnDef, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { RefreshCw } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

const rates = ref<WorkerRate[]>([])
const isLoading = ref(false)
const money = (value: string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))
const columns: DataGridColumnDef<WorkerRate>[] = [
  { accessorKey: 'route_name', header: 'Tuyến', width: 220, fixed: 'left', cell: ({ row }) => row.original.route_name ?? '—', meta: { label: 'Tuyến' } },
  { accessorKey: 'license_plate', header: 'Biển số', width: 145, meta: { label: 'Biển số' } },
  { accessorKey: 'freight_amount', header: 'Cước', width: 160, align: 'right', cell: ({ row }) => money(row.original.freight_amount), meta: { label: 'Cước' } },
  { accessorKey: 'driver_wage', header: 'Lương lái', width: 160, align: 'right', cell: ({ row }) => money(row.original.driver_wage), meta: { label: 'Lương lái' } },
  { accessorKey: 'effective_from', header: 'Hiệu lực từ', width: 140, meta: { label: 'Hiệu lực từ' } },
  { accessorKey: 'effective_to', header: 'Hiệu lực đến', width: 150, cell: ({ row }) => row.original.effective_to ?? 'Không thời hạn', meta: { label: 'Hiệu lực đến' } },
]
const dataSource = computed<DataGridDataSource<WorkerRate>>(() => ({ data: rates.value, isLoading: isLoading.value }))
async function load() { isLoading.value = true; try { rates.value = await VehicleOperationsService.rates() } finally { isLoading.value = false } }
onMounted(load)
</script>
