<template>
  <section class="mx-auto max-w-5xl space-y-6">
    <header>
      <p class="text-sm font-medium text-primary">Lịch xe công nhân</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ isEdit ? 'Cập nhật lịch lặp' : 'Tạo lịch lặp công nhân' }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">Lưu lịch sẽ đồng bộ các chuyến kế hoạch trong 90 ngày tới; chuyến đang chạy và hoàn thành được giữ nguyên.</p>
    </header>

    <form class="space-y-6" @submit.prevent="save">
      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Tuyến và thời hạn</h2>
        <label class="field">Khách hàng <span>*</span><select v-model.number="form.customer_id" required class="control"><option :value="null" disabled>Chọn khách hàng</option><option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.name }}</option></select></label>
        <label class="field">Tuyến <span>*</span><select v-model.number="form.route_id" required class="control" @change="applyRouteDefaults"><option :value="null" disabled>Chọn tuyến</option><option v-for="item in availableRoutes" :key="item.id" :value="item.id">{{ item.name }}{{ item.shift_name ? ` · ${item.shift_name}` : '' }}</option></select></label>
        <label class="field">Ca chạy <span>*</span><Input v-model="form.shift_name" required placeholder="Ví dụ: Ca sáng" /></label>
        <label class="field">Hiệu lực từ <span>*</span><Input v-model="form.effective_from" type="date" required /></label>
        <label class="field">Hiệu lực đến<Input v-model="form.effective_to" :min="form.effective_from" type="date" /></label>
        <label class="field sm:col-span-2">Điểm đón <span>*</span><Input v-model="form.pickup_location" required /></label>
        <label class="field sm:col-span-2">Điểm trả <span>*</span><Input v-model="form.dropoff_location" required /></label>
      </div>

      <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div class="flex flex-wrap items-baseline justify-between gap-2"><div><h2 class="text-base font-semibold">Ngày và giờ chạy</h2><p class="mt-1 text-sm text-muted-foreground">Chọn một hoặc nhiều ngày trong tuần. Mỗi ngày có giờ đón/trả riêng.</p></div><span class="text-sm font-medium text-primary">{{ selectedDays.length }} ngày đã chọn</span></div>
        <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="day in weekdays" :key="day.value" class="rounded-lg border p-4 transition" :class="dayState(day.value).enabled ? 'border-primary/40 bg-primary/5' : 'border-border'">
            <label class="flex cursor-pointer items-center gap-2 font-medium"><input v-model="dayState(day.value).enabled" class="size-4 rounded border-input text-primary" type="checkbox" />{{ day.label }}</label>
            <div v-if="dayState(day.value).enabled" class="mt-4 grid grid-cols-2 gap-3"><label class="field text-xs">Giờ đón<Input v-model="dayState(day.value).pickup_time" type="time" required /></label><label class="field text-xs">Giờ về<Input v-model="dayState(day.value).return_time" type="time" /></label></div>
          </article>
        </div>
        <p v-if="!selectedDays.length" class="mt-3 text-sm text-destructive">Chọn ít nhất một ngày chạy.</p>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Xe và lái xe</h2>
        <label class="field">Nguồn xe <span>*</span><select v-model="form.is_company_vehicle" class="control"><option :value="true">Xe công ty</option><option :value="false">Xe đối tác</option></select></label>
        <label class="field">Biển số <span>*</span><Input v-model.trim="form.license_plate" required placeholder="29A-123.45" /></label>
        <label v-if="!form.is_company_vehicle" class="field">Đối tác xe <span>*</span><select v-model.number="form.partner_id" required class="control"><option :value="null" disabled>Chọn đối tác</option><option v-for="partner in partners" :key="partner.id" :value="partner.id">{{ partner.name }}</option></select></label>
        <label class="field">Lái xe nội bộ<select v-model.number="form.driver_id" class="control" :disabled="form.is_hired_driver"><option :value="null">Chưa phân công</option><option v-for="driver in drivers" :key="driver.id" :value="driver.id">{{ driver.full_name }} · {{ driver.code }}</option></select></label>
        <label class="flex items-center gap-2 self-end pb-2 text-sm font-medium"><input v-model="form.is_hired_driver" class="size-4 rounded border-input text-primary" type="checkbox" />Thuê lái cho lịch này</label>
        <label v-if="form.is_hired_driver" class="field">Tên lái thuê <span>*</span><Input v-model.trim="form.hired_driver_name" required /></label>
        <label v-if="form.is_hired_driver" class="field">Chi phí thuê lái<Input v-model="form.hired_driver_cost" min="0" type="number" /></label>
      </div>

      <div class="flex justify-end gap-3"><Button type="button" variant="outline" @click="router.back()">Hủy</Button><Button :disabled="isSaving || !selectedDays.length" type="submit">{{ isSaving ? 'Đang lưu…' : 'Lưu và đồng bộ lịch' }}</Button></div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { Customer, Driver, Partner, Route as WorkerRoute } from '@/modules/master-data/master-data.type'
import { CustomerService } from '@/services/customer.service'
import { DriverService } from '@/services/driver.service'
import { PartnerService } from '@/services/partner.service'
import { RouteService } from '@/services/route.service'
import { VehicleOperationsService } from '@/services/vehicle-operations.service'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

