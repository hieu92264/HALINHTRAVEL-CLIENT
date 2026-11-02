<template>
  <Dialog :open="open" @update:open="(value) => !value && emit('close')">
    <DialogContent class="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden p-0 sm:max-w-xl">
      <DialogHeader class="shrink-0 border-b px-5 py-4">
        <DialogTitle>{{ rate ? 'Cập nhật bảng giá' : 'Thêm bảng giá' }}</DialogTitle>
        <DialogDescription>
          Cước và lương lái được chốt vào chuyến công nhân khi lịch sinh chuyến.
        </DialogDescription>
      </DialogHeader>
      <form class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4" @submit.prevent="submit">
        <label class="field">
          Tuyến <span>*</span>
          <select
            v-model.number="form.route_id"
            class="control"
            required
            :aria-invalid="Boolean(errors.route_id)"
          >
            <option :value="null" disabled>Chọn tuyến</option>
            <option v-for="route in routes" :key="route.id" :value="route.id">
              {{ route.name }}{{ route.customer_name ? ` · ${route.customer_name}` : '' }}
            </option>
          </select>
          <small v-if="errors.route_id" class="text-destructive">{{ errors.route_id }}</small>
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="field">
            Biển số <span>*</span>
            <Input
              v-model.trim="form.license_plate"
              required
              placeholder="15B-123.45"
              :aria-invalid="Boolean(errors.license_plate)"
            />
            <small v-if="errors.license_plate" class="text-destructive">{{
              errors.license_plate
            }}</small>
          </label>
          <label class="field">
            Cước chuyến <span>*</span>
            <Input
              v-model="form.freight_amount"
              min="0"
              step="1"
              type="number"
              required
              :aria-invalid="Boolean(errors.freight_amount)"
            />
            <small v-if="errors.freight_amount" class="text-destructive">{{
              errors.freight_amount
            }}</small>
          </label>
          <label class="field">
            Lương lái xe <span>*</span>
            <Input
              v-model="form.driver_wage"
              min="0"
              step="1"
              type="number"
              required
              :aria-invalid="Boolean(errors.driver_wage)"
            />
            <small v-if="errors.driver_wage" class="text-destructive">{{
              errors.driver_wage
            }}</small>
          </label>
          <label class="field">
            Hiệu lực từ <span>*</span>
            <Input
              v-model="form.effective_from"
              type="date"
              required
              :aria-invalid="Boolean(errors.effective_from)"
            />
            <small v-if="errors.effective_from" class="text-destructive">{{
              errors.effective_from
            }}</small>
          </label>
          <label class="field">
            Hiệu lực đến
            <Input
              v-model="form.effective_to"
              :min="form.effective_from"
              type="date"
              :aria-invalid="Boolean(errors.effective_to)"
            />
            <small v-if="errors.effective_to" class="text-destructive">{{
              errors.effective_to
            }}</small>
          </label>
        </div>
        <p
          v-if="formError"
          class="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {{ formError }}
        </p>
      </form>
      <DialogFooter class="shrink-0 border-t px-5 py-4">
        <Button type="button" variant="outline" :disabled="pending" @click="emit('close')"
          >Hủy</Button
        >
        <Button :disabled="pending" @click="submit">{{
          pending ? 'Đang lưu…' : 'Lưu bảng giá'
        }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Route } from '@/modules/master-data/master-data.type'
import { ApiError } from '@/shared/lib/api-error'
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
import type { WorkerRate } from '@/services/vehicle-operations.service'
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  rate: WorkerRate | null
  routes: Route[]
  pending?: boolean
}>()
const emit = defineEmits<{ close: []; save: [payload: Omit<WorkerRate, 'id' | 'route_name'>] }>()
const form = reactive({
  route_id: null as number | null,
  license_plate: '',
  freight_amount: '',
  driver_wage: '',
  effective_from: '',
  effective_to: '',
})
const errors = ref<Record<string, string>>({})
const formError = ref('')

watch(
  () => [props.open, props.rate] as const,
  ([open]) => {
    if (!open) return
    errors.value = {}
    formError.value = ''
    Object.assign(form, {
      route_id: props.rate?.route_id ?? null,
      license_plate: props.rate?.license_plate ?? '',
      freight_amount: props.rate?.freight_amount ?? '',
      driver_wage: props.rate?.driver_wage ?? '',
      effective_from: props.rate?.effective_from ?? '',
      effective_to: props.rate?.effective_to ?? '',
    })
  },
  { immediate: true },
)

const valid = computed(() =>
  Boolean(
    form.route_id &&
    form.license_plate &&
    form.effective_from &&
    form.freight_amount !== '' &&
    form.driver_wage !== '',
  ),
)
function submit() {
  errors.value = {}
  formError.value = ''
  if (!valid.value) {
    formError.value = 'Vui lòng nhập đủ các trường bắt buộc.'
    return
  }
  emit('save', {
    route_id: form.route_id!,
    license_plate: form.license_plate,
    freight_amount: form.freight_amount,
    driver_wage: form.driver_wage,
    effective_from: form.effective_from,
    effective_to: form.effective_to || null,
  })
}

function showApiError(error: unknown) {
  if (error instanceof ApiError) {
    errors.value = Object.fromEntries(
      Object.entries(error.fieldErrors).map(([key, messages]) => [
        key,
        messages[0] ?? 'Giá trị không hợp lệ.',
      ]),
    )
    formError.value = Object.keys(errors.value).length ? '' : error.message
  } else formError.value = 'Không thể lưu bảng giá. Vui lòng thử lại.'
}
defineExpose({ showApiError })
</script>

<style scoped>
.field {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
}
.field > span {
  color: var(--destructive);
}
.field > :is(input, select, textarea) {
  display: block;
  margin-top: 0.375rem;
}
.field > input {
  height: 2.5rem;
}
.field > small {
  display: block;
  margin-top: 0.375rem;
  font-weight: 400;
}
.control {
  width: 100%;
  height: 2.5rem;
  border: 1px solid var(--input);
  border-radius: 0.375rem;
  background: var(--background);
  color: var(--foreground);
  padding: 0 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition:
    border-color 150ms,
    box-shadow 150ms;
}
.control:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 20%, transparent);
}
</style>
