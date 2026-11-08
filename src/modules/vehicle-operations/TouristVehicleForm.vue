<template>
  <section class="mx-auto max-w-5xl space-y-6">
    <header>
      <p class="text-sm font-medium text-primary">Điều hành xe chạy</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">
        {{ isEdit ? 'Cập nhật xe chạy du lịch' : 'Tạo xe chạy du lịch' }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Cước, tỷ lệ và lương trực tiếp trên từng chuyến.
      </p>
    </header>
    <form class="space-y-6" @submit.prevent="save">
      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Kế hoạch và khách hàng</h2>
        <label class="field">Khách hàng <span>*</span><Input v-model.trim="form.customer_name" required placeholder="Nhập tên khách hàng" /></label>
        <label class="field"
          >Hành trình <span>*</span
          ><Input v-model.trim="form.journey" required placeholder="Hải Phòng – Hạ Long"
        /></label>
        <label class="field"
          >Ngày đi <span>*</span><Input v-model="form.run_date" type="date" required /></label
        ><label class="field"
          >Ngày về<Input v-model="form.return_date" :min="form.run_date" type="date"
        /></label>
        <label class="field"
          >Giờ đón <span>*</span><Input v-model="form.pickup_time" type="time" required /></label
        ><label class="field">Giờ về<Input v-model="form.return_time" type="time" /></label>
        <label class="field sm:col-span-2"
          >Điểm đón <span>*</span><Input v-model.trim="form.pickup_location" required /></label
        ><label class="field sm:col-span-2"
          >Điểm trả <span>*</span><Input v-model.trim="form.dropoff_location" required
        /></label>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Xe và lái xe</h2>
        <label class="field">Nguồn xe <select v-model="form.is_company_vehicle" class="control"><option :value="true">Xe công ty</option><option :value="false">Xe ngoài</option></select></label>
        <label v-if="form.is_company_vehicle" class="field"
          >Xe <span>*</span
          ><select v-model.number="form.vehicle_id" :required="!isEdit" class="control" @change="applyVehicleDefaults">
            <option :value="null" disabled>Chọn xe</option>
            <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
              {{ vehicle.license_plate }} · {{ vehicle.vehicle_type_code ?? 'Chưa gán loại xe' }}
            </option>
          </select>
          <small v-if="selectedVehicle" class="text-muted-foreground">Tài xế mặc định: {{ selectedVehicle.default_driver_name ?? 'Chưa gán' }}</small>
          <small v-else-if="form.license_plate" class="text-muted-foreground">Chuyến lịch sử: {{ form.license_plate }}. Chọn xe khi cần thay đổi.</small>
        </label>
        <label v-if="!form.is_company_vehicle" class="field">Hãng vận tải <select v-model.number="form.partner_id" class="control" required><option :value="null" disabled>Chọn hãng vận tải</option><option v-for="partner in partners" :key="partner.id" :value="partner.id">{{ partner.name }}</option></select></label>
        <label v-if="!form.is_company_vehicle" class="field">Biển số <span>*</span><Input v-model.trim="form.license_plate" required /></label>
        <label v-if="!form.is_company_vehicle" class="field">Loại xe <select v-model.number="form.vehicle_type_id" class="control" required><option :value="null" disabled>Chọn loại xe</option><option v-for="type in vehicleTypes" :key="type.id" :value="type.id">{{ type.code }}</option></select></label>
        <label v-if="!form.is_company_vehicle" class="field"
          >Tiền thuê xe <span>*</span
          ><Input v-model="form.partner_vehicle_cost" min="1" type="number" required
        /></label>
        <label class="field"
          >Lái xe nội bộ<select
            v-model.number="form.driver_id"
            class="control"
            :disabled="form.is_hired_driver"
          >
            <option :value="null">Chưa phân công</option>
            <option v-for="driver in companyDrivers" :key="driver.id" :value="driver.id">
              {{ driver.full_name }} · {{ driver.code }}
            </option>
          </select></label
        ><label class="flex items-center gap-2 self-end pb-2 text-sm font-medium"
          ><input
            v-model="form.is_hired_driver"
            class="size-4 rounded border-input text-primary"
            type="checkbox"
          />Thuê lái cho chuyến này</label
        >
        <label v-if="form.is_hired_driver" class="field"
          >Tên lái thuê <span>*</span
          ><Input v-model.trim="form.hired_driver_name" required /></label
        ><label v-if="form.is_hired_driver" class="field"
          >Chi phí thuê lái <span>*</span
          ><Input v-model="form.hired_driver_cost" min="1" type="number" required
        /></label>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Cước và lương lái xe</h2>
        <label class="field"
          >Cước xe <span>*</span
          ><Input
            v-model="form.freight_amount"
            min="0"
            type="number" /></label
        ><div class="field">
          <div class="flex items-center justify-between gap-3">
            <span>Tỷ lệ lương (%)</span>
            <Button
              v-if="canOverrideRate"
              type="button"
              size="sm"
              variant="outline"
              @click="toggleRateOverride"
            >{{ form.driver_wage_is_overridden ? 'Dùng tỷ lệ Loại xe' : 'Sửa tỷ lệ lương' }}</Button>
          </div>
          <Input
            v-if="form.driver_wage_is_overridden && canOverrideRate"
            v-model="ratePercent"
            class="mt-1.5"
            min="0"
            max="100"
            step="0.01"
            type="number"
          />
          <Input v-else :model-value="ratePercent" class="mt-1.5" disabled type="number" />
          <small v-if="form.driver_wage_is_overridden && canOverrideRate" class="mt-1 text-muted-foreground">Tỷ lệ riêng của chuyến này; lương vẫn tự tính theo cước xe.</small>
        </div>
        ><label class="field">Lương lái xe<Input :model-value="form.driver_wage" disabled type="number" /></label>
        <p class="self-end text-sm text-muted-foreground">
          {{ canSetWage ? 'Lương tự tính theo cước × tỷ lệ Loại xe.' : 'Chỉ tính lương cho lái xe nội bộ.' }}
        </p>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <div class="sm:col-span-2">
          <h2 class="text-base font-semibold">Đối soát tiền tại chuyến</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Các khoản này phục vụ đối soát, không tự cộng-trừ vào lương kỳ.
          </p>
        </div>
        <label class="field"
          >Lái xe đã thu<Input
            v-model="form.driver_collected_amount"
            min="0"
            type="number" /></label
        ><label class="field"
          >Công ty đã thu<Input
            v-model="form.company_collected_amount"
            min="0"
            type="number" /></label
        ><label class="field"
          >Lái xe đã nộp<Input v-model="form.driver_remitted_amount" min="0" type="number" /></label
        ><label class="field"
          >Lái xe đã chi<Input v-model="form.driver_expense_amount" min="0" type="number" /></label
        ><label class="field sm:col-span-2"
          >Ghi chú<textarea v-model.trim="form.note" class="control min-h-24 py-2" />
        </label>
      </div>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" class="w-full sm:w-auto" @click="router.back()"
          >Hủy</Button
        ><Button :disabled="isSaving" class="w-full sm:w-auto" type="submit">{{
          isSaving ? 'Đang lưu…' : 'Lưu chuyến'
        }}</Button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import type { Driver, Partner, Vehicle, VehicleType } from '@/modules/master-data/master-data.type'
import { DriverService } from '@/services/driver.service'
import { PartnerService } from '@/services/partner.service'
import { VehicleService } from '@/services/vehicle.service'
import { VehicleTypeService } from '@/services/vehicle-type.service'
import { VehicleOperationsService } from '@/services/vehicle-operations.service'
import { calculateTouristDriverWage } from './tourist-wage'
import { toDateInputValue, toTimeInputValue } from '@/shared/helpers/date.helper'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const isSaving = ref(false)
const drivers = ref<Driver[]>([])
const vehicles = ref<Vehicle[]>([])
const partners = ref<Partner[]>([])
const vehicleTypes = ref<VehicleType[]>([])
const form = reactive({
  customer_id: null as number | null,
  customer_name: '',
  journey: '',
  run_date: new Date().toISOString().slice(0, 10),
  return_date: '',
  pickup_time: '',
  return_time: '',
  pickup_location: '',
  dropoff_location: '',
  is_company_vehicle: true,
  vehicle_id: null as number | null,
  vehicle_type_id: null as number | null,
  partner_id: null as number | null,
  license_plate: '',
  driver_id: null as number | null,
  is_hired_driver: false,
  hired_driver_name: '',
  hired_driver_cost: '0',
  partner_vehicle_cost: '0',
  freight_amount: '0',
  driver_wage_rate: '0',
  driver_wage: '0',
  driver_wage_is_overridden: false,
  status: 'planned',
  driver_collected_amount: '0',
  company_collected_amount: '0',
  driver_remitted_amount: '0',
  driver_expense_amount: '0',
  note: '',
})
const companyDrivers = computed(() =>
  drivers.value.filter(
    (driver) => driver.type === OwnershipTypeEnum.COMPANY && driver.is_active !== false,
  ),
)
const selectedVehicle = computed(() => vehicles.value.find((vehicle) => vehicle.id === form.vehicle_id) ?? null)
const selectedVehicleType = computed(() =>
  vehicleTypes.value.find((vehicleType) => vehicleType.id === form.vehicle_type_id) ?? null,
)
const canSetWage = computed(
  () => form.is_company_vehicle && !form.is_hired_driver && Boolean(form.driver_id),
)
const canOverrideRate = computed(
  () => canSetWage.value && !['completed', 'cancelled'].includes(form.status ?? 'planned'),
)
const ratePercent = computed({
  get: () => String(Number(form.driver_wage_rate || 0) * 100),
  set: (value: string) => {
    form.driver_wage_rate = String(Number(value || 0) / 100)
    syncTouristWage()
  },
})
watch(
  () => form.is_hired_driver,
  (value) => {
    if (value) form.driver_id = null
    syncTouristWage()
  },
)
watch(
  () => form.is_company_vehicle,
  (value) => {
    if (value) form.partner_id = null
    syncTouristWage()
  },
)
watch(
  [
    () => form.vehicle_type_id,
    () => form.driver_id,
    () => form.freight_amount,
  ],
  syncTouristWage,
)
watch(
  () => form.vehicle_type_id,
  (vehicleTypeId, previousVehicleTypeId) => {
    if (previousVehicleTypeId !== null && previousVehicleTypeId !== vehicleTypeId) {
      form.driver_wage_is_overridden = false
    }
    syncTouristWage()
  },
)
function applyVehicleDefaults() {
  const vehicle = selectedVehicle.value
  if (!vehicle) return
  form.license_plate = vehicle.license_plate
  form.vehicle_type_id = vehicle.vehicle_type_id
  form.driver_id = vehicle.default_driver_id
  form.driver_wage_is_overridden = false
}
function syncTouristWage() {
  const rate = form.driver_wage_is_overridden
    ? form.driver_wage_rate
    : selectedVehicleType.value?.tourism_wage_rate
  const wage = calculateTouristDriverWage(
    form.freight_amount,
    rate,
    canSetWage.value,
  )
  form.driver_wage_rate = wage.driverWageRate
  form.driver_wage = wage.driverWage
}
function toggleRateOverride() {
  form.driver_wage_is_overridden = !form.driver_wage_is_overridden
  syncTouristWage()
}
onMounted(async () => {
  const [driverList, vehicleList, partnerList, typeList] = await Promise.all([
    DriverService.getDriverList(),
    VehicleService.getVehicleOptions(),
    PartnerService.getPartnerList(),
    VehicleTypeService.getList(),
  ])
  drivers.value = driverList
  vehicles.value = vehicleList
  partners.value = partnerList
  vehicleTypes.value = typeList
  if (isEdit.value) {
    const saved = await VehicleOperationsService.touristRun(Number(route.params.id))
    Object.assign(form, {
      ...saved,
      run_date: toDateInputValue(saved.run_date),
      return_date: toDateInputValue(saved.return_date),
      pickup_time: toTimeInputValue(saved.pickup_time),
      return_time: toTimeInputValue(saved.return_time),
    })
    if (!form.vehicle_id)
      form.vehicle_id = vehicles.value.find((vehicle) => vehicle.license_plate === saved.license_plate)?.id ?? null
  }
  syncTouristWage()
})
async function save() {
  isSaving.value = true
  try {
    const payload = {
      ...form,
      return_date: form.return_date || null,
      return_time: form.return_time || null,
      partner_id: form.is_company_vehicle ? null : form.partner_id,
      vehicle_id: form.is_company_vehicle ? form.vehicle_id : null,
      driver_id: form.is_hired_driver ? null : form.driver_id,
      hired_driver_name: form.is_hired_driver ? form.hired_driver_name : null,
      hired_driver_cost: form.is_hired_driver ? Number(form.hired_driver_cost) : 0,
      partner_vehicle_cost: form.is_company_vehicle ? 0 : Number(form.partner_vehicle_cost),
      driver_wage_rate: Number(form.driver_wage_rate),
      driver_wage: Number(form.driver_wage),
      freight_amount: Number(form.freight_amount),
      driver_collected_amount: Number(form.driver_collected_amount),
      company_collected_amount: Number(form.company_collected_amount),
      driver_remitted_amount: Number(form.driver_remitted_amount),
      driver_expense_amount: Number(form.driver_expense_amount),
    }
    const run = isEdit.value
      ? await VehicleOperationsService.updateTouristRun(Number(route.params.id), payload)
      : await VehicleOperationsService.createTouristRun(payload)
    toast.success('Đã lưu xe chạy du lịch')
    await router.push({ name: 'tourist-vehicles-detail', params: { id: run.id } })
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu xe chạy du lịch')
  } finally {
    isSaving.value = false
  }
}
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
}
.control:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 20%, transparent);
}
textarea.control {
  height: auto;
}
</style>
