<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Eye, MoreHorizontal, PencilLine, Trash2 } from '@lucide/vue'
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
import { RoleService, type RoleRow } from '@/services/role.service'

const router = useRouter()
const client = useQueryClient()

const query = useQuery({
  queryKey: ['roles'],
  queryFn: RoleService.getRoles,
})

const name = ref('')
const edit = ref<RoleRow | null>(null)
const removeRow = ref<RoleRow | null>(null)
const form = ref(false)
const error = ref('')

const data = computed<DataGridDataSource<RoleRow>>(() => ({
  data: query.data.value ?? [],
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))

const columns: DataGridColumnDef<RoleRow>[] = [
  { accessorKey: 'name', header: 'Vai trò' },
  {
    accessorKey: 'is_system',
    header: 'Loại',
    cell: ({ getValue }) => (getValue() ? 'Hệ thống' : 'Tùy chỉnh'),
  },
  {
    accessorKey: 'permissions',
    header: 'Số quyền',
    cell: ({ getValue }) => `${(getValue() as string[]).length} quyền`,
  },
]

const save = useMutation({
  mutationFn: () =>
    edit.value
      ? RoleService.updateRole(edit.value.id, { name: name.value })
      : RoleService.createRole({ name: name.value }),
  onSuccess: async () => {
    form.value = false
    toast.success('Đã lưu vai trò.')
    await client.invalidateQueries({ queryKey: ['roles'] })
  },
  onError: (e) => {
    error.value = e instanceof Error ? e.message : 'Không thể lưu.'
  },
})

const remove = useMutation({
  mutationFn: () => RoleService.deleteRole(removeRow.value!.id),
  onSuccess: async () => {
    removeRow.value = null
    toast.success('Đã xóa vai trò.')
    await client.invalidateQueries({ queryKey: ['roles'] })
  },
})

function open(row?: RoleRow) {
  edit.value = row ?? null
  name.value = row?.name ?? ''
  error.value = ''
  form.value = true
}

function submit() {
  if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/.test(name.value)) {
    error.value = 'Tên vai trò không hợp lệ.'
    return
  }

  save.mutate()
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Vai trò</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý nhóm quyền dùng trong vận hành.
        </p>
      </div>
      <Button @click="open()">Thêm vai trò</Button>
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
      :get-row-id="(role) => String(role.id)"
      @retry="query.refetch()"
    >
      <template #actions="{ row }">
        <!-- Vai trò hệ thống: chỉ có nút Xem → hiển thị trực tiếp -->
        <Button
          v-if="row.is_system"
          variant="ghost"
          size="sm"
          class="h-full min-h-11.5 w-full rounded-none p-0 text-[13px]"
          @click.stop="router.push({ name: 'role-detail', params: { id: row.id } })"
        >
          Xem
        </Button>

        <!-- Vai trò tùy chỉnh: nhiều thao tác → dropdown 3 chấm -->
        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop>
              <span class="sr-only">Mở thao tác vai trò</span>
              <MoreHorizontal class="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="min-w-40 gap-2"
              @click="router.push({ name: 'role-detail', params: { id: row.id } })"
            >
              <Eye class="size-4" />
              Xem
            </DropdownMenuItem>
            <DropdownMenuItem class="min-w-40 gap-2" @click="open(row)">
              <PencilLine class="size-4" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              class="min-w-40 gap-2"
              @click="removeRow = row"
            >
              <Trash2 class="size-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
    </DataGrid>

    <AccessDialog
      :open="form"
      :title="edit ? 'Sửa vai trò' : 'Thêm vai trò'"
      :pending="save.isPending.value"
      @close="form = false"
      @confirm="submit"
    >
      <label class="text-sm font-medium">
        Tên vai trò
        <input
          v-model="name"
          class="mt-1 h-9 w-full rounded-md border bg-background px-3"
          placeholder="dispatcher"
        />
      </label>
      <p v-if="error" class="mt-2 text-sm text-destructive">{{ error }}</p>
    </AccessDialog>

    <AccessDialog
      :open="Boolean(removeRow)"
      title="Xóa vai trò"
      description="Thao tác này không thể hoàn tác."
      confirm-label="Xóa"
      destructive
      :pending="remove.isPending.value"
      @close="removeRow = null"
      @confirm="remove.mutate()"
    />
  </section>
</template>
