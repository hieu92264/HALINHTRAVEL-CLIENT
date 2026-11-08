<template>
  <section class="mx-auto max-w-5xl space-y-6">
    <header>
      <p class="text-sm font-medium text-primary">Điều hành xe chạy</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">
        {{ isEdit ? 'Cập nhật chuyến công nhân' : 'Tạo chuyến công nhân' }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Chuyến tạo tay không thuộc lịch lặp. Cước và lương được lấy từ bảng giá của tuyến theo loại
        xe.
      </p>
    </header>

    <form class="space-y-6" @submit.prevent="save">
      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Kế hoạch chuyến chạy</h2>
        <label class="field"
          >Khách hàng <span>*</span
          ><select v-model.number="form.customer_id" required class="control">
            <option :value="null" disabled>Chọn khách hàng</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select></label
        >
        <label class="field"
          >Tuyến <span>*</span
          ><select
            v-model.number="form.route_id"
            required
            class="control"
            @change="applyRouteDefaults"
          >
            <option :value="null" disabled>Chọn tuyến</option>
            <option v-for="item in availableRoutes" :key="item.id" :value="item.id">
              {{ item.name }}{{ item.shift_name ? ` · ${item.shift_name}` : '' }}
            </option>
          </select></label
        >
        <label class="field"
          >Ca chạy <span>*</span
          ><Input v-model="form.shift_name" required placeholder="Ví dụ: Ca sáng"
        /></label>
        <label class="field"
          >Ngày chạy <span>*</span><Input v-model="form.run_date" type="date" required
        /></label>
        <label class="field"
          >Giờ đón <span>*</span><Input v-model="form.pickup_time" type="time" required
        /></label>
        <label class="field">Giờ về<Input v-model="form.return_time" type="time" /></label>
        <label class="field sm:col-span-2"
          >Điểm đón <span>*</span><Input v-model="form.pickup_location" required
        /></label>
        <label class="field sm:col-span-2"
          >Điểm trả <span>*</span><Input v-model="form.dropoff_location" required
        /></label>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Xe và lái xe</h2>
        <label class="field sm:col-span-2"
          >Xe <span>*</span
          ><select
            v-model.number="form.vehicle_id"
            required
            class="control"
            :disabled="!form.route_id"
            @change="applyVehicleDefaults"
          >
            <option :value="null" disabled>{{ vehiclePrompt }}</option>
            <option v-for="vehicle in eligibleVehicles" :key="vehicle.id" :value="vehicle.id">
              {{ vehicle.license_plate }} · {{ vehicle.vehicle_type_code ?? 'Chưa gán loại' }} ·
              {{ vehicleSeats(vehicle) ?? '?' }} chỗ
            </option>
          </select>
          <small v-if="form.route_id && !eligibleVehicles.length" class="text-destructive"
            >Tuyến chưa có giá cho loại xe của bất kỳ xe công ty nào.</small
          >
          <small v-if="selectedVehicle" class="text-muted-foreground"
            >Xe công ty ·
            {{
              selectedVehicle.vehicle_type_name ??
              selectedVehicle.vehicle_type_code ??
              'Cần gán loại xe'
            }}
            · {{ vehicleSeats(selectedVehicle) ?? '?' }} chỗ</small
          >
          <small v-else-if="form.license_plate" class="text-muted-foreground"
            >Chuyến lịch sử: {{ form.license_plate }}. Chọn xe khi cần thay đổi.</small
          >
        </label>
        <div
          v-if="selectedRate"
          class="grid gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm sm:col-span-2 sm:grid-cols-3"
        >
          <div>
            <p class="text-muted-foreground">Loại xe / số chỗ</p>
            <p class="mt-1 font-semibold">
              {{ selectedVehicle?.vehicle_type_code ?? 'Chưa chọn xe' }} ·
              {{ vehicleSeats(selectedVehicle) ?? '?' }} chỗ
            </p>
          </div>
          <div>
            <p class="text-muted-foreground">Cước xe snapshot</p>
            <p class="mt-1 font-semibold">{{ formatMoney(selectedRate.freight_amount) }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Lương lái snapshot</p>
            <p class="mt-1 font-semibold">{{ formatMoney(selectedRate.driver_wage) }}</p>
          </div>
        </div>
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
        >
        <label class="flex items-center gap-2 self-end pb-2 text-sm font-medium"
          ><input
            v-model="form.is_hired_driver"
            class="size-4 rounded border-input text-primary"
            type="checkbox"
          />Thuê lái cho chuyến này</label
        >
        <label v-if="form.is_hired_driver" class="field"
          >Tên lái thuê <span>*</span><Input v-model.trim="form.hired_driver_name" required
        /></label>
        <label v-if="form.is_hired_driver" class="field"
          >Chi phí thuê lái <span>*</span
          ><Input v-model="form.hired_driver_cost" min="1" type="number" required
        /></label>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="text-base font-semibold">Ghi chú điều hành</h2>
          <span class="text-xs text-muted-foreground"
            >Cước/lương được snapshot từ bảng giá có hiệu lực.</span
          >
        </div>
        <label class="field"
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
import type {
  Customer,
  Driver,
  Route as WorkerRoute,
  Vehicle,
} from '@/modules/master-data/master-data.type'
import { CustomerService } from '@/services/customer.service'
import { DriverService } from '@/services/driver.service'
import { RouteService } from '@/services/route.service'
import { VehicleService } from '@/services/vehicle.service'
import { VehicleOperationsService } from '@/services/vehicle-operations.service'
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
const customers = ref<Customer[]>([])
const routes = ref<WorkerRoute[]>([])
const drivers = ref<Driver[]>([])
const vehicles = ref<Vehicle[]>([])
const form = reactive({
  customer_id: null as number | null,
  route_id: null as number | null,
  vehicle_id: null as number | null,
  vehicle_type_id: null as number | null,
  shift_name: '',
  license_plate: '',
  run_date: new Date().toISOString().slice(0, 10),
  pickup_time: '',
  return_time: '',
  driver_id: null as number | null,
  partner_id: null as number | null,
  pickup_location: '',
  dropoff_location: '',
  is_company_vehicle: true,
  is_hired_driver: false,
  hired_driver_name: '',
  hired_driver_cost: '',
  note: '',
})
const availableRoutes = computed(() =>
  routes.value.filter((item) => !form.customer_id || item.customer_id === form.customer_id),
)
const companyDrivers = computed(() => drivers.value.filter((driver) => driver.is_active !== false))
const selectedVehicle = computed(
  () => vehicles.value.find((vehicle) => vehicle.id === form.vehicle_id) ?? null,
)
const selectedRoute = computed(() => routes.value.find((item) => item.id === form.route_id) ?? null)
const selectedRate = computed(() => {
  const vehicleTypeId = selectedVehicle.value?.vehicle_type_id ?? form.vehicle_type_id
  return selectedRoute.value?.rates.find((rate) => rate.vehicle_type_id === vehicleTypeId) ?? null
})
const eligibleVehicles = computed(() => {
  if (!selectedRoute.value) return []

  return vehicles.value.filter(
    (vehicle) =>
      vehicle.vehicle_type_id !== null &&
      selectedRoute.value?.rates.some((rate) => rate.vehicle_type_id === vehicle.vehicle_type_id),
  )
})
const vehiclePrompt = computed(() => {
  if (!form.route_id) return 'Chọn tuyến trước'
  return eligibleVehicles.value.length ? 'Chọn xe công ty' : 'Không có xe phù hợp bảng giá tuyến'
})

watch(
  () => form.customer_id,
  () => {
    if (form.route_id && !availableRoutes.value.some((item) => item.id === form.route_id))
      form.route_id = null
  },
)
watch(
  () => form.is_hired_driver,
  (value) => {
    if (value) form.driver_id = null
  },
)
watch([() => form.route_id], () => {
  if (!form.vehicle_id) return
  if (!eligibleVehicles.value.some((vehicle) => vehicle.id === form.vehicle_id)) {
    form.vehicle_id = null
    form.license_plate = ''
    form.partner_id = null
    form.is_company_vehicle = true
  }
})
function applyRouteDefaults() {
  const selected = routes.value.find((item) => item.id === form.route_id)
  if (!selected) return
  form.shift_name ||= selected.shift_name ?? ''
  form.pickup_location ||= selected.pickup_location ?? ''
  form.dropoff_location ||= selected.dropoff_location ?? ''
  form.pickup_time ||= selected.default_pickup_time ?? ''
  form.return_time ||= selected.default_return_time ?? ''
}
function applyVehicleDefaults() {
  const vehicle = selectedVehicle.value
  if (!vehicle) return
  form.license_plate = vehicle.license_plate
  form.vehicle_type_id = vehicle.vehicle_type_id
  form.is_company_vehicle = true
  form.partner_id = null
  form.driver_id = vehicle.default_driver_id ?? form.driver_id
}
onMounted(async () => {
  const [customerList, routeList, driverList, vehicleList] = await Promise.all([
    CustomerService.getCustomerList(),
    RouteService.getRouteList(),
    DriverService.getDriverList(),
    VehicleService.getVehicleOptions(),
  ])
  customers.value = customerList
  routes.value = routeList
  drivers.value = driverList
  vehicles.value = vehicleList
  if (isEdit.value) {
    const saved = await VehicleOperationsService.workerRun(Number(route.params.id))
    Object.assign(form, {
      ...saved,
      run_date: toDateInputValue(saved.run_date),
      pickup_time: toTimeInputValue(saved.pickup_time),
      return_time: toTimeInputValue(saved.return_time),
    })
    // Bản ghi lịch sử chưa có vehicle_id vẫn chọn được xe trùng biển số nếu danh mục đã có.
    if (!form.vehicle_id)
      form.vehicle_id =
        vehicles.value.find((vehicle) => vehicle.license_plate === saved.license_plate)?.id ?? null
  }
})

function vehicleSeats(vehicle: Vehicle | null): number | null {
  const fromType = Number(vehicle?.vehicle_type_code?.replace(/\D/g, ''))
  return Number.isFinite(fromType) && fromType > 0 ? fromType : (vehicle?.seat_count ?? null)
}

function formatMoney(value: string | number): string {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Number(value))} đ`
}
async function save() {
  isSaving.value = true
  try {
    const payload = {
      ...form,
      return_time: form.return_time || null,
      driver_id: form.is_hired_driver ? null : form.driver_id,
      partner_id: form.is_company_vehicle ? null : form.partner_id,
      hired_driver_name: form.is_hired_driver ? form.hired_driver_name : null,
      hired_driver_cost:
        form.is_hired_driver && form.hired_driver_cost ? Number(form.hired_driver_cost) : null,
    }
    const run = isEdit.value
      ? await VehicleOperationsService.updateWorkerRun(Number(route.params.id), payload)
      : await VehicleOperationsService.createWorkerRun(payload)
    toast.success('Đã lưu chuyến xe chạy')
    await router.push({ name: 'worker-vehicles-detail', params: { id: run.id } })
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu chuyến xe chạy')
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
  transition:
    border-color 150ms,
    box-shadow 150ms;
}
.control:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 20%, transparent);
}
.control:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
textarea.control {
  height: auto;
}
</style>
