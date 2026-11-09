<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Tài chính</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Chứng từ độc lập và đối soát từ xe chạy đã hoàn tất.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="isDownloading" @click="download('pdf')"><Download class="size-4" />Xuất PDF</Button>
        <Button variant="outline" :disabled="isDownloading" @click="download('xlsx')"><Download class="size-4" />Xuất Excel</Button>
        <Button v-if="canManage" @click="openCreate"><Plus class="size-4" />{{ createLabel }}</Button>
      </div>
    </header>
    <Tabs v-model="activeTab" class="space-y-4"
      ><TabsList class="h-auto max-w-full justify-start overflow-x-auto whitespace-nowrap"
        ><TabsTrigger value="receipts">Phiếu thu khách hàng</TabsTrigger
        ><TabsTrigger value="vehicle-expenses">Chi phí xe</TabsTrigger
        ><TabsTrigger value="expenses">Chi phí chung</TabsTrigger
        ><TabsTrigger value="payments">Chi trả chủ xe</TabsTrigger></TabsList
      >
      <TabsContent value="receipts"
        ><DataGrid
          :data-source="receiptSource"
          :columns="receiptColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-receipts', url: true, queryPrefix: 'receipt' }"
          empty-title="Chưa có phiếu thu"
          empty-description="Ghi nhận khoản thu khách hàng trực tiếp tại đây."
          @retry="receipts.refetch()"
          ><template #actions="{ row }"
            ><DocumentActions
              :locked="row.is_locked"
              :manage="canManage"
              @edit="openEdit('receipt', row)"
              @lock="ask('lock-receipt', row)"
              @remove="ask('delete-receipt', row)" /></template></DataGrid
      ></TabsContent>
      <TabsContent value="vehicle-expenses"
        ><DataGrid
          :data-source="vehicleExpenseSource"
          :columns="vehicleExpenseColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-vehicle-expenses-v2', url: true, queryPrefix: 'vehicleExpense' }"
          empty-title="Chưa có chi phí xe"
          empty-description="Ghi nhận dầu, sửa chữa, BH/ĐK và chi phí khác theo xe."
          @retry="expenses.refetch()"
          ><template #actions="{ row }"
            ><DocumentActions
              :locked="row.is_locked"
              :manage="canManage"
              @edit="openEdit('expense', row)"
              @lock="ask('lock-expense', row)"
              @remove="ask('delete-expense', row)" /></template></DataGrid
      ></TabsContent>
      <TabsContent value="expenses"
        ><DataGrid
          :data-source="generalExpenseSource"
          :columns="generalExpenseColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-general-expenses-v2', url: true, queryPrefix: 'generalExpense' }"
          empty-title="Chưa có phiếu chi chung"
          empty-description="Ghi nhận các khoản chi không gắn với lệnh điều xe."
          @retry="expenses.refetch()"
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
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'finance-partner-payments-v2', url: true, queryPrefix: 'partnerPayment' }"
          empty-title="Chưa có phiếu chi đối tác"
          empty-description="Ghi nhận độc lập các khoản chi cho đối tác vận tải."
          @retry="payments.refetch()"
          ><template #actions="{ row }"
            ><DocumentActions
              :locked="row.is_locked"
              :manage="canManage"
              @edit="openEdit('partner-payment', row)"
              @lock="ask('lock-payment', row)"
              @remove="ask('delete-payment', row)" /></template></DataGrid
      ></TabsContent>
    </Tabs>
  </section>
  <FinancialDocumentDialog
    :open="dialog !== null"
    :kind="dialog?.kind ?? 'receipt'"
    :row="dialog?.row ?? null"
    :pending="isSaving"
    :expense-scope="activeTab === 'vehicle-expenses' ? 'vehicle' : 'general'"
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
import { computed, defineComponent, h, reactive, ref, type PropType } from 'vue'
import { toast } from 'vue-sonner'
import { Download, LockKeyhole, PencilLine, Plus, Trash2 } from '@lucide/vue'
import FinancialDocumentDialog from '@/modules/finance/components/FinancialDocumentDialog.vue'
import {
  debtColumns,
  generalExpenseColumns,
  partnerPaymentColumns,
  receiptColumns,
  vehicleExpenseColumns,
} from '@/modules/finance/components/finance-columns'
import {
  useCustomerDebtsQuery,
  useExpensesQuery,
  useExternalDriverDebtsQuery,
  useFinanceMutations,
  usePartnerDebtsQuery,
  usePartnerPaymentsQuery,
  useReceiptsQuery,
} from '@/modules/finance/finance.composables'
import type { DebtRow, Expense, PartnerPayment, Receipt } from '@/modules/finance/finance.types'
import { useAuthStore } from '@/modules/auth/auth.store'
import { FinanceService } from '@/services/finance.service'
import { downloadFile } from '@/shared/lib/download-file'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
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
const downloading = ref(false)
const debtTab = ref('customer')
const now = new Date()
const debtFilter = reactive({
  from_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
  to_date: now.toISOString().slice(0, 10),
})
const debtParams = computed(() => ({ ...debtFilter }))
const customerDebts = useCustomerDebtsQuery(() => debtParams.value)
const partnerDebts = usePartnerDebtsQuery(() => debtParams.value)
const externalDriverDebts = useExternalDriverDebtsQuery(() => debtParams.value)
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
const vehicleExpenseSource = computed<DataGridDataSource<Expense>>(() => ({
  ...expenseSource.value,
  data: (expenses.data.value ?? []).filter((item) => item.expense_scope === 'vehicle'),
}))
const generalExpenseSource = computed<DataGridDataSource<Expense>>(() => ({
  ...expenseSource.value,
  data: (expenses.data.value ?? []).filter((item) => item.expense_scope === 'general'),
}))
const paymentSource = source(payments)
const customerDebtSource = source(customerDebts)
const partnerDebtSource = source(partnerDebts)
const externalDriverDebtSource = source(externalDriverDebts)
const createLabel = computed(
  () =>
    ({
      receipts: 'Tạo phiếu thu',
      expenses: 'Tạo chi phí chung',
      'vehicle-expenses': 'Tạo chi phí xe',
      payments: 'Tạo chi trả đối tác',
    })[activeTab.value] ?? '',
)
const exportTable = computed(() => ({ receipts: 'receipts', 'vehicle-expenses': 'vehicle-expenses', expenses: 'general-expenses', payments: 'partner-payments' })[activeTab.value] as 'receipts' | 'vehicle-expenses' | 'general-expenses' | 'partner-payments')
const isDownloading = computed(() => downloading.value)
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
        description: 'Chứng từ sẽ không còn xuất hiện trong danh sách nghiệp vụ đang hoạt động.',
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
        props.manage && !props.locked
          ? [
              h(
                Button,
                { variant: 'ghost', size: 'icon-xs', title: 'Sửa', onClick: () => emit('edit') },
                () => h(PencilLine, { class: 'size-4' }),
              ),
              h(
                Button,
                { variant: 'ghost', size: 'icon-xs', title: 'Khóa', onClick: () => emit('lock') },
                () => h(LockKeyhole, { class: 'size-4' }),
              ),
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
const DebtGrid = defineComponent({
  props: {
    source: { type: Object as PropType<DataGridDataSource<DebtRow>>, required: true },
    query: { type: Object as PropType<{ refetch: () => unknown }>, required: true },
    idKey: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h(DataGrid as never, {
        dataSource: props.source,
        columns: debtColumns,
        pagination,
        filterRow: true,
        globalFilter: true,
        mobileMode: 'cards',
        getRowId: (row: DebtRow, index: number) =>
          String(row[props.idKey as keyof DebtRow] ?? index),
        emptyTitle: 'Không có dữ liệu trong kỳ',
        emptyDescription: 'Kiểm tra xe chạy hoàn tất và chứng từ trong khoảng thời gian đã chọn.',
        onRetry: () => props.query.refetch(),
      })
  },
})
function openCreate() {
  dialog.value = {
    kind:
      activeTab.value === 'payments'
        ? 'partner-payment'
        : activeTab.value.includes('expense')
          ? 'expense'
          : 'receipt',
    row: null,
  }
}
async function download(format: 'pdf' | 'xlsx') {
  downloading.value = true
  try {
    downloadFile(await FinanceService.downloadExport(exportTable.value, format))
  } catch (error) {
    toast.error(error instanceof Error ? error.message : `Không thể xuất ${format === 'pdf' ? 'PDF' : 'Excel'}.`)
  } finally {
    downloading.value = false
  }
}
function openEdit(kind: Kind, row: Row) {
  dialog.value = { kind, row }
}
function ask(action: Action, row: Row) {
  confirmation.value = { action, row }
}
function refetchDebts() {
  void Promise.all([customerDebts.refetch(), partnerDebts.refetch(), externalDriverDebts.refetch()])
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
