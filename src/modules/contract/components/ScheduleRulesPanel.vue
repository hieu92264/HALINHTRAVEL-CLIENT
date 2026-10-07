<template>
  <section class="rounded-lg border bg-card p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Lịch cố định</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Tạo quy tắc chạy xe và sinh lịch chuyến cho hợp đồng đang hiệu lực.
        </p>
      </div>
      <Button v-if="canManage && contract.status === 'active'" size="sm" @click="openCreate"
        ><Plus class="size-4" />Tạo quy tắc</Button
      >
    </div>
    <p
      v-if="contract.status !== 'active'"
      class="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground"
    >
      Kích hoạt hợp đồng trước khi quản lý lịch cố định.
    </p>
    <p
      v-else-if="query.isError.value"
      class="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
    >
      Không thể tải quy tắc lịch.
      <button class="underline" @click="query.refetch()">Thử lại</button>
    </p>
    <template v-else
      ><form
        v-if="isFormOpen"
        class="mt-5 space-y-4 rounded-lg border border-primary/25 bg-muted/30 p-4"
        @submit.prevent="save"
      >
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">
            {{ editingRule ? 'Cập nhật quy tắc lịch' : 'Tạo quy tắc lịch' }}
          </h3>
          <Button type="button" size="sm" variant="ghost" @click="closeForm">Đóng</Button>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label class="space-y-1"
            ><span class="text-sm">Hạng mục hợp đồng *</span
            ><select
              v-model.number="form.contract_item_id"
              class="h-10 w-full rounded-md border bg-background px-3"
            >
              <option :value="0">Chọn hạng mục</option>
              <option v-for="item in contract.items" :key="item.id" :value="item.id">
                {{ item.vehicle_type_name || 'Loại xe' }} · {{ item.quantity }} xe
              </option>
            </select></label
          ><label class="space-y-1"
            ><span class="text-sm">Tuyến</span
            ><select
              v-model.number="form.route_id"
              class="h-10 w-full rounded-md border bg-background px-3"
            >
              <option :value="0">Dùng tuyến của hạng mục</option>
              <option
                v-for="routeItem in availableRoutes"
                :key="routeItem.id"
                :value="routeItem.id"
              >
                {{ routeItem.name }}
              </option>
            </select></label
          ><label class="space-y-1"
            ><span class="text-sm">Xe mặc định</span
            ><select
              v-model.number="form.default_vehicle_id"
              class="h-10 w-full rounded-md border bg-background px-3"
            >
              <option :value="0">Không chọn xe</option>
              <option v-for="vehicle in availableVehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.license_plate }}
              </option>
            </select></label
          ><label class="space-y-1"
            ><span class="text-sm">Tài xế mặc định</span
            ><select
              v-model.number="form.default_driver_id"
              class="h-10 w-full rounded-md border bg-background px-3"
            >
              <option :value="0">Không chọn tài xế</option>
              <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                {{ driver.code }} · {{ driver.full_name }}
              </option>
            </select></label
          ><label class="space-y-1"
            ><span class="text-sm">Hiệu lực từ *</span
            ><Input v-model="form.effective_from" class="h-10" type="date" /></label
          ><label class="space-y-1"
            ><span class="text-sm">Hiệu lực đến *</span
            ><Input v-model="form.effective_to" class="h-10" type="date" /></label
          ><label class="space-y-1 md:col-span-2 xl:col-span-3"
            ><span class="text-sm">Ghi chú</span><Input v-model="form.note" class="h-10"
          /></label>
        </div>
        <div>
          <div class="mb-2 flex items-center justify-between">
            <h4 class="font-medium">Ngày chạy *</h4>
            <Button type="button" size="sm" variant="outline" @click="addDay">Thêm ngày</Button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(day, index) in days"
              :key="day.key"
              class="grid gap-2 rounded-md border bg-background p-2 md:grid-cols-[1fr_130px_130px_1fr_auto]"
            >
              <select v-model="day.weekday" class="h-9 rounded-md border bg-background px-2">
                <option v-for="weekday in weekdays" :key="weekday" :value="weekday">
                  {{ weekdayLabel(weekday) }}
                </option></select
              ><Input v-model="day.pickup_time" class="h-9" type="time" /><Input
                v-model="day.return_time"
                class="h-9"
                type="time"
              /><Input v-model="day.shift_name" class="h-9" placeholder="Tên ca" /><Button
                type="button"
                size="sm"
                variant="ghost"
                :disabled="days.length === 1"
                @click="days.splice(index, 1)"
                >Xóa</Button
              >
            </div>
          </div>
        </div>
        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        <div class="flex justify-end">
          <Button type="submit" :disabled="isSaving">{{
            isSaving ? 'Đang lưu...' : 'Lưu quy tắc'
          }}</Button>
        </div>
      </form>
      <div v-if="query.isLoading.value" class="mt-5 text-sm text-muted-foreground">
        Đang tải quy tắc lịch...
      </div>
      <div
        v-else-if="!rules.length"
        class="mt-5 rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground"
      >
        Chưa có quy tắc lịch cố định.
      </div>
      <div v-else class="mt-5 space-y-3">
        <article v-for="rule in rules" :key="rule.id" class="rounded-lg border p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold">{{ rule.vehicle_type_name || 'Hạng mục xe' }}</h3>
                <span class="rounded-full bg-muted px-2 py-1 text-xs">{{
                  rule.is_active ? 'Đang áp dụng' : 'Đã ngừng'
                }}</span
                ><span
                  v-if="rule.is_locked"
                  class="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                  >Đã sinh {{ rule.trip_schedules_count }} lịch</span
                >
              </div>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ rule.route_name || 'Tuyến của hạng mục' }} · {{ rule.effective_from }} đến
                {{ rule.effective_to }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                Xe: {{ rule.default_vehicle_license_plate || 'Chưa chọn' }} · Tài xế:
                {{ rule.default_driver_name || 'Chưa chọn' }}
              </p>
            </div>
            <div v-if="canManage && rule.is_active" class="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" @click="openGenerate(rule)"
                >Sinh lịch chuyến</Button
              ><Button v-if="!rule.is_locked" size="sm" variant="outline" @click="openEdit(rule)"
                >Sửa</Button
              ><Button v-if="!rule.is_locked" size="sm" variant="ghost" @click="removeRule(rule.id)"
                >Ngừng áp dụng</Button
              >
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="day in rule.days"
              :key="`${day.weekday}-${day.pickup_time}`"
              class="rounded bg-muted px-2 py-1 text-xs"
              >{{ weekdayLabel(day.weekday) }} {{ day.pickup_time }}–{{ day.return_time || '—'
              }}{{ day.shift_name ? ` · ${day.shift_name}` : '' }}</span
            >
          </div>
        </article>
      </div></template
    >
    <Dialog v-model:open="isGenerateOpen"
      ><DialogContent
        ><DialogHeader
          ><DialogTitle>Sinh lịch chuyến</DialogTitle
          ><DialogDescription
            >Khoảng ngày phải nằm trong hiệu lực quy tắc và hợp đồng.</DialogDescription
          ></DialogHeader
        >
        <form class="space-y-4" @submit.prevent="generate">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="space-y-1"
              ><span class="text-sm">Từ ngày *</span
              ><Input v-model="generateRange.from_date" type="date" /></label
            ><label class="space-y-1"
              ><span class="text-sm">Đến ngày *</span
              ><Input v-model="generateRange.to_date" type="date"
            /></label>
          </div>
          <p v-if="generateError" class="text-sm text-destructive">{{ generateError }}</p>
          <div v-if="generateResult" class="rounded-md bg-muted p-3 text-sm">
            Đã tạo {{ generateResult.summary.created_count }}, bỏ qua
            {{ generateResult.summary.skipped_count }}, xung đột
            {{ generateResult.summary.conflicts_count }} lịch chuyến.
          </div>
          <DialogFooter
            ><Button type="button" variant="outline" @click="isGenerateOpen = false">Đóng</Button
            ><Button type="submit" :disabled="mutations.generateTripSchedules.isPending.value">{{
              mutations.generateTripSchedules.isPending.value ? 'Đang sinh...' : 'Sinh lịch'
            }}</Button></DialogFooter
          >
        </form></DialogContent
      ></Dialog
    >
  </section>
</template>
<script setup lang="ts">
import {
  useContractMutations,
  useScheduleRulesQuery,
} from '@/modules/contract/contract.composables'
import { weekdayLabel } from '@/modules/contract/contract.format'
import { validateScheduleDays } from '@/modules/contract/contract.helpers'
import {
  generateScheduleSchema,
  scheduleRuleSchema,
} from '@/modules/contract/schemas/contract.schema'
import type { Contract, ContractScheduleRule, Weekday } from '@/modules/contract/contract.types'
import { useDriverQuery } from '@/modules/master-data/drivers/composables/useDriverQueries'
import { useRouteQuery } from '@/modules/master-data/route/composables/useRouteQueries'
import { useVehicleQuery } from '@/modules/master-data/vehicles/composables/useVehicleQueries'
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
import { ApiError } from '@/shared/lib/api-error'
import { Plus } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
const props = defineProps<{ contract: Contract; canManage: boolean }>()
const query = useScheduleRulesQuery(() => props.contract.id)
const mutations = useContractMutations()
const { data: routeData } = useRouteQuery()
const { data: vehicleData } = useVehicleQuery()
const { data: driverData } = useDriverQuery()
const rules = computed(() => query.data.value ?? [])
const weekdays: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const isFormOpen = ref(false)
const editingRule = ref<ContractScheduleRule | null>(null)
const formError = ref('')
const isGenerateOpen = ref(false)
const generateRule = ref<ContractScheduleRule | null>(null)
const generateError = ref('')
const generateResult = ref<Awaited<
  ReturnType<typeof mutations.generateTripSchedules.mutateAsync>
> | null>(null)
let dayKey = 2
const form = reactive({
  contract_item_id: 0,
  route_id: 0,
  effective_from: props.contract.effective_from,
  effective_to: props.contract.effective_to ?? props.contract.effective_from,
  default_vehicle_id: 0,
  default_driver_id: 0,
  note: '',
})
type DayForm = {
  key: number
  weekday: Weekday
  pickup_time: string
  return_time: string
  shift_name: string
}
const days = ref<DayForm[]>([
  { key: 1, weekday: 'Mon', pickup_time: '', return_time: '', shift_name: '' },
])
const generateRange = reactive({ from_date: '', to_date: '' })
const selectedItem = computed(() =>
  props.contract.items.find((item) => item.id === form.contract_item_id),
)
const availableRoutes = computed(() =>
  (routeData.value ?? []).filter(
    (item) =>
      item.is_active !== false &&
      (item.customer_id === null || item.customer_id === props.contract.customer_id),
  ),
)
const availableVehicles = computed(() =>
  (vehicleData.value ?? []).filter(
    (item) =>
      item.is_active !== false && item.vehicle_type_id === selectedItem.value?.vehicle_type_id,
  ),
)
const drivers = computed(() => (driverData.value ?? []).filter((item) => item.is_active !== false))
const isSaving = computed(
  () =>
    mutations.createScheduleRule.isPending.value ||
    mutations.updateScheduleRule.isPending.value ||
    mutations.replaceScheduleDays.isPending.value,
)
function openCreate() {
  editingRule.value = null
  form.contract_item_id = props.contract.items[0]?.id ?? 0
  form.route_id = 0
  form.effective_from = props.contract.effective_from
  form.effective_to = props.contract.effective_to ?? props.contract.effective_from
  form.default_vehicle_id = 0
  form.default_driver_id = 0
  form.note = ''
  days.value = [{ key: dayKey++, weekday: 'Mon', pickup_time: '', return_time: '', shift_name: '' }]
  formError.value = ''
  isFormOpen.value = true
}
function openEdit(rule: ContractScheduleRule) {
  editingRule.value = rule
  form.contract_item_id = rule.contract_item_id
  form.route_id = rule.route_id ?? 0
  form.effective_from = rule.effective_from
  form.effective_to = rule.effective_to
  form.default_vehicle_id = rule.default_vehicle_id ?? 0
  form.default_driver_id = rule.default_driver_id ?? 0
  form.note = rule.note ?? ''
  days.value = rule.days.map((day) => ({
    ...day,
    key: dayKey++,
    return_time: day.return_time ?? '',
    shift_name: day.shift_name ?? '',
  }))
  formError.value = ''
  isFormOpen.value = true
}
function closeForm() {
  isFormOpen.value = false
  editingRule.value = null
}
function addDay() {
  days.value.push({
    key: dayKey++,
    weekday: 'Mon',
    pickup_time: '',
    return_time: '',
    shift_name: '',
  })
}
function validateDays(): string {
  return validateScheduleDays(days.value) ?? ''
}
function schedulePayload() {
  return {
    contract_item_id: form.contract_item_id,
    route_id: form.route_id || null,
    effective_from: form.effective_from,
    effective_to: form.effective_to,
    default_vehicle_id: form.default_vehicle_id || null,
    default_driver_id: form.default_driver_id || null,
    note: form.note || null,
  }
}
async function save() {
  formError.value = validateDays()
  const validation = scheduleRuleSchema.safeParse({ ...schedulePayload(), days: days.value })
  if (!validation.success)
    formError.value = validation.error.issues[0]?.message || 'Dữ liệu chưa hợp lệ.'
  if (formError.value || !form.contract_item_id || !form.effective_from || !form.effective_to) {
    if (!formError.value) formError.value = 'Vui lòng nhập đủ thông tin quy tắc.'
    return
  }
  try {
    const rule = editingRule.value
      ? await mutations.updateScheduleRule.mutateAsync({
          id: editingRule.value.id,
          data: schedulePayload(),
        })
      : await mutations.createScheduleRule.mutateAsync({
          contractId: props.contract.id,
          data: schedulePayload(),
        })
    await mutations.replaceScheduleDays.mutateAsync({
      id: rule.id,
      days: days.value.map(({ key: _key, ...day }) => ({
        ...day,
        return_time: day.return_time || null,
        shift_name: day.shift_name || null,
      })),
    })
    toast.success('Đã lưu quy tắc lịch.')
    closeForm()
  } catch (error) {
    formError.value = error instanceof ApiError ? error.message : 'Không thể lưu quy tắc lịch.'
  }
}
async function removeRule(id: number) {
  if (!window.confirm('Ngừng áp dụng quy tắc lịch này?')) return
  try {
    await mutations.removeScheduleRule.mutateAsync(id)
    toast.success('Đã ngừng áp dụng quy tắc lịch.')
  } catch (error) {
    toast.error(error instanceof ApiError ? error.message : 'Không thể ngừng quy tắc lịch.')
  }
}
function openGenerate(rule: ContractScheduleRule) {
  generateRule.value = rule
  generateRange.from_date = rule.effective_from
  generateRange.to_date = rule.effective_to
  generateError.value = ''
  generateResult.value = null
  isGenerateOpen.value = true
}
async function generate() {
  if (!generateRule.value || !generateRange.from_date || !generateRange.to_date) {
    generateError.value = 'Vui lòng chọn khoảng ngày.'
    return
  }
  const validation = generateScheduleSchema.safeParse(generateRange)
  if (!validation.success) {
    generateError.value = validation.error.issues[0]?.message || 'Dữ liệu chưa hợp lệ.'
    return
  }
  try {
    generateError.value = ''
    generateResult.value = await mutations.generateTripSchedules.mutateAsync({
      id: generateRule.value.id,
      data: { ...generateRange },
    })
    toast.success('Đã xử lý sinh lịch chuyến.')
  } catch (error) {
    generateError.value = error instanceof ApiError ? error.message : 'Không thể sinh lịch chuyến.'
  }
}
</script>
