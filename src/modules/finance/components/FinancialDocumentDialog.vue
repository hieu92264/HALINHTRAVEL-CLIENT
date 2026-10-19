<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium">
          Khách hàng
          <select
            v-model.number="form.customer_id"
            required
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option :value="null" disabled>Chọn khách hàng</option>
            <option
              v-for="customer in customers.data.value ?? []"
              :key="customer.id"
              :value="customer.id"
            >
              {{ customer.name }}
            </option>
          </select>
        </label>
        <label v-if="kind === 'expense'" class="grid gap-1.5 text-sm font-medium">
          Loại chi phí
          <select
            v-model.number="form.expense_type_id"
            required
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option :value="null" disabled>Chọn loại chi phí</option>
            <option v-for="type in expenseTypes.data.value ?? []" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </label>
        <label v-if="kind === 'partner-payment'" class="grid gap-1.5 text-sm font-medium">
          Đối tác
          <select
            v-model.number="form.partner_id"
            required
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option :value="null" disabled>Chọn đối tác</option>
            <option
              v-for="partner in partners.data.value ?? []"
              :key="partner.id"
              :value="partner.id"
            >
              {{ partner.name }}
            </option>
          </select>
        </label>

        <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
          >Loại thu
          <select
            v-model="form.receipt_type"
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option value="deposit">Đặt cọc</option>
            <option value="contract_payment">Thanh toán hợp đồng</option>
            <option value="other">Khác</option>
          </select>
        </label>
        <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
          >Hình thức quyết toán
          <select
            v-model="form.settlement_type"
            class="h-10 rounded-md border bg-background px-3 font-normal"
            @change="syncSettlementReferences"
          >
            <option value="standard">Thu thông thường</option>
            <option value="driver_direct_collection">Khách trả trực tiếp cho lái xe</option>
          </select>
        </label>
        <label v-if="kind === 'expense'" class="grid gap-1.5 text-sm font-medium"
          >Phạm vi
          <select
            v-model="form.scope"
            class="h-10 rounded-md border bg-background px-3 font-normal"
            @change="resetExpenseReferences"
          >
            <option value="vehicle">Xe</option>
            <option value="trip">Chuyến xe</option>
            <option value="general">Chi phí chung</option>
          </select>
        </label>
        <label v-if="kind === 'expense'" class="grid gap-1.5 text-sm font-medium"
          >Loại quyết toán
          <select
            v-model="form.settlement_type"
            class="h-10 rounded-md border bg-background px-3 font-normal"
            @change="syncSettlementReferences"
          >
            <option value="standard">Chi phí thông thường</option>
            <option value="driver_reimbursement">Lái xe tự chi</option>
            <option value="external_driver_payment">Chi thuê lái</option>
          </select>
        </label>
        <label class="grid gap-1.5 text-sm font-medium"
          >{{ dateLabel }}<Input v-model="form.date" type="date" required
        /></label>
        <label class="grid gap-1.5 text-sm font-medium"
          >Số tiền<Input
            v-model="form.amount"
            type="number"
            min="0"
            step="1"
            required
            class="tabular-nums"
        /></label>
        <label class="grid gap-1.5 text-sm font-medium"
          >Phương thức
          <select
            v-model="form.payment_method"
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option value="cash">Tiền mặt</option>
            <option value="bank_transfer">Chuyển khoản</option>
          </select>
        </label>
        <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
          >Người nộp<Input v-model="form.payer_name" placeholder="Tên người nộp"
        /></label>
        <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
          >Mã hợp đồng
          <div class="relative">
            <Input
              v-model="contractQuery"
              type="search"
              role="combobox"
              aria-controls="receipt-contract-options"
              :aria-expanded="contractMenuOpen"
              :disabled="!form.customer_id"
              :aria-invalid="Boolean(contractError)"
              :placeholder="form.customer_id ? 'Tìm mã hợp đồng' : 'Chọn khách hàng trước'"
              @focus="openContractMenu"
              @input="searchContracts"
              @keydown.esc="contractMenuOpen = false"
            />
            <button
              v-if="form.contract_id"
              type="button"
              class="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Bỏ chọn hợp đồng"
              @click="clearContract"
            >
              Xóa
            </button>
            <div
              v-if="contractMenuOpen && form.customer_id"
              id="receipt-contract-options"
              role="listbox"
              class="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
            >
              <p v-if="contracts.isLoading.value" class="px-2 py-2 text-sm text-muted-foreground">
                Đang tải hợp đồng...
              </p>
              <p v-else-if="contracts.isError.value" class="px-2 py-2 text-sm text-destructive">
                Không thể tải danh sách hợp đồng.
              </p>
              <p v-else-if="filteredReceiptContracts.length === 0" class="px-2 py-2 text-sm text-muted-foreground">
                Không có hợp đồng phù hợp.
              </p>
              <template v-else>
                <button
                  v-for="contract in filteredReceiptContracts"
                  :key="contract.id"
                  type="button"
                  role="option"
                  :aria-selected="form.contract_id === contract.id"
                  :data-contract-id="contract.id"
                  class="flex w-full items-center rounded-sm px-2 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                  @mousedown.prevent
                  @click="selectContract(contract.id)"
                >
                  {{ contract.contract_no }}
                </button>
              </template>
            </div>
          </div>
          <span v-if="contractError" class="text-xs font-normal text-destructive">{{
            contractError
          }}</span>
        </label>
        <label
          v-if="kind === 'expense' && form.scope === 'vehicle'"
          class="grid gap-1.5 text-sm font-medium"
          >Mã xe<Input v-model="form.vehicle_id" type="number" min="1" required
        /></label>
        <label
          v-if="kind === 'expense' && form.scope === 'trip' && !requiresDriverSettlement"
          class="grid gap-1.5 text-sm font-medium"
          >Mã lệnh điều xe<Input v-model="form.dispatch_order_id" type="number" min="1" required
        /></label>
        <label v-if="requiresDriverSettlement" class="grid gap-1.5 text-sm font-medium"
          >Lệnh điều xe
          <select
            v-model.number="form.dispatch_order_id"
            required
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option :value="undefined" disabled>Chọn lệnh đã hoàn tất</option>
            <option v-for="order in completedOrders" :key="order.id" :value="order.id">
              {{ order.order_no }}
            </option>
          </select>
        </label>
        <label v-if="requiresDriverSettlement" class="grid gap-1.5 text-sm font-medium"
          >Lái xe được phân công
          <select
            v-model.number="form.driver_id"
            required
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option :value="undefined" disabled>Chọn lái xe</option>
            <option v-for="driver in settlementDrivers" :key="driver.id" :value="driver.id">
              {{ driver.code }} — {{ driver.full_name }}
            </option>
          </select>
        </label>
        <label v-if="kind === 'expense'" class="grid gap-1.5 text-sm font-medium"
          >Số hóa đơn<Input v-model="form.document_no" placeholder="Không bắt buộc"
        /></label>
        <label v-if="kind === 'partner-payment'" class="grid gap-1.5 text-sm font-medium"
          >Mã lệnh điều xe<Input
            v-model="form.dispatch_order_id"
            type="number"
            min="1"
            placeholder="Không bắt buộc"
        /></label>
        <label class="grid gap-1.5 text-sm font-medium sm:col-span-2"
          >Diễn giải<textarea
            v-model="form.description"
            rows="3"
            class="rounded-md border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Nội dung chứng từ"
          />
        </label>
        <p
          v-if="kind === 'receipt' && form.contract_id"
          class="rounded-md bg-muted p-3 text-sm text-muted-foreground sm:col-span-2"
        >
          Tổng giá trị, đã thu và còn phải thu sẽ hiển thị theo phản hồi chi tiết của hợp đồng sau
          khi lưu.
        </p>
        <DialogFooter class="sm:col-span-2"
          ><Button type="button" variant="outline" :disabled="pending" @click="open = false"
            >Hủy</Button
          ><Button type="submit" :disabled="pending">{{
            pending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo chứng từ'
          }}</Button></DialogFooter
        >
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Expense, PartnerPayment, Receipt } from '@/modules/finance/finance.types'
import { useContractsQuery } from '@/modules/contract/contract.composables'
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import { useDispatchOrders } from '@/modules/dispatch/dispatch.composables'
import { useDriverQuery } from '@/modules/master-data/drivers/composables/useDriverQueries'
import { useExpenseTypeQuery } from '@/modules/master-data/expense-type/composables/useExpenseTypeQueries'
import { usePartnerQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { computed, reactive, ref, watch } from 'vue'

type Kind = 'receipt' | 'expense' | 'partner-payment'
type Row = Receipt | Expense | PartnerPayment
const props = defineProps<{ open: boolean; kind: Kind; row: Row | null; pending?: boolean }>()
const emit = defineEmits<{ close: []; save: [data: Record<string, unknown>] }>()
const customers = useCustomerQuery()
const contracts = useContractsQuery()
const partners = usePartnerQuery()
const expenseTypes = useExpenseTypeQuery()
const orders = useDispatchOrders()
const drivers = useDriverQuery()
const form = reactive<Record<string, string | number | undefined>>({})
const contractQuery = ref('')
const contractMenuOpen = ref(false)
const contractSearchDirty = ref(false)
const submitted = ref(false)
const isEdit = computed(() => Boolean(props.row))
const title = computed(
  () =>
    `${isEdit.value ? 'Cập nhật' : 'Tạo'} ${props.kind === 'receipt' ? 'phiếu thu' : props.kind === 'expense' ? 'chi phí' : 'phiếu chi đối tác'}`,
)
const description = computed(() =>
  props.kind === 'expense'
    ? 'Chọn đúng phạm vi để các liên kết xe hoặc chuyến được kiểm tra bởi hệ thống.'
    : 'Số tiền và liên kết nghiệp vụ sẽ được kiểm tra lại khi lưu.',
)
const dateLabel = computed(() => (props.kind === 'receipt' ? 'Ngày thu' : 'Ngày chi'))
const requiresDriverSettlement = computed(
  () =>
    (props.kind === 'receipt' && form.settlement_type === 'driver_direct_collection') ||
    (props.kind === 'expense' && form.settlement_type !== 'standard'),
)
const completedOrders = computed(() =>
  (orders.data.value ?? []).filter((order) => order.status === 'COMPLETED'),
)
const settlementDrivers = computed(() => {
  const order = completedOrders.value.find((item) => item.id === form.dispatch_order_id)
  const driverId = order?.trip_assignment?.driver_id

  return (drivers.data.value ?? []).filter((driver) => driver.is_active && driver.id === driverId)
})
const receiptContracts = computed(() =>
  (contracts.data.value ?? []).filter(
    (contract) => contract.is_active && contract.customer_id === form.customer_id,
  ),
)
const filteredReceiptContracts = computed(() => {
  const query = contractSearchDirty.value ? contractQuery.value.trim().toLocaleLowerCase() : ''

  return receiptContracts.value.filter((contract) =>
    contract.contract_no.toLocaleLowerCase().includes(query),
  )
})
const requiresContract = computed(
  () => props.kind === 'receipt' && ['deposit', 'contract_payment'].includes(String(form.receipt_type)),
)
const contractError = computed(() => {
  if (!submitted.value) return null
  if (requiresContract.value && !form.contract_id) return 'Vui lòng chọn mã hợp đồng.'
  if (contractQuery.value && !form.contract_id) return 'Chọn một hợp đồng trong danh sách.'

  return null
})
const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})
function hydrate(row: Row | null) {
  const value = row ?? {}
  submitted.value = false
  contractMenuOpen.value = false
  contractSearchDirty.value = false
  contractQuery.value =
    'contract_no' in value && typeof value.contract_no === 'string' ? value.contract_no : ''
  Object.assign(form, {
    customer_id: 'customer_id' in value ? value.customer_id : undefined,
    expense_type_id: 'expense_type_id' in value ? value.expense_type_id : undefined,
    partner_id: 'partner_id' in value ? value.partner_id : undefined,
    contract_id: 'contract_id' in value ? (value.contract_id ?? undefined) : undefined,
    dispatch_order_id:
      'dispatch_order_id' in value ? (value.dispatch_order_id ?? undefined) : undefined,
    vehicle_id: 'vehicle_id' in value ? (value.vehicle_id ?? undefined) : undefined,
    driver_id: 'driver_id' in value ? (value.driver_id ?? undefined) : undefined,
    receipt_type: 'receipt_type' in value ? value.receipt_type : 'contract_payment',
    scope: 'scope' in value ? value.scope : 'general',
    settlement_type:
      'settlement_type' in value
        ? value.settlement_type
        : props.kind === 'receipt'
          ? 'standard'
          : 'standard',
    payment_method: 'payment_method' in value ? value.payment_method : 'cash',
    date:
      'received_at' in value
        ? String(value.received_at ?? '').slice(0, 10)
        : 'expense_date' in value
          ? String(value.expense_date ?? '').slice(0, 10)
          : 'paid_at' in value
            ? String(value.paid_at ?? '').slice(0, 10)
            : new Date().toISOString().slice(0, 10),
    amount: 'amount' in value ? String(value.amount) : '',
    payer_name: 'payer_name' in value ? (value.payer_name ?? '') : '',
    document_no: 'document_no' in value ? (value.document_no ?? '') : '',
    description: 'description' in value ? (value.description ?? '') : '',
  })
}
watch(
  [() => props.open, () => props.row],
  ([value]) => {
    if (value) hydrate(props.row)
  },
  { immediate: true },
)
watch(
  () => form.customer_id,
  (customerId) => {
    const selectedContract = (contracts.data.value ?? []).find(
      (contract) => contract.id === form.contract_id,
    )
    if (selectedContract && selectedContract.customer_id !== customerId) {
      clearContract()
    }
  },
)
watch(
  () => contracts.data.value,
  () => {
    if (contractQuery.value || !form.contract_id) return
    contractQuery.value =
      (contracts.data.value ?? []).find((contract) => contract.id === form.contract_id)?.contract_no ?? ''
  },
)
function openContractMenu() {
  if (form.customer_id) {
    contractMenuOpen.value = true
    contractSearchDirty.value = false
  }
}
function searchContracts() {
  form.contract_id = undefined
  contractSearchDirty.value = true
  if (form.customer_id) contractMenuOpen.value = true
}
function selectContract(contractId: number) {
  const selectedContract = receiptContracts.value.find((contract) => contract.id === contractId)
  if (!selectedContract) return

  form.contract_id = selectedContract.id
  contractQuery.value = selectedContract.contract_no
  contractMenuOpen.value = false
  contractSearchDirty.value = false
}
function clearContract() {
  form.contract_id = undefined
  contractQuery.value = ''
  contractMenuOpen.value = false
  contractSearchDirty.value = false
}
function resetExpenseReferences() {
  if (form.scope === 'general') {
    form.vehicle_id = undefined
    form.dispatch_order_id = undefined
  } else if (form.scope === 'vehicle') form.dispatch_order_id = undefined
  else form.vehicle_id = undefined
}
function syncSettlementReferences() {
  if (requiresDriverSettlement.value) {
    form.scope = 'trip'
    form.vehicle_id = undefined
    if (props.kind === 'receipt' && !form.contract_id) form.receipt_type = 'other'
  } else {
    form.driver_id = undefined
  }
}
function submit() {
  submitted.value = true
  if (props.kind === 'receipt' && contractError.value) return

  const base = {
    amount: String(form.amount),
    payment_method: form.payment_method,
    description: form.description || null,
  }
  if (props.kind === 'receipt')
    emit('save', {
      ...base,
      customer_id: form.customer_id,
      contract_id: form.contract_id || null,
      receipt_type: form.receipt_type,
      settlement_type: form.settlement_type,
      dispatch_order_id: requiresDriverSettlement.value ? form.dispatch_order_id : null,
      driver_id: requiresDriverSettlement.value ? form.driver_id : null,
      received_at: form.date,
      payer_name: form.payer_name || null,
    })
  else if (props.kind === 'expense')
    emit('save', {
      ...base,
      expense_type_id: form.expense_type_id,
      scope: form.scope,
      expense_date: form.date,
      vehicle_id: form.scope === 'vehicle' ? form.vehicle_id : null,
      dispatch_order_id: form.scope === 'trip' ? form.dispatch_order_id : null,
      partner_id: null,
      driver_id: requiresDriverSettlement.value ? form.driver_id : null,
      settlement_type: form.settlement_type,
      document_no: form.document_no || null,
    })
  else
    emit('save', {
      ...base,
      partner_id: form.partner_id,
      dispatch_order_id: form.dispatch_order_id || null,
      paid_at: form.date,
    })
}
</script>
