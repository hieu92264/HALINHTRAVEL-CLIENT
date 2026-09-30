<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { DataGrid, type DataGridColumnDef, type DataGridDataSource } from '@/shared/components/data-grid'
import { RoleService, type RoleRow } from '@/services/role.service'
import { Button } from '@/shared/components/ui/button'

const router = useRouter()
const query = useQuery({ queryKey: ['roles'], queryFn: RoleService.getRoles })
const dataSource = computed<DataGridDataSource<RoleRow>>(() => ({ data: query.data.value ?? [], isLoading: query.isLoading.value, isFetching: query.isFetching.value, error: query.error.value }))
const columns: DataGridColumnDef<RoleRow>[] = [
  { accessorKey: 'name', header: 'Vai trò', meta: { label: 'Vai trò' } },
  { accessorKey: 'is_system', header: 'Loại', cell: ({ getValue }) => getValue() ? 'Hệ thống' : 'Tùy chỉnh', meta: { label: 'Loại' } },
  { accessorKey: 'is_active', header: 'Trạng thái', cell: ({ getValue }) => getValue() ? 'Đang dùng' : 'Ngừng dùng', meta: { label: 'Trạng thái' } },
  { accessorKey: 'permissions', header: 'Số quyền', cell: ({ getValue }) => `${(getValue() as string[]).length} quyền`, meta: { label: 'Số quyền' } },
]
</script>
<template>
  <section class="space-y-5"><header><h1 class="text-2xl font-semibold">Vai trò</h1><p class="mt-1 text-sm text-muted-foreground">Quản lý nhóm quyền dùng trong vận hành.</p></header>
    <DataGrid :columns="columns" :data-source="dataSource" :pagination="{ mode: 'client', pageSize: 10 }" filtering-mode="client" sorting-mode="client" filter-row global-filter show-actions :get-row-id="(row) => String(row.id)" @retry="query.refetch()">
      <template #actions="{ row }"><Button size="xs" variant="ghost" @click="router.push({ name: 'role-detail', params: { id: row.id } })">Xem</Button></template>
    </DataGrid>
  </section>
</template>
