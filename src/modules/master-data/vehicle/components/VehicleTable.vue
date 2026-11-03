<template>
  <DataGrid :data-source="dataSource" :columns="vehicleColumns" height="calc(100svh - 250px)" :pagination="{ mode: 'client', pageSize: 25 }" filtering-mode="client" sorting-mode="client" :filter-row="filterVisible" show-actions :get-row-id="(vehicle) => String(vehicle.id)" :persist="{ key: 'master-data-vehicles', url: true }" empty-title="Chưa có xe" empty-description="Danh sách xe sẽ hiển thị tại đây khi có dữ liệu." @retry="vehiclesQuery.refetch()">
    <template #toolbar-start><Button variant="outline" @click="filterVisible = !filterVisible"><Filter class="size-4" />Lọc</Button></template>
    <template #toolbar-end><Button v-if="canManage" @click="emit('create')"><Plus class="size-4" />Thêm xe</Button></template>
    <template #actions="{ row }">
      <DropdownMenu><DropdownMenuTrigger as-child><Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop><span class="sr-only">Mở thao tác xe</span><MoreHorizontal class="size-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end"><DropdownMenuLabel>Thao tác</DropdownMenuLabel><DropdownMenuSeparator />
          <DropdownMenuItem v-if="canManage" class="min-w-40 gap-2" @click="emit('edit', row)"><PencilLine class="size-4" />Cập nhật</DropdownMenuItem>
          <DropdownMenuItem v-if="canManage && row.is_active" variant="destructive" class="min-w-40 gap-2" @click="emit('deactivate', row)"><Trash2 class="size-4" />Ngừng hoạt động</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
import { vehicleColumns } from './vehicle-column'
import { useVehicleQuery } from '@/modules/master-data/vehicle/composables/useVehicleQueries'
import type { Vehicle } from '@/modules/master-data/master-data.type'
import { useAuthStore } from '@/modules/auth/auth.store'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { Filter, MoreHorizontal, PencilLine, Plus, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'

const emit = defineEmits<{ create: []; edit: [vehicle: Vehicle]; deactivate: [vehicle: Vehicle] }>()
const vehiclesQuery = useVehicleQuery()
const auth = useAuthStore()
const filterVisible = ref(true)
const canManage = computed(() => auth.user?.permissions.includes('vehicles.manage') ?? false)
const dataSource = computed<DataGridDataSource<Vehicle>>(() => ({ data: vehiclesQuery.data.value ?? [], isLoading: vehiclesQuery.isLoading.value, isFetching: vehiclesQuery.isFetching.value, error: vehiclesQuery.error.value }))
</script>
