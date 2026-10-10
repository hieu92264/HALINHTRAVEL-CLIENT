<template>
  <Dialog v-model:open="open"
    ><DialogContent class="sm:max-w-lg"
      ><DialogHeader
        ><DialogTitle>Tạo kỳ lương</DialogTitle
        ><DialogDescription
          >Hệ thống chỉ cho phép một kỳ lương cho mỗi tháng và năm.</DialogDescription
        ></DialogHeader
      >
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <label class="grid gap-1.5 text-sm font-medium"
          >Tháng<Input v-model.number="form.month" type="number" min="1" max="12" required /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Năm<Input v-model.number="form.year" type="number" min="2020" required /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Từ ngày<Input v-model="form.from_date" type="date" required /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Đến ngày<Input v-model="form.to_date" type="date" required /></label
        ><DialogFooter class="sm:col-span-2"
          ><Button type="button" variant="outline" :disabled="pending" @click="open = false"
            >Hủy</Button
          ><Button type="submit" :disabled="pending">{{
            pending ? 'Đang tạo...' : 'Tạo kỳ lương'
          }}</Button></DialogFooter
        >
      </form></DialogContent
    ></Dialog
  >
</template>
<script setup lang="ts">
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
const props = defineProps<{ open: boolean; pending?: boolean }>()
const emit = defineEmits<{
  close: []
  save: [data: { month: number; year: number; from_date: string; to_date: string }]
}>()
const now = new Date()
const form = reactive({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  from_date: '',
  to_date: '',
})
const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})
watch(
  () => props.open,
  (value) => {
    if (value) {
      const prefix = `${form.year}-${String(form.month).padStart(2, '0')}`
      form.from_date = `${prefix}-01`
      form.to_date = new Date(form.year, form.month, 0).toISOString().slice(0, 10)
    }
  },
)
function submit() {
  emit('save', { ...form })
}
</script>
