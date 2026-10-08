<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Hợp đồng</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý hợp đồng thuê xe và trạng thái thực hiện.
        </p>
      </div>
      <Button v-if="canManage" @click="router.push({ name: 'contracts-create' })"
        ><Plus class="size-4" />Tạo hợp đồng</Button
      >
    </header>
    <DataGrid
      :data-source="dataSource"
      :columns="contractColumns"
      width="100%"
      height="calc(100svh - 250px)"
      :pagination="{ mode: 'client', pageSize: 10, pageSizeOptions: [10, 25, 50] }"
      filtering-mode="client"
      sorting-mode="client"
      :filter-row="isFilterRowVisible"
      global-filter
      show-actions
      :get-row-id="(contract) => String(contract.id)"
      :persist="{ key: 'contracts', url: true, queryPrefix: 'contract' }"
      empty-title="Chưa có hợp đồng"
      empty-description="Hợp đồng được tạo từ báo giá đã duyệt hoặc tạo độc lập sẽ hiển thị tại đây."
      @retry="query.refetch()"
    >
      <template #toolbar-start
        ><Button
          variant="outline"
          :class="
            isFilterRowVisible
              ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
              : ''
          "
          @click="isFilterRowVisible = !isFilterRowVisible"
          ><Filter class="size-4" />Lọc</Button
        ></template
      >
      <template #actions="{ row }">
        <DropdownMenu
          ><DropdownMenuTrigger as-child
            ><Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop
              ><span class="sr-only">Mở thao tác hợp đồng</span
              ><MoreHorizontal class="size-4" /></Button></DropdownMenuTrigger
          ><DropdownMenuContent align="end"
            ><DropdownMenuLabel>Thao tác</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem
              class="min-w-44 gap-2"
              @click="router.push({ name: 'contracts-detail', params: { id: row.id } })"
              ><Eye class="size-4" />Xem chi tiết</DropdownMenuItem
            >
            <DropdownMenuItem
              v-if="canManage && row.status === 'draft'"
              class="min-w-44 gap-2"
              @click="router.push({ name: 'contracts-edit', params: { id: row.id } })"
              ><PencilLine class="size-4" />Sửa</DropdownMenuItem
            >
            <DropdownMenuItem
              v-if="canManage && row.status === 'draft'"
              class="min-w-44 gap-2"
              @click="openConfirmation(row.id, row.contract_no, 'activate')"
              ><CircleCheck class="size-4" />Kích hoạt</DropdownMenuItem
            >
            <DropdownMenuItem
              v-if="canManage && row.status === 'active'"
              class="min-w-44 gap-2"
              @click="openConfirmation(row.id, row.contract_no, 'complete')"
              ><BadgeCheck class="size-4" />Hoàn thành</DropdownMenuItem
            >
            <DropdownMenuItem
              v-if="canManage && (row.status === 'draft' || row.status === 'active')"
              class="min-w-44 gap-2"
              @click="openConfirmation(row.id, row.contract_no, 'cancel')"
              ><Ban class="size-4" />Hủy hợp đồng</DropdownMenuItem
            >
            <DropdownMenuItem
              v-if="canManage && row.status === 'draft'"
              variant="destructive"
              class="min-w-44 gap-2"
              @click="openConfirmation(row.id, row.contract_no, 'remove')"
              ><Trash2 class="size-4" />Ngừng hoạt động</DropdownMenuItem
            >
          </DropdownMenuContent></DropdownMenu
        >
      </template>
    </DataGrid>
  </section>
  <AccessDialog
    :open="confirmation !== null"
    :title="confirmationCopy.title"
    :description="confirmationCopy.description"
    :confirm-label="confirmationCopy.confirmLabel"
    cancel-label="Quay lại"
    :destructive="confirmationCopy.destructive"
    :pending="isConfirmationPending"
    @close="closeConfirmation"
    @confirm="confirmAction"
  />
</template>
<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { useContractMutations, useContractsQuery } from '@/modules/contract/contract.composables'
import { contractColumns } from '@/modules/contract/components/contract-column'
import type { Contract } from '@/modules/contract/contract.types'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { ApiError } from '@/shared/lib/api-error'
import {
  BadgeCheck,
  Ban,
  CircleCheck,
  Eye,
  Filter,
  MoreHorizontal,
  PencilLine,
  Plus,
  Trash2,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
const router = useRouter()
const auth = useAuthStore()
const query = useContractsQuery()
const mutations = useContractMutations()
const isFilterRowVisible = ref(true)
const canManage = computed(() => auth.user?.permissions.includes('contracts.manage') ?? false)
const dataSource = computed<DataGridDataSource<Contract>>(() => ({
  data: query.data.value ?? [],
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))
const message = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback
type ContractAction = 'activate' | 'complete' | 'cancel' | 'remove'
const confirmation = ref<{ id: number; contractNo: string; action: ContractAction } | null>(null)
const confirmationCopy = computed(() => {
  const contractNo = confirmation.value?.contractNo ?? 'hợp đồng này'
  switch (confirmation.value?.action) {
    case 'activate':
      return {
        title: 'Kích hoạt hợp đồng',
        description: `Hợp đồng ${contractNo} sẽ được chuyển sang trạng thái đang hiệu lực.`,
        confirmLabel: 'Kích hoạt',
        destructive: false,
      }
    case 'complete':
      return {
        title: 'Hoàn thành hợp đồng',
        description: `Hợp đồng ${contractNo} sẽ được đánh dấu hoàn thành.`,
        confirmLabel: 'Hoàn thành',
        destructive: false,
      }
    case 'cancel':
      return {
        title: 'Hủy hợp đồng',
        description: `Hợp đồng ${contractNo} sẽ bị hủy và không thể tiếp tục thực hiện.`,
        confirmLabel: 'Hủy hợp đồng',
        destructive: true,
      }
    case 'remove':
      return {
        title: 'Ngừng hoạt động hợp đồng',
        description: `Hợp đồng nháp ${contractNo} sẽ bị ngừng hoạt động.`,
        confirmLabel: 'Ngừng hoạt động',
        destructive: true,
      }
    default:
      return { title: '', description: '', confirmLabel: '', destructive: false }
  }
})
const isConfirmationPending = computed(() => {
  switch (confirmation.value?.action) {
    case 'activate':
      return mutations.activate.isPending.value
    case 'complete':
      return mutations.complete.isPending.value
    case 'cancel':
      return mutations.cancel.isPending.value
    case 'remove':
      return mutations.remove.isPending.value
    default:
      return false
  }
})
function openConfirmation(id: number, contractNo: string, action: ContractAction) {
  confirmation.value = { id, contractNo, action }
}
function closeConfirmation() {
  if (!isConfirmationPending.value) confirmation.value = null
}
async function confirmAction() {
  const selected = confirmation.value
  if (!selected) return
  try {
    if (selected.action === 'remove') {
      await mutations.remove.mutateAsync(selected.id)
      toast.success('Đã ngừng hoạt động hợp đồng.')
      return
    }
    await mutations[selected.action].mutateAsync(selected.id)
    toast.success(
      selected.action === 'activate'
        ? 'Đã kích hoạt hợp đồng.'
        : selected.action === 'complete'
          ? 'Đã hoàn thành hợp đồng.'
          : 'Đã hủy hợp đồng.',
    )
  } catch (error) {
    toast.error(message(error, 'Không thể cập nhật hợp đồng.'))
  } finally {
    confirmation.value = null
  }
}
</script>
