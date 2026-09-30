<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { useUserQuery } from '../composables/useUserQueries'
import { useUserMutations } from '../composables/useUserMutations'
import { userColumns } from '@/modules/organization/user/components/user-column'
import type { UserRow } from '@/services/user.service'
import UserForm from './UserForm.vue'

const usersQuery = useUserQuery()
const router = useRouter()
const { toggleActive } = useUserMutations()

const dataSource = computed<DataGridDataSource<UserRow>>(() => ({
  data: usersQuery.data.value ?? [],
  isLoading: usersQuery.isLoading.value,
  isFetching: usersQuery.isFetching.value,
  error: usersQuery.error.value,
}))

/* ---------- form sửa ---------- */
const formOpen = ref(false)
const editingUser = ref<UserRow | null>(null)

function openEdit(user: UserRow) {
  editingUser.value = user
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editingUser.value = null
}

/* ---------- toggle active confirm ---------- */
const confirmUser = ref<UserRow | null>(null)

function openConfirmToggle(user: UserRow) {
  confirmUser.value = user
}

function doToggle() {
  if (!confirmUser.value) return
  toggleActive.mutate(
    { user: confirmUser.value },
    { onSettled: () => { confirmUser.value = null } },
  )
}
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
    show-actions
    :get-row-id="(user) => String(user.id)"
    :persist="{ key: 'organization-users', url: true }"
    empty-title="Chưa có tài khoản"
    empty-description="Danh sách tài khoản sẽ hiển thị tại đây khi có dữ liệu."
    @retry="usersQuery.refetch()"
  >
    <template #actions="{ row }">
      <Button
        size="xs"
        variant="ghost"
        @click="router.push({ name: 'user-detail', params: { id: row.id } })"
      >
        Xem
      </Button>
      <Button size="xs" variant="ghost" @click="openEdit(row)">Sửa</Button>
      <Button
        size="xs"
        variant="ghost"
        :class="row.is_active ? 'text-destructive hover:text-destructive' : 'text-[#2F8A68] hover:text-[#2F8A68]'"
        @click="openConfirmToggle(row)"
      >
        {{ row.is_active ? 'Vô hiệu hoá' : 'Kích hoạt' }}
      </Button>
    </template>
  </DataGrid>

  <!-- Form sửa tài khoản -->
  <UserForm :open="formOpen" :user="editingUser" @close="closeForm" />

  <!-- Confirm toggle trạng thái -->
  <AccessDialog
    :open="Boolean(confirmUser)"
    :title="confirmUser?.is_active ? 'Vô hiệu hoá tài khoản' : 'Kích hoạt tài khoản'"
    :description="
      confirmUser?.is_active
        ? `Tài khoản «${confirmUser?.user_name}» sẽ bị vô hiệu hoá và không thể đăng nhập.`
        : `Tài khoản «${confirmUser?.user_name}» sẽ được kích hoạt trở lại.`
    "
    :confirm-label="confirmUser?.is_active ? 'Vô hiệu hoá' : 'Kích hoạt'"
    :destructive="confirmUser?.is_active ?? false"
    :pending="toggleActive.isPending.value"
    @close="confirmUser = null"
    @confirm="doToggle"
  />
</template>
