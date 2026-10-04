<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { MoreHorizontal, PencilLine, Trash2 } from '@lucide/vue'
import { DataGrid, type DataGridColumnDef, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { PermissionService, type PermissionRow } from '@/services/permission.service'

const queryClient = useQueryClient()

const query = useQuery({
  queryKey: ['permissions'],
  queryFn: PermissionService.getPermissions,
})

const name = ref('')
const editing = ref<PermissionRow | null>(null)
const removing = ref<PermissionRow | null>(null)
const formOpen = ref(false)
const error = ref('')

const data = computed<DataGridDataSource<PermissionRow>>(() => ({
  data: query.data.value ?? [],
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))

const columns: DataGridColumnDef<PermissionRow>[] = [
  { accessorKey: 'name', header: 'Mã quyền' },
  {
    accessorKey: 'is_system',
    header: 'Loại',
    cell: ({ getValue }) => (getValue() ? 'Hệ thống' : 'Tùy chỉnh'),
  },
  {
    accessorKey: 'is_active',
    header: 'Trạng thái',
    cell: ({ getValue }) => (getValue() ? 'Đang dùng' : 'Ngừng dùng'),
  },
]

const save = useMutation({
  mutationFn: () =>
    editing.value
      ? PermissionService.updatePermission(editing.value.id, { name: name.value })
      : PermissionService.createPermission({ name: name.value }),
  onSuccess: async () => {
    formOpen.value = false
    toast.success('Đã lưu quyền.')
    await queryClient.invalidateQueries({ queryKey: ['permissions'] })
  },
  onError: (e) => {
    error.value = e instanceof Error ? e.message : 'Không thể lưu.'
  },
})

const remove = useMutation({
  mutationFn: () => PermissionService.deletePermission(removing.value!.id),
  onSuccess: async () => {
    removing.value = null
    toast.success('Đã xóa quyền.')
    await queryClient.invalidateQueries({ queryKey: ['permissions'] })
  },
})

function open(row?: PermissionRow) {
  editing.value = row ?? null
  name.value = row?.name ?? ''
  error.value = ''
  formOpen.value = true
}

function submit() {
  if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/.test(name.value)) {
    error.value = 'Mã quyền phải có ít nhất một dấu chấm.'
    return
  }
  save.mutate()
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Quyền</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Danh mục mã quyền áp dụng toàn hệ thống.
        </p>
      </div>
      <Button @click="open()">Thêm quyền</Button>
    </header>

    <DataGrid
      :columns="columns"
      :data-source="data"
      :pagination="{ mode: 'client', pageSize: 10 }"
      filtering-mode="client"
      sorting-mode="client"
      filter-row
      global-filter
      show-actions
      :get-row-id="(r) => String(r.id)"
      @retry="query.refetch()"
    >
      <template #actions="{ row }">
        <!-- Quyền hệ thống: không có thao tác -->
        <span v-if="row.is_system" class="flex h-full min-h-11.5 w-full items-center justify-center text-xs text-muted-foreground">Hệ thống</span>

        <!-- Quyền tùy chỉnh: nhiều thao tác → dropdown 3 chấm -->
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop>
              <span class="sr-only">Mở thao tác quyền</span>
              <MoreHorizontal class="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="min-w-40 gap-2" @click="open(row)">
              <PencilLine class="size-4" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              class="min-w-40 gap-2"
              @click="removing = row"
            >
              <Trash2 class="size-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
    </DataGrid>

    <AccessDialog
      :open="formOpen"
      :title="editing ? 'Sửa quyền' : 'Thêm quyền'"
      :pending="save.isPending.value"
      @close="formOpen = false"
      @confirm="submit"
    >
      <label class="text-sm font-medium">
        Mã quyền
        <input
          v-model="name"
          class="mt-1 h-9 w-full rounded-md border bg-background px-3"
          placeholder="customers.view"
        >
      </label>
      <p v-if="error" class="mt-2 text-sm text-destructive">{{ error }}</p>
    </AccessDialog>

    <AccessDialog
      :open="Boolean(removing)"
      title="Xóa quyền"
      description="Thao tác này không thể hoàn tác."
      confirm-label="Xóa"
      destructive
      :pending="remove.isPending.value"
      @close="removing = null"
      @confirm="remove.mutate()"
    />
  </section>
</template>