type ScheduleDay = { enabled: boolean; pickup_time: string; return_time: string }
const weekdays = [{ value: 1, label: 'Thứ Hai' }, { value: 2, label: 'Thứ Ba' }, { value: 3, label: 'Thứ Tư' }, { value: 4, label: 'Thứ Năm' }, { value: 5, label: 'Thứ Sáu' }, { value: 6, label: 'Thứ Bảy' }, { value: 7, label: 'Chủ Nhật' }]
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const isSaving = ref(false)
const customers = ref<Customer[]>([])
const routes = ref<WorkerRoute[]>([])
const drivers = ref<Driver[]>([])
const partners = ref<Partner[]>([])
const newDays = (): Record<number, ScheduleDay> => Object.fromEntries(weekdays.map(({ value }) => [value, { enabled: false, pickup_time: '', return_time: '' }])) as Record<number, ScheduleDay>
const form = reactive({ customer_id: null as number | null, route_id: null as number | null, shift_name: '', effective_from: new Date().toISOString().slice(0, 10), effective_to: '', pickup_location: '', dropoff_location: '', is_company_vehicle: true, partner_id: null as number | null, license_plate: '', driver_id: null as number | null, is_hired_driver: false, hired_driver_name: '', hired_driver_cost: '', note: '', days: newDays() })
const availableRoutes = computed(() => routes.value.filter((item) => !form.customer_id || item.customer_id === form.customer_id))
const dayState = (weekday: number) => form.days[weekday]!
const selectedDays = computed(() => weekdays.filter((day) => dayState(day.value).enabled))
watch(() => form.customer_id, () => { if (form.route_id && !availableRoutes.value.some((item) => item.id === form.route_id)) form.route_id = null })
watch(() => form.is_hired_driver, (value) => { if (value) form.driver_id = null })
function applyRouteDefaults() { const selected = routes.value.find((item) => item.id === form.route_id); if (!selected) return; form.shift_name ||= selected.shift_name ?? ''; form.pickup_location ||= selected.pickup_location ?? ''; form.dropoff_location ||= selected.dropoff_location ?? ''; for (const day of Object.values(form.days)) { day.pickup_time ||= selected.default_pickup_time ?? ''; day.return_time ||= selected.default_return_time ?? '' } }
onMounted(async () => { const [customerList, routeList, driverList, partnerList] = await Promise.all([CustomerService.getCustomerList(), RouteService.getRouteList(), DriverService.getDriverList(), PartnerService.getPartnerList()]); customers.value = customerList; routes.value = routeList; drivers.value = driverList; partners.value = partnerList; if (isEdit.value) { const saved = (await VehicleOperationsService.schedules()).find((item) => item.id === Number(route.params.id)); if (!saved) { toast.error('Không tìm thấy lịch chạy'); await router.replace({ name: 'worker-vehicle-schedules' }); return } Object.assign(form, { customer_id: saved.customer_id, route_id: saved.route_id, driver_id: saved.driver_id ?? null, partner_id: saved.partner_id ?? null, shift_name: saved.shift_name, effective_from: saved.effective_from, effective_to: saved.effective_to ?? '', pickup_location: saved.pickup_location, dropoff_location: saved.dropoff_location, is_company_vehicle: saved.is_company_vehicle, license_plate: saved.license_plate, is_hired_driver: saved.is_hired_driver, hired_driver_name: saved.hired_driver_name ?? '', hired_driver_cost: saved.hired_driver_cost ?? '', note: saved.note ?? '' }); for (const day of saved.days) Object.assign(dayState(day.weekday), { enabled: true, pickup_time: day.pickup_time, return_time: day.return_time ?? '' }) } })
async function save() { isSaving.value = true; try { const payload = { ...form, effective_to: form.effective_to || null, driver_id: form.is_hired_driver ? null : form.driver_id, partner_id: form.is_company_vehicle ? null : form.partner_id, hired_driver_name: form.is_hired_driver ? form.hired_driver_name : null, hired_driver_cost: form.is_hired_driver && form.hired_driver_cost ? Number(form.hired_driver_cost) : null, days: selectedDays.value.map((day) => ({ weekday: day.value, pickup_time: dayState(day.value).pickup_time, return_time: dayState(day.value).return_time || null })) }; if (isEdit.value) await VehicleOperationsService.updateSchedule(Number(route.params.id), payload); else await VehicleOperationsService.createSchedule(payload); toast.success(isEdit.value ? 'Đã cập nhật và đồng bộ lịch xe' : 'Đã lưu và sinh lịch xe'); await router.push({ name: 'worker-vehicle-schedules' }) } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể lưu lịch xe') } finally { isSaving.value = false } }
</script>

<style scoped>
.field { display: grid; gap: 0.375rem; font-size: 0.875rem; font-weight: 500; }
.field > span { color: var(--destructive); }
.control { width: 100%; height: 2.5rem; border: 1px solid var(--input); border-radius: 0.375rem; background: var(--background); color: var(--foreground); padding: 0 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 150ms, box-shadow 150ms; }
.control:focus { border-color: var(--ring); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 20%, transparent); }
.control:disabled { cursor: not-allowed; opacity: 0.6; }
</style>
