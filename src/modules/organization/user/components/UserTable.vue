<script setup lang="ts">
import { computed } from 'vue'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import { useUserQuery } from '../composables/useUserQueries'
import { userColumns } from '@/modules/organization/user/components/user-column'
import type { UserRow } from '@/services/user.service'

const usersQuery = useUserQuery()
const dataSource = computed<DataGridDataSource<UserRow>>(() => ({
  data: usersQuery.data.value?.data ?? [],
  isLoading: usersQuery.isLoading.value,
  isFetching: usersQuery.isFetching.value,
  error: usersQuery.error.value,
}))
</script>

<template>
  <DataGrid
    :columns="userColumns"
    :data-source="dataSource"
    width="100%"
    height="calc(100svh - 250px)"
    :pagination="{ mode: 'client', pageSize: 10 }"
    filtering-mode="client"
    sorting-mode="client"
    filter-row
    global-filter
    :get-row-id="(user) => String(user.id)"
    :persist="{ key: 'organization-users', url: true }"
    empty-title="Chưa có tài khoản"
    empty-description="Danh sách tài khoản sẽ hiển thị tại đây khi có dữ liệu."
    @retry="usersQuery.refetch()"
  />
</template>
