<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Tài chính và công nợ</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Ghi nhận thu, chi, thanh toán đối tác và đối soát công nợ.
        </p>
      </div>
      <Button v-if="canManage && activeTab !== 'debts'" @click="openCreate"
        ><Plus class="size-4" />{{ createLabel }}</Button
      >
    </header>

    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="h-auto max-w-full flex-wrap justify-start"
        ><TabsTrigger value="receipts">Phiếu thu</TabsTrigger
        ><TabsTrigger value="expenses">Chi phí</TabsTrigger
        ><TabsTrigger value="payments">Chi trả đối tác</TabsTrigger
        ><TabsTrigger value="debts">Công nợ nhanh</TabsTrigger></TabsList
      >
      <TabsContent value="receipts"
        ><DataGrid
          :data-source="receiptSource"
          :columns="receiptColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-receipts', url: true, queryPrefix: 'receipt' }"
          empty-title="Chưa có phiếu thu"
          empty-description="Tạo phiếu thu khi nhận đặt cọc hoặc thanh toán hợp đồng."
          @retry="receipts.refetch()"
          ><template #toolbar-start
            ><Button variant="outline" @click="showFilters = !showFilters"
              ><Filter class="size-4" />{{ showFilters ? 'Ẩn bộ lọc' : 'Lọc' }}</Button
            ></template
          ><template #actions="{ row }"
            ><DocumentActions
              :locked="row.is_locked"
              :manage="canManage"
              @edit="openEdit('receipt', row)"
              @lock="ask('lock-receipt', row)"
              @remove="ask('delete-receipt', row)" /></template></DataGrid
      ></TabsContent>
      <TabsContent value="expenses"
        ><DataGrid
          :data-source="expenseSource"
          :columns="expenseColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-expenses', url: true, queryPrefix: 'expense' }"
          empty-title="Chưa có chi phí"
          empty-description="Chi phí xe, chuyến và chi phí chung sẽ được đối soát tại đây."
          @retry="expenses.refetch()"
          ><template #toolbar-start
            ><Button variant="outline" @click="showFilters = !showFilters"
              ><Filter class="size-4" />{{ showFilters ? 'Ẩn bộ lọc' : 'Lọc' }}</Button
            ></template
          ><template #actions="{ row }"
            ><DocumentActions
              :locked="row.is_locked"
              :manage="canManage"
              @edit="openEdit('expense', row)"
              @lock="ask('lock-expense', row)"
              @remove="ask('delete-expense', row)" /></template></DataGrid
      ></TabsContent>
      <TabsContent value="payments"
        ><DataGrid
          :data-source="paymentSource"
          :columns="partnerPaymentColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-partner-payments', url: true, queryPrefix: 'partnerPayment' }"
          empty-title="Chưa có phiếu chi đối tác"
          empty-description="Các khoản chi cho đối tác vận tải sẽ hiển thị tại đây."
          @retry="payments.refetch()"
          ><template #toolbar-start
            ><Button variant="outline" @click="showFilters = !showFilters"
              ><Filter class="size-4" />{{ showFilters ? 'Ẩn bộ lọc' : 'Lọc' }}</Button
            ></template
          ><template #actions="{ row }"
            ><DocumentActions
              :locked="row.is_locked"
              :manage="canManage"
              @edit="openEdit('partner-payment', row)"
              @lock="ask('lock-payment', row)"
              @remove="ask('delete-payment', row)" /></template></DataGrid
      ></TabsContent>
      <TabsContent value="debts" class="space-y-4"
        ><div class="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
          <label class="grid gap-1 text-sm"
            >Từ ngày<Input v-model="debtFilter.from_date" type="date" /></label
          ><label class="grid gap-1 text-sm"
            >Đến ngày<Input v-model="debtFilter.to_date" type="date" /></label
          ><Button variant="outline" @click="refetchDebts"
            ><RefreshCw class="size-4" />Cập nhật</Button
          >
          <p class="ml-auto text-sm text-muted-foreground">
            Số liệu đối soát theo phản hồi báo cáo, không tính từ bảng đang hiển thị.
          </p>
        </div>
        <Tabs v-model="debtTab"
          ><TabsList
            ><TabsTrigger value="customer">Khách hàng</TabsTrigger
            ><TabsTrigger value="partner">Đối tác</TabsTrigger></TabsList
          ><TabsContent value="customer"
            ><DataGrid
              :data-source="customerDebtSource"
              :columns="debtColumns"
              :pagination="pagination"
              filter-row
              global-filter
              :get-row-id="(row, index) => String(row.id ?? row.customer_id ?? index)"
              empty-title="Không có dữ liệu trong kỳ"
              empty-description="Thử thay đổi khoảng thời gian hoặc kiểm tra dữ liệu nguồn."
              @retry="customerDebts.refetch()" /></TabsContent
          ><TabsContent value="partner"
            ><DataGrid
              :data-source="partnerDebtSource"
              :columns="debtColumns"
              :pagination="pagination"
              filter-row
              global-filter
              :get-row-id="(row, index) => String(row.id ?? row.partner_id ?? index)"
              empty-title="Không có dữ liệu trong kỳ"
              empty-description="Thử thay đổi khoảng thời gian hoặc kiểm tra dữ liệu nguồn."
              @retry="partnerDebts.refetch()" /></TabsContent></Tabs
      ></TabsContent>
    </Tabs>
  </section>
  <FinancialDocumentDialog
    :open="dialog !== null"
    :kind="dialog?.kind ?? 'receipt'"
    :row="dialog?.row ?? null"
    :pending="isSaving"
    @close="dialog = null"
    @save="save"
  />
  <AccessDialog
    :open="confirmation !== null"
    :title="confirmationCopy.title"
    :description="confirmationCopy.description"
    :confirm-label="confirmationCopy.confirmLabel"
    cancel-label="Quay lại"
    destructive
    :pending="isActing"
    @close="confirmation = null"
    @confirm="confirm"
  />
