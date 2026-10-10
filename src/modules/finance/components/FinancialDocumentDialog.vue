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
          <Input v-model="form.contract_id" type="number" min="1" placeholder="Không bắt buộc"
        /></label>
        <label
          v-if="kind === 'expense' && form.scope === 'vehicle'"
          class="grid gap-1.5 text-sm font-medium"
          >Mã xe<Input v-model="form.vehicle_id" type="number" min="1" required
        /></label>
        <label
          v-if="kind === 'expense' && form.scope === 'trip'"
          class="grid gap-1.5 text-sm font-medium"
          >Mã lệnh điều xe<Input v-model="form.dispatch_order_id" type="number" min="1" required
        /></label>
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
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
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
import { computed, reactive, watch } from 'vue'

type Kind = 'receipt' | 'expense' | 'partner-payment'
type Row = Receipt | Expense | PartnerPayment
const props = defineProps<{ open: boolean; kind: Kind; row: Row | null; pending?: boolean }>()
const emit = defineEmits<{ close: []; save: [data: Record<string, unknown>] }>()
const customers = useCustomerQuery()
const partners = usePartnerQuery()
const expenseTypes = useExpenseTypeQuery()
const form = reactive<Record<string, string | number | undefined>>({})
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
const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})
function hydrate(row: Row | null) {
  const value = row ?? {}
  Object.assign(form, {
    customer_id: 'customer_id' in value ? value.customer_id : undefined,
    expense_type_id: 'expense_type_id' in value ? value.expense_type_id : undefined,
    partner_id: 'partner_id' in value ? value.partner_id : undefined,
    contract_id: 'contract_id' in value ? (value.contract_id ?? undefined) : undefined,
    dispatch_order_id:
      'dispatch_order_id' in value ? (value.dispatch_order_id ?? undefined) : undefined,
    vehicle_id: 'vehicle_id' in value ? (value.vehicle_id ?? undefined) : undefined,
    receipt_type: 'receipt_type' in value ? value.receipt_type : 'contract_payment',
    scope: 'scope' in value ? value.scope : 'general',
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
function resetExpenseReferences() {
  if (form.scope === 'general') {
    form.vehicle_id = undefined
    form.dispatch_order_id = undefined
  } else if (form.scope === 'vehicle') form.dispatch_order_id = undefined
  else form.vehicle_id = undefined
}
function submit() {
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
      driver_id: null,
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
