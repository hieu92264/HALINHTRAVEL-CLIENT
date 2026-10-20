<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ row ? 'Cập nhật lái xe nộp tiền' : 'Ghi nhận lái xe nộp tiền' }}</DialogTitle>
        <DialogDescription>Khoản nộp được đối chiếu với phiếu khách trả trực tiếp cho lái xe.</DialogDescription>
      </DialogHeader>
      <form class="grid gap-4" @submit.prevent="submit">
        <label class="grid gap-1.5 text-sm font-medium">Phiếu khách trả trực tiếp
          <select v-model.number="form.receipt_id" required class="h-10 rounded-md border bg-background px-3 font-normal" @change="syncReceipt">
            <option :value="undefined" disabled>Chọn phiếu thu</option>
            <option v-for="receipt in directReceipts" :key="receipt.id" :value="receipt.id">{{ receipt.receipt_no }} — {{ receipt.driver_name }} — {{ receipt.amount }}</option>
          </select>
        </label>
        <p v-if="selectedReceipt" class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Lệnh {{ selectedReceipt.dispatch_order_no }} · Lái xe {{ selectedReceipt.driver_name }}
        </p>
        <label class="grid gap-1.5 text-sm font-medium">Ngày nộp<Input v-model="form.remitted_at" type="date" required /></label>
        <label class="grid gap-1.5 text-sm font-medium">Số tiền<Input v-model="form.amount" type="number" min="1" step="1" required /></label>
        <label class="grid gap-1.5 text-sm font-medium">Phương thức
          <select v-model="form.payment_method" class="h-10 rounded-md border bg-background px-3 font-normal"><option value="cash">Tiền mặt</option><option value="bank_transfer">Chuyển khoản</option></select>
        </label>
        <label class="grid gap-1.5 text-sm font-medium">Diễn giải<textarea v-model="form.description" rows="3" class="rounded-md border bg-background px-3 py-2 font-normal" /></label>
        <DialogFooter><Button type="button" variant="outline" :disabled="pending" @click="open = false">Hủy</Button><Button type="submit" :disabled="pending || !selectedReceipt">{{ pending ? 'Đang lưu...' : 'Lưu' }}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { DriverCashRemittance, Receipt } from '@/modules/finance/finance.types'
import { useReceiptsQuery } from '@/modules/finance/finance.composables'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { computed, reactive, watch } from 'vue'

const props = defineProps<{ open: boolean; row: DriverCashRemittance | null; pending?: boolean }>()
const emit = defineEmits<{ close: []; save: [data: Record<string, unknown>] }>()
const receipts = useReceiptsQuery()
const form = reactive<Record<string, string | number | undefined>>({})
const directReceipts = computed(() => (receipts.data.value ?? []).filter((receipt) => receipt.settlement_type === 'driver_direct_collection'))
const selectedReceipt = computed<Receipt | undefined>(() => directReceipts.value.find((receipt) => receipt.id === form.receipt_id))
const open = computed({ get: () => props.open, set: (value: boolean) => { if (!value) emit('close') } })

function hydrate(row: DriverCashRemittance | null) {
  Object.assign(form, { receipt_id: row?.receipt_id, dispatch_order_id: row?.dispatch_order_id, driver_id: row?.driver_id, remitted_at: row?.remitted_at.slice(0, 10) ?? new Date().toISOString().slice(0, 10), amount: row ? String(row.amount) : '', payment_method: row?.payment_method ?? 'cash', description: row?.description ?? '' })
}
function syncReceipt() {
  form.dispatch_order_id = selectedReceipt.value?.dispatch_order_id ?? undefined
  form.driver_id = selectedReceipt.value?.driver_id ?? undefined
}
function submit() {
  if (!selectedReceipt.value) return
  emit('save', { receipt_id: form.receipt_id, dispatch_order_id: form.dispatch_order_id, driver_id: form.driver_id, remitted_at: form.remitted_at, amount: String(form.amount), payment_method: form.payment_method, description: form.description || null })
}
watch([() => props.open, () => props.row], ([isOpen]) => { if (isOpen) hydrate(props.row) }, { immediate: true })
</script>
