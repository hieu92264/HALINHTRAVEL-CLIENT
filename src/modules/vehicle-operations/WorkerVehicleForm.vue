<template>
  <section class="mx-auto max-w-5xl space-y-6">
    <header>
      <p class="text-sm font-medium text-primary">Điều hành xe chạy</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">
        {{ isEdit ? 'Cập nhật chuyến ngoại lệ' : 'Tạo chuyến ngoại lệ' }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Chuyến tạo tay không thuộc lịch lặp. Cước và lương được đối chiếu theo bảng giá khi lưu.
      </p>
    </header>

    <form class="space-y-6" @submit.prevent="save">
      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Kế hoạch chuyến chạy</h2>
        <label class="field">Khách hàng <span>*</span><select v-model.number="form.customer_id" required class="control"><option :value="null" disabled>Chọn khách hàng</option><option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.name }}</option></select></label>
        <label class="field">Tuyến <span>*</span><select v-model.number="form.route_id" required class="control" @change="applyRouteDefaults"><option :value="null" disabled>Chọn tuyến</option><option v-for="item in availableRoutes" :key="item.id" :value="item.id">{{ item.name }}{{ item.shift_name ? ` · ${item.shift_name}` : '' }}</option></select></label>
        <label class="field">Ca chạy <span>*</span><Input v-model="form.shift_name" required placeholder="Ví dụ: Ca sáng" /></label>
        <label class="field">Ngày chạy <span>*</span><Input v-model="form.run_date" type="date" required /></label>
        <label class="field">Giờ đón <span>*</span><Input v-model="form.pickup_time" type="time" required /></label>
        <label class="field">Giờ về<Input v-model="form.return_time" type="time" /></label>
        <label class="field sm:col-span-2">Điểm đón <span>*</span><Input v-model="form.pickup_location" required /></label>
        <label class="field sm:col-span-2">Điểm trả <span>*</span><Input v-model="form.dropoff_location" required /></label>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <h2 class="sm:col-span-2 text-base font-semibold">Xe và lái xe</h2>
        <label class="field">Nguồn xe <span>*</span><select v-model="form.is_company_vehicle" class="control"><option :value="true">Xe công ty</option><option :value="false">Xe đối tác</option></select></label>
        <label class="field">Biển số <span>*</span><Input v-model.trim="form.license_plate" required placeholder="29A-123.45" /></label>
        <label v-if="!form.is_company_vehicle" class="field">Đối tác xe <span>*</span><select v-model.number="form.partner_id" required class="control"><option :value="null" disabled>Chọn đối tác</option><option v-for="partner in partners" :key="partner.id" :value="partner.id">{{ partner.name }}</option></select></label>
        <label class="field">Lái xe nội bộ<select v-model.number="form.driver_id" class="control" :disabled="form.is_hired_driver"><option :value="null">Chưa phân công</option><option v-for="driver in drivers" :key="driver.id" :value="driver.id">{{ driver.full_name }} · {{ driver.code }}</option></select></label>
        <label class="flex items-center gap-2 self-end pb-2 text-sm font-medium"><input v-model="form.is_hired_driver" class="size-4 rounded border-input text-primary" type="checkbox" />Thuê lái cho chuyến này</label>
        <label v-if="form.is_hired_driver" class="field">Tên lái thuê <span>*</span><Input v-model.trim="form.hired_driver_name" required /></label>
        <label v-if="form.is_hired_driver" class="field">Chi phí thuê lái<Input v-model="form.hired_driver_cost" min="0" type="number" /></label>
      </div>

      <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div class="flex flex-wrap items-baseline justify-between gap-2"><h2 class="text-base font-semibold">Ghi chú điều hành</h2><span class="text-xs text-muted-foreground">Cước/lương được snapshot từ bảng giá có hiệu lực.</span></div>
        <label class="field">Ghi chú<textarea v-model.trim="form.note" class="control min-h-24 py-2" /></label>
      </div>

      <div class="flex justify-end gap-3"><Button type="button" variant="outline" @click="router.back()">Hủy</Button><Button :disabled="isSaving" type="submit">{{ isSaving ? 'Đang lưu…' : 'Lưu chuyến' }}</Button></div>
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

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const isSaving = ref(false)
const customers = ref<Customer[]>([])
const routes = ref<WorkerRoute[]>([])
const drivers = ref<Driver[]>([])
const partners = ref<Partner[]>([])
const form = reactive({ customer_id: null as number | null, route_id: null as number | null, shift_name: '', license_plate: '', run_date: new Date().toISOString().slice(0, 10), pickup_time: '', return_time: '', driver_id: null as number | null, partner_id: null as number | null, pickup_location: '', dropoff_location: '', is_company_vehicle: true, is_hired_driver: false, hired_driver_name: '', hired_driver_cost: '', note: '' })
const availableRoutes = computed(() => routes.value.filter((item) => !form.customer_id || item.customer_id === form.customer_id))

watch(() => form.customer_id, () => { if (form.route_id && !availableRoutes.value.some((item) => item.id === form.route_id)) form.route_id = null })
watch(() => form.is_hired_driver, (value) => { if (value) form.driver_id = null })
function applyRouteDefaults() { const selected = routes.value.find((item) => item.id === form.route_id); if (!selected) return; form.shift_name ||= selected.shift_name ?? ''; form.pickup_location ||= selected.pickup_location ?? ''; form.dropoff_location ||= selected.dropoff_location ?? ''; form.pickup_time ||= selected.default_pickup_time ?? ''; form.return_time ||= selected.default_return_time ?? '' }
onMounted(async () => { const [customerList, routeList, driverList, partnerList] = await Promise.all([CustomerService.getCustomerList(), RouteService.getRouteList(), DriverService.getDriverList(), PartnerService.getPartnerList()]); customers.value = customerList; routes.value = routeList; drivers.value = driverList; partners.value = partnerList; if (isEdit.value) Object.assign(form, await VehicleOperationsService.workerRun(Number(route.params.id))) })
async function save() { isSaving.value = true; try { const payload = { ...form, schedule_rule_id: null, return_time: form.return_time || null, driver_id: form.is_hired_driver ? null : form.driver_id, partner_id: form.is_company_vehicle ? null : form.partner_id, hired_driver_name: form.is_hired_driver ? form.hired_driver_name : null, hired_driver_cost: form.is_hired_driver && form.hired_driver_cost ? Number(form.hired_driver_cost) : null }; const run = isEdit.value ? await VehicleOperationsService.updateWorkerRun(Number(route.params.id), payload) : await VehicleOperationsService.createWorkerRun(payload); toast.success('Đã lưu chuyến xe chạy'); await router.push({ name: 'worker-vehicles-detail', params: { id: run.id } }) } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể lưu chuyến xe chạy') } finally { isSaving.value = false } }
</script>

<style scoped>
.field { display: grid; gap: 0.375rem; font-size: 0.875rem; font-weight: 500; }
.field > span { color: var(--destructive); }
.control { width: 100%; height: 2.5rem; border: 1px solid var(--input); border-radius: 0.375rem; background: var(--background); color: var(--foreground); padding: 0 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 150ms, box-shadow 150ms; }
.control:focus { border-color: var(--ring); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 20%, transparent); }
.control:disabled { cursor: not-allowed; opacity: 0.6; }
textarea.control { height: auto; }
</style>