</template>

<script setup lang="ts">
import FinancialDocumentDialog from '@/modules/finance/components/FinancialDocumentDialog.vue'
import {
  debtColumns,
  expenseColumns,
  partnerPaymentColumns,
  receiptColumns,
} from '@/modules/finance/components/finance-columns'
import {
  useCustomerDebtsQuery,
  useExpensesQuery,
  useFinanceMutations,
  usePartnerDebtsQuery,
  usePartnerPaymentsQuery,
  useReceiptsQuery,
} from '@/modules/finance/finance.composables'
import type { Expense, PartnerPayment, Receipt } from '@/modules/finance/finance.types'
import { useAuthStore } from '@/modules/auth/auth.store'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Filter, PencilLine, Plus, RefreshCw, Trash2, LockKeyhole } from '@lucide/vue'
import { computed, defineComponent, h, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'

type Kind = 'receipt' | 'expense' | 'partner-payment'
type Row = Receipt | Expense | PartnerPayment
type Action =
  | 'lock-receipt'
  | 'delete-receipt'
  | 'lock-expense'
  | 'delete-expense'
  | 'lock-payment'
  | 'delete-payment'
const auth = useAuthStore()
const receipts = useReceiptsQuery()
const expenses = useExpensesQuery()
const payments = usePartnerPaymentsQuery()
const mutations = useFinanceMutations()
const activeTab = ref('receipts')
const debtTab = ref('customer')
const showFilters = ref(true)
const debtFilter = reactive({ from_date: '', to_date: '' })
const debtParams = computed(() => ({ ...debtFilter }))
const customerDebts = useCustomerDebtsQuery(() => debtParams.value)
const partnerDebts = usePartnerDebtsQuery(() => debtParams.value)
const dialog = ref<{ kind: Kind; row: Row | null } | null>(null)
const confirmation = ref<{ action: Action; row: Row } | null>(null)
const canManage = computed(
  () =>
    auth.user?.permissions.some((permission) =>
      ['receipts.manage', 'expenses.manage', 'partner-payments.manage'].includes(permission),
    ) ?? false,
)
const pagination = { mode: 'client' as const, pageSize: 15, pageSizeOptions: [15, 25, 50] }
const source = <T,>(query: {
  data: { value: T[] | undefined }
  isLoading: { value: boolean }
  isFetching: { value: boolean }
  error: { value: unknown }
}) =>
  computed<DataGridDataSource<T>>(() => ({
    data: query.data.value ?? [],
    isLoading: query.isLoading.value,
    isFetching: query.isFetching.value,
    error: query.error.value,
  }))
const receiptSource = source(receipts)
const expenseSource = source(expenses)
const paymentSource = source(payments)
const customerDebtSource = source(customerDebts)
const partnerDebtSource = source(partnerDebts)
const createLabel = computed(
  () =>
    ({ receipts: 'Tạo phiếu thu', expenses: 'Tạo chi phí', payments: 'Tạo phiếu chi' })[
      activeTab.value
    ] ?? '',
)
const isSaving = computed(
  () =>
    mutations.createReceipt.isPending.value ||
    mutations.updateReceipt.isPending.value ||
    mutations.createExpense.isPending.value ||
    mutations.updateExpense.isPending.value ||
    mutations.createPartnerPayment.isPending.value ||
    mutations.updatePartnerPayment.isPending.value,
)
const isActing = computed(() =>
  Object.values(mutations).some((mutation) => mutation.isPending.value),
)
const confirmationCopy = computed(() =>
  confirmation.value?.action.startsWith('lock')
    ? {
        title: 'Khóa chứng từ',
        description:
          'Sau khi khóa, chứng từ chỉ được xem và không thể chỉnh sửa hoặc ngừng hoạt động.',
        confirmLabel: 'Khóa chứng từ',
      }
    : {
        title: 'Ngừng hoạt động chứng từ',
        description:
          'Chứng từ sẽ không còn xuất hiện trong các danh sách nghiệp vụ đang hoạt động.',
        confirmLabel: 'Ngừng hoạt động',
      },
)
const DocumentActions = defineComponent({
  props: { locked: Boolean, manage: Boolean },
  emits: ['edit', 'lock', 'remove'],
  setup(props, { emit }) {
    return () =>
      h(
        'div',
        { class: 'flex h-full items-center justify-center gap-1' },
        props.manage
          ? [
              !props.locked &&
                h(
                  Button,
                  { variant: 'ghost', size: 'icon-xs', title: 'Sửa', onClick: () => emit('edit') },
                  () => h(PencilLine, { class: 'size-4' }),
                ),
              !props.locked &&
                h(
                  Button,
                  { variant: 'ghost', size: 'icon-xs', title: 'Khóa', onClick: () => emit('lock') },
                  () => h(LockKeyhole, { class: 'size-4' }),
                ),
              !props.locked &&
                h(
                  Button,
                  {
                    variant: 'ghost',
                    size: 'icon-xs',
                    title: 'Ngừng hoạt động',
                    onClick: () => emit('remove'),
                  },
                  () => h(Trash2, { class: 'size-4 text-destructive' }),
                ),
            ]
          : [],
      )
  },
})
function openCreate() {
  dialog.value = {
    kind:
      activeTab.value === 'payments' ? 'partner-payment' : (activeTab.value.slice(0, -1) as Kind),
    row: null,
  }
}
function openEdit(kind: Kind, row: Row) {
  dialog.value = { kind, row }
}
function ask(action: Action, row: Row) {
  confirmation.value = { action, row }
}
function refetchDebts() {
  void Promise.all([customerDebts.refetch(), partnerDebts.refetch()])
}
async function save(data: Record<string, unknown>) {
  const current = dialog.value
  if (!current) return
  try {
    if (current.kind === 'receipt')
      current.row
        ? await mutations.updateReceipt.mutateAsync({ id: current.row.id, data })
        : await mutations.createReceipt.mutateAsync(data as never)
    else if (current.kind === 'expense')
      current.row
        ? await mutations.updateExpense.mutateAsync({ id: current.row.id, data })
        : await mutations.createExpense.mutateAsync(data as never)
    else
      current.row
        ? await mutations.updatePartnerPayment.mutateAsync({ id: current.row.id, data })
        : await mutations.createPartnerPayment.mutateAsync(data as never)
    toast.success(current.row ? 'Đã cập nhật chứng từ.' : 'Đã tạo chứng từ.')
    dialog.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu chứng từ.')
  }
}
async function confirm() {
  const selected = confirmation.value
  if (!selected) return
  try {
    const lock = selected.action.startsWith('lock')
    if (selected.action.endsWith('receipt'))
      await (lock ? mutations.lockReceipt : mutations.deleteReceipt).mutateAsync(selected.row.id)
    else if (selected.action.endsWith('expense'))
      await (lock ? mutations.lockExpense : mutations.deleteExpense).mutateAsync(selected.row.id)
    else
      await (lock ? mutations.lockPartnerPayment : mutations.deletePartnerPayment).mutateAsync(
        selected.row.id,
      )
    toast.success(lock ? 'Đã khóa chứng từ.' : 'Đã ngừng hoạt động chứng từ.')
    confirmation.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể cập nhật chứng từ.')
  }
}
</script>
