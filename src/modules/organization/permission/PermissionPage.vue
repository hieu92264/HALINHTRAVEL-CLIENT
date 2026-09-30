<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { DataGrid, type DataGridColumnDef, type DataGridDataSource } from '@/shared/components/data-grid'
import { PermissionService, type PermissionRow } from '@/services/permission.service'
const query = useQuery({ queryKey: ['permissions'], queryFn: PermissionService.getPermissions })
const dataSource = computed<DataGridDataSource<PermissionRow>>(() => ({ data: query.data.value ?? [], isLoading: query.isLoading.value, isFetching: query.isFetching.value, error: query.error.value }))
const columns: DataGridColumnDef<PermissionRow>[] = [
  { accessorKey: 'name', header: 'Mã quyền', meta: { label: 'Mã quyền' } },
  { accessorKey: 'is_system', header: 'Loại', cell: ({ getValue }) => getValue() ? 'Hệ thống' : 'Tùy chỉnh', meta: { label: 'Loại' } },
  { accessorKey: 'is_active', header: 'Trạng thái', cell: ({ getValue }) => getValue() ? 'Đang dùng' : 'Ngừng dùng', meta: { label: 'Trạng thái' } },
]</script>
<template><section class="space-y-5"><header><h1 class="text-2xl font-semibold">Quyền</h1><p class="mt-1 text-sm text-muted-foreground">Danh mục mã quyền áp dụng toàn hệ thống.</p></header><DataGrid :columns="columns" :data-source="dataSource" :pagination="{ mode: 'client', pageSize: 10 }" filtering-mode="client" sorting-mode="client" filter-row global-filter :get-row-id="(row) => String(row.id)" @retry="query.refetch()" /></section></template>
