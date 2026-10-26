<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ payroll ? 'Sửa kỳ lương nháp' : 'Tạo kỳ lương' }}</DialogTitle>
        <DialogDescription
          >Chỉ được chọn tháng đã kết thúc. Mỗi tháng có một kỳ lương trọn tháng.</DialogDescription
        >
      </DialogHeader>
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <label class="grid gap-1.5 text-sm font-medium sm:col-span-2">
          Tháng lương
          <Input v-model="period" type="month" min="2000-01" :max="lastMonth" required />
        </label>
        <label class="grid gap-1.5 text-sm font-medium"
          >Từ ngày<Input :model-value="dates.from_date" type="date" readonly
        /></label>
        <label class="grid gap-1.5 text-sm font-medium"
          >Đến ngày<Input :model-value="dates.to_date" type="date" readonly
        /></label>
        <DialogFooter class="sm:col-span-2">
          <Button type="button" variant="outline" :disabled="pending" @click="open = false"
            >Hủy</Button
          >
          <Button type="submit" :disabled="pending || !valid">{{
            pending ? 'Đang lưu...' : payroll ? 'Lưu thay đổi' : 'Tạo kỳ lương'
          }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
<script setup lang="ts">
import type { Payroll, PayrollPayload } from '@/modules/finance/finance.types'
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
import { computed, ref, watch } from 'vue'

const props = defineProps<{ open: boolean; pending?: boolean; payroll?: Payroll | null }>()
const emit = defineEmits<{ close: []; save: [data: PayrollPayload] }>()
const period = ref('')
const lastMonth = computed(() => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const previous = new Date(Date.UTC(year, month - 2, 1))
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}`
})
const dates = computed(() => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period.value)) return { from_date: '', to_date: '' }
  const [year, month] = period.value.split('-').map(Number)
  const lastDay = new Date(Date.UTC(year!, month!, 0)).getUTCDate()
  return {
    from_date: `${period.value}-01`,
    to_date: `${period.value}-${String(lastDay).padStart(2, '0')}`,
  }
})
const valid = computed(
  () =>
    /^\d{4}-(0[1-9]|1[0-2])$/.test(period.value) &&
    period.value >= '2000-01' &&
    period.value <= lastMonth.value,
)
const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})
watch(
  () => props.open,
  (value) => {
    if (value)
      period.value = props.payroll
        ? `${props.payroll.year}-${String(props.payroll.month).padStart(2, '0')}`
        : lastMonth.value
  },
)
function submit() {
  if (!valid.value) return
  const [year, month] = period.value.split('-').map(Number)
  emit('save', { year: year!, month: month!, ...dates.value })
}
</script>
