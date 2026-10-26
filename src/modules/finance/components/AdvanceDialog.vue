<template>
  <Dialog v-model:open="open"
    ><DialogContent class="sm:max-w-lg"
      ><DialogHeader
        ><DialogTitle>{{ row ? 'Cập nhật tạm ứng' : 'Tạo tạm ứng' }}</DialogTitle
        ><DialogDescription
          >Chỉ tài xế công ty đang hoạt động được tạm ứng lương; phiếu chỉ sửa được khi chờ xác nhận.</DialogDescription
        ></DialogHeader
      >
      <form class="space-y-4" @submit.prevent="submit">
        <label class="grid gap-1.5 text-sm font-medium"
          >Tài xế<select
            v-model.number="form.driver_id"
            required
            class="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option :value="null" disabled>Chọn tài xế</option>
            <option v-for="driver in drivers.data.value ?? []" :key="driver.id" :value="driver.id">
              {{ driver.full_name }} · {{ driver.code }}
            </option>
          </select></label>
        <p v-if="row && (row.driver_type !== 'company' || !row.driver_is_active)" class="text-sm text-destructive">Tài xế hiện tại không đủ điều kiện tạm ứng. Hãy chọn tài xế công ty đang hoạt động hoặc ngừng hoạt động phiếu.</p>
        <p v-if="drivers.isError.value" class="text-sm text-destructive">Không thể tải danh sách tài xế đủ điều kiện.</p
        ><label class="grid gap-1.5 text-sm font-medium"
          >Ngày tạm ứng<Input v-model="form.advance_date" type="date" required /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Số tiền<Input v-model="form.amount" type="number" min="0" step="1" required /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Diễn giải<textarea
            v-model="form.description"
            rows="3"
            class="rounded-md border bg-background px-3 py-2 text-sm font-normal"
          /></label
        ><DialogFooter
          ><Button type="button" variant="outline" :disabled="pending" @click="open = false"
            >Hủy</Button
          ><Button type="submit" :disabled="pending || !eligibleSelection">{{
            pending ? 'Đang lưu...' : 'Lưu tạm ứng'
          }}</Button></DialogFooter
        >
      </form></DialogContent
    ></Dialog
  >
</template>
<script setup lang="ts">
import type { DriverAdvance } from '@/modules/finance/finance.types'
import { DriverPayrollService } from '@/services/driver-payroll.service'
import { useQuery } from '@tanstack/vue-query'
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
const props = defineProps<{ open: boolean; row: DriverAdvance | null; pending?: boolean }>()
const emit = defineEmits<{
  close: []
  save: [
    payload: {
      driver_id: number
      advance_date: string
      amount: string
      description: string | null
    },
  ]
}>()
const drivers = useQuery({ queryKey: ['driver-payroll', 'eligible-drivers'], queryFn: DriverPayrollService.getEligibleAdvanceDrivers, enabled: () => props.open })
const form = reactive({
  driver_id: null as number | null,
  advance_date: '',
  amount: '',
  description: '',
})
const eligibleSelection = computed(() => (drivers.data.value ?? []).some((driver) => driver.id === form.driver_id))
const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})
watch(
  [() => props.open, () => props.row],
  ([value]) => {
    if (value)
      Object.assign(form, {
        driver_id: props.row?.driver_id ?? null,
        advance_date:
          props.row?.advance_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        amount: props.row ? String(props.row.amount) : '',
        description: props.row?.description ?? '',
      })
  },
  { immediate: true },
)
function submit() {
  if (form.driver_id && eligibleSelection.value)
    emit('save', { ...form, driver_id: form.driver_id, description: form.description || null })
}
</script>
