<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent class="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden p-0 sm:max-w-2xl">
      <DialogHeader class="shrink-0 border-b px-5 py-4">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="submit">
        <div class="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 sm:grid-cols-2">
          <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
            >Khách hàng<select
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
            </select></label
          >
          <label v-if="kind === 'partner-payment'" class="grid gap-1.5 text-sm font-medium"
            >Đối tác<select
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
            </select></label
          >
          <label v-if="kind === 'expense'" class="grid gap-1.5 text-sm font-medium"
            >Loại chi phí<select
              v-model.number="form.expense_type_id"
              required
              class="h-10 rounded-md border bg-background px-3 font-normal"
            >
              <option :value="null" disabled>Chọn loại chi phí</option>
              <option v-for="type in scopedExpenseTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select></label
          >
          <label v-if="kind === 'expense' && expenseScope === 'vehicle'" class="grid gap-1.5 text-sm font-medium">Biển số xe<select v-model.number="form.vehicle_id" required class="h-10 rounded-md border bg-background px-3 font-normal"><option :value="null" disabled>Chọn xe</option><option v-for="vehicle in vehicles.data.value ?? []" :key="vehicle.id" :value="vehicle.id">{{ vehicle.license_plate }}</option></select></label>
          <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
            >Loại thu<select
              v-model="form.receipt_type"
              class="h-10 rounded-md border bg-background px-3 font-normal"
            >
              <option value="deposit">Đặt cọc</option>
              <option value="contract_payment">Thu cước xe chạy</option>
              <option value="other">Khác</option>
            </select></label
          >
          <label class="grid gap-1.5 text-sm font-medium"
            >{{ dateLabel }}<Input v-model="form.date" type="date" required /></label
          ><label class="grid gap-1.5 text-sm font-medium"
            >Số tiền<Input
              v-model="form.amount"
              type="number"
              min="0"
              step="1"
              required
              class="tabular-nums"
          /></label>
          <label class="grid gap-1.5 text-sm font-medium"
            >Phương thức<select
              v-model="form.payment_method"
              class="h-10 rounded-md border bg-background px-3 font-normal"
            >
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản</option>
            </select></label
          >
          <label v-if="kind === 'receipt'" class="grid gap-1.5 text-sm font-medium"
            >Người nộp<Input v-model="form.payer_name" placeholder="Tên người nộp" /></label
          ><label v-if="kind === 'expense' && expenseScope === 'vehicle'" class="grid gap-1.5 text-sm font-medium"
            >Người chi<Input v-model="form.paid_by" placeholder="Tên người chi tiền"
          /></label>
          <section
            v-if="kind === 'expense' && isHiredDriverPayment"
            class="rounded-lg border border-primary/25 bg-primary/5 p-4 sm:col-span-2"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-1.5">
              <h3 class="text-sm font-semibold">Thông tin chi trả thuê lái</h3>
              <span class="text-xs text-muted-foreground">Bắt buộc cho chứng từ này</span>
            </div>
            <label class="mt-3 grid max-w-md gap-1.5 text-sm font-medium"
              >Tên lái xe thuê <span class="text-destructive">*</span
              ><Input v-model="form.hired_driver_name" required placeholder="Ví dụ: Nguyễn Văn A"
            /></label>
          </section>
          <label class="grid gap-1.5 text-sm font-medium sm:col-span-2"
            >Diễn giải<textarea
              v-model="form.description"
              rows="3"
              class="min-h-20 rounded-md border bg-background px-3 py-2 font-normal"
              placeholder="Nội dung chứng từ"
            />
          </label>
        </div>
        <div
          class="flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-5 py-3 sm:flex-row sm:justify-end"
        >
          <Button type="button" variant="outline" class="w-full sm:w-auto" @click="emit('close')"
            >Hủy</Button
          >
          <Button type="submit" class="w-full sm:w-auto" :disabled="pending">{{
            pending ? 'Đang lưu...' : 'Lưu chứng từ'
          }}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import { useExpenseTypeQuery } from '@/modules/master-data/expense-type/composables/useExpenseTypeQueries'
import { usePartnerQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import { useVehicleQuery } from '@/modules/master-data/vehicle/composables/useVehicleQueries'
import type { Expense, PartnerPayment, Receipt } from '@/modules/finance/finance.types'
import { toDateInputValue } from '@/shared/helpers/date.helper'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
type Kind = 'receipt' | 'expense' | 'partner-payment'
type Row = Receipt | Expense | PartnerPayment
const props = defineProps<{ open: boolean; kind: Kind; row: Row | null; pending?: boolean; expenseScope?: 'vehicle' | 'general' }>()
const emit = defineEmits<{ close: []; save: [data: Record<string, unknown>] }>()
const customers = useCustomerQuery()
const partners = usePartnerQuery()
const expenseTypes = useExpenseTypeQuery()
const vehicles = useVehicleQuery()
const today = () => new Date().toISOString().slice(0, 10)
const form = reactive({
  customer_id: null as number | null,
  partner_id: null as number | null,
  expense_type_id: null as number | null,
  vehicle_id: null as number | null,
  receipt_type: 'other',
  date: today(),
  amount: '',
  payment_method: 'cash' as 'cash' | 'bank_transfer',
  payer_name: '',
  paid_by: '',
  hired_driver_name: '',
  description: '',
})
const title = computed(() =>
  props.row
    ? 'Sửa chứng từ'
    : props.kind === 'receipt'
      ? 'Tạo phiếu thu'
      : props.kind === 'expense'
        ? 'Tạo phiếu chi chung'
        : 'Tạo chi trả đối tác',
)
const description = computed(() =>
  props.kind === 'expense'
    ? 'Phiếu chi chung là chứng từ độc lập, không gắn lệnh điều xe.'
    : 'Ghi nhận chứng từ độc lập để đối soát công nợ.',
)
const dateLabel = computed(() => (props.kind === 'receipt' ? 'Ngày thu' : 'Ngày chi'))
const selectedExpenseType = computed(() =>
  (expenseTypes.data.value ?? []).find((type) => type.id === form.expense_type_id),
)
const scopedExpenseTypes = computed(() => (expenseTypes.data.value ?? []).filter((type) => type.scope === (props.expenseScope ?? 'general')))
const isHiredDriverPayment = computed(() =>
  /hired_driver|thuê lái/i.test(
    `${selectedExpenseType.value?.code ?? ''} ${selectedExpenseType.value?.name ?? ''}`,
  ),
)
watch(isHiredDriverPayment, (isHiredDriverPayment) => {
  if (!isHiredDriverPayment) form.hired_driver_name = ''
})
watch(
  () => [props.open, props.kind, props.row] as const,
  () => {
    const row = props.row
    form.customer_id =
      props.kind === 'receipt' ? ((row as Receipt | null)?.customer_id ?? null) : null
    form.partner_id =
      props.kind === 'partner-payment' ? ((row as PartnerPayment | null)?.partner_id ?? null) : null
    form.expense_type_id =
      props.kind === 'expense' ? ((row as Expense | null)?.expense_type_id ?? null) : null
    form.receipt_type =
      props.kind === 'receipt' ? ((row as Receipt | null)?.receipt_type ?? 'other') : 'other'
    const documentDate =
      props.kind === 'receipt'
        ? ((row as Receipt | null)?.received_at ?? today())
        : props.kind === 'expense'
          ? ((row as Expense | null)?.expense_date ?? today())
          : ((row as PartnerPayment | null)?.paid_at ?? today())
    form.date = toDateInputValue(documentDate) || today()
    form.amount = String(row?.amount ?? '')
    form.payment_method = row?.payment_method ?? 'cash'
    form.payer_name = props.kind === 'receipt' ? ((row as Receipt | null)?.payer_name ?? '') : ''
    form.paid_by = props.kind === 'expense' ? ((row as Expense | null)?.paid_by ?? '') : ''
    form.hired_driver_name =
      props.kind === 'expense' ? ((row as Expense | null)?.hired_driver_name ?? '') : ''
    form.description = row?.description ?? ''
  },
  { immediate: true },
)
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
      receipt_type: form.receipt_type,
      received_at: form.date,
      payer_name: form.payer_name || null,
    })
  else if (props.kind === 'expense')
    emit('save', {
      ...base,
      expense_type_id: form.expense_type_id,
      vehicle_id: props.expenseScope === 'vehicle' ? form.vehicle_id : null,
      expense_date: form.date,
      paid_by: form.paid_by || null,
      hired_driver_name: form.hired_driver_name || null,
    })
  else emit('save', { ...base, partner_id: form.partner_id, paid_at: form.date })
}
</script>
    form.vehicle_id = props.kind === 'expense' ? ((row as Expense | null)?.vehicle_id ?? null) : null
