<template>
  <section class="mx-auto max-w-6xl space-y-5">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">{{ isEdit ? 'Cập nhật yêu cầu thuê xe' : 'Tạo yêu cầu thuê xe' }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">Các trường có dấu * là bắt buộc.</p>
      </div>
      <Button variant="outline" @click="router.push({ name: 'rental-requests' })">Quay lại</Button>
    </header>

    <p v-if="requestQuery.isError.value" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Không thể tải yêu cầu thuê xe.</p>
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-3">
        <label class="space-y-1.5"><span>Khách hàng *</span><select v-model.number="form.customer_id" class="h-10 w-full rounded-md border bg-background px-3"><option :value="0">Chọn khách hàng</option><option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.name }}</option></select></label>
        <label class="space-y-1.5"><span>Nguồn yêu cầu</span><Input v-model="form.source" class="h-10" placeholder="Website, Zalo, Hotline..." /></label>
        <label class="space-y-1.5"><span>Thời điểm tiếp nhận *</span><Input v-model="form.requested_at" class="h-10" type="datetime-local" /></label>
        <label class="space-y-1.5"><span>Dịch vụ *</span><select v-model="form.service_type" class="h-10 w-full rounded-md border bg-background px-3"><option value="tourism">Tour du lịch</option><option value="school">Đưa đón học sinh</option><option value="business">Đưa đón công nhân</option><option value="fixed">Tuyến cố định</option></select></label>
        <label class="space-y-1.5"><span>Khởi hành *</span><Input v-model="form.start_at" class="h-10" type="datetime-local" /></label>
        <label class="space-y-1.5"><span>Kết thúc</span><Input v-model="form.end_at" class="h-10" type="datetime-local" /></label>
      </div>

      <div class="rounded-lg border bg-card p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 class="text-lg font-semibold">Hành trình</h2><div class="flex gap-2"><Button type="button" :variant="form.trip_mode === 'route' ? 'default' : 'outline'" size="sm" @click="form.trip_mode = 'route'">Theo tuyến</Button><Button type="button" :variant="form.trip_mode === 'custom' ? 'default' : 'outline'" size="sm" @click="form.trip_mode = 'custom'">Tự nhập</Button></div></div>
        <label v-if="form.trip_mode === 'route'" class="block max-w-xl space-y-1.5"><span>Tuyến xe *</span><select v-model.number="form.route_id" class="h-10 w-full rounded-md border bg-background px-3"><option :value="0">Chọn tuyến</option><option v-for="item in availableRoutes" :key="item.id" :value="item.id">{{ item.name }} — {{ item.pickup_location }} → {{ item.dropoff_location }}</option></select></label>
        <div v-else class="grid gap-4 md:grid-cols-2"><label class="space-y-1.5"><span>Điểm đón *</span><Input v-model="form.pickup_location" class="h-10" /></label><label class="space-y-1.5"><span>Điểm trả *</span><Input v-model="form.dropoff_location" class="h-10" /></label></div>
      </div>

      <div class="rounded-lg border bg-card p-5">
        <div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-semibold">Hạng mục xe</h2><Button type="button" variant="outline" size="sm" @click="addItem">Thêm hạng mục</Button></div>
        <div class="space-y-3"><div v-for="(item, index) in form.items" :key="item.key" class="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_140px_1fr_auto]"><select v-model.number="item.vehicle_type_id" class="h-10 rounded-md border bg-background px-3"><option :value="0">Chọn loại xe</option><option v-for="vehicleType in vehicleTypes" :key="vehicleType.id" :value="vehicleType.id">{{ vehicleType.name }}</option></select><Input v-model.number="item.quantity" class="h-10" min="1" type="number" /><Input v-model="item.note" class="h-10" placeholder="Ghi chú" /><Button type="button" variant="ghost" :disabled="form.items.length === 1" @click="removeItem(index)">Xóa</Button></div></div>
        <label class="mt-4 block space-y-1.5"><span>Ghi chú nội bộ</span><textarea v-model="form.note" class="min-h-24 w-full rounded-md border bg-background p-3 text-sm" /></label>
      </div>
      <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
      <div class="flex justify-end"><Button type="submit" :disabled="mutationPending">{{ mutationPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo yêu cầu' }}</Button></div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import { useRouteQuery } from '@/modules/master-data/route/composables/useRouteQueries'
import { useVehicleTypeQuery } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
import { toApiDateTime, toDateTimeLocal } from '@/modules/rental/rental.format'
import { useRentalMutations, useRentalRequestQuery } from '@/modules/rental/rental.composables'
import type { RentalRequestPayload, RentalServiceType } from '@/modules/rental/rental.types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ApiError } from '@/shared/lib/api-error'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

type FormItem = { key: number; vehicle_type_id: number; quantity: number; note: string }
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id ?? 0))
const isEdit = computed(() => id.value > 0)
const requestQuery = useRentalRequestQuery(() => id.value)
const { data: customerData } = useCustomerQuery()
const { data: vehicleTypeData } = useVehicleTypeQuery()
const { data: routeData } = useRouteQuery()
const mutations = useRentalMutations()
const customers = computed(() => (customerData.value ?? []).filter((item) => item.is_active !== false))
const vehicleTypes = computed(() => (vehicleTypeData.value ?? []).filter((item) => item.is_active !== false))
const availableRoutes = computed(() => (routeData.value ?? []).filter((item) => item.is_active !== false && (item.customer_id === null || item.customer_id === form.customer_id)))
const formError = ref('')
let nextKey = 2
const form = reactive({ customer_id: 0, source: '', requested_at: toDateTimeLocal(new Date().toISOString()), service_type: 'tourism' as RentalServiceType, start_at: '', end_at: '', trip_mode: 'custom' as 'route' | 'custom', route_id: 0, pickup_location: '', dropoff_location: '', note: '', items: [{ key: 1, vehicle_type_id: 0, quantity: 1, note: '' }] as FormItem[] })

watch(() => requestQuery.data.value, (request) => {
  if (!request) return
  form.customer_id = request.customer_id; form.source = request.source ?? ''; form.requested_at = toDateTimeLocal(request.requested_at); form.service_type = request.service_type; form.start_at = toDateTimeLocal(request.start_at); form.end_at = toDateTimeLocal(request.end_at); form.route_id = request.items[0]?.route_id ?? 0; form.trip_mode = form.route_id ? 'route' : 'custom'; form.pickup_location = request.pickup_location ?? ''; form.dropoff_location = request.dropoff_location ?? ''; form.note = request.note ?? ''; form.items = request.items.map((item) => ({ key: nextKey++, vehicle_type_id: item.vehicle_type_id, quantity: item.quantity, note: item.note ?? '' }))
}, { immediate: true })

watch(() => form.customer_id, () => { if (form.route_id && !availableRoutes.value.some((item) => item.id === form.route_id)) form.route_id = 0 })
const mutationPending = computed(() => mutations.createRequest.isPending.value || mutations.updateRequest.isPending.value)
function addItem() { form.items.push({ key: nextKey++, vehicle_type_id: 0, quantity: 1, note: '' }) }
function removeItem(index: number) { if (form.items.length > 1) form.items.splice(index, 1) }
function payload(): RentalRequestPayload {
  return { customer_id: form.customer_id, source: form.source || null, requested_at: toApiDateTime(form.requested_at), service_type: form.service_type, pickup_location: form.trip_mode === 'custom' ? form.pickup_location || null : null, dropoff_location: form.trip_mode === 'custom' ? form.dropoff_location || null : null, start_at: toApiDateTime(form.start_at), end_at: form.end_at ? toApiDateTime(form.end_at) : null, note: form.note || null, items: form.items.map((item) => ({ vehicle_type_id: item.vehicle_type_id, quantity: Number(item.quantity), route_id: form.trip_mode === 'route' ? form.route_id || null : null, note: item.note || null })) }
}
async function submit() {
  formError.value = ''
  if (!form.customer_id || !form.requested_at || !form.start_at || !form.items.every((item) => item.vehicle_type_id && item.quantity > 0) || (form.trip_mode === 'route' ? !form.route_id : !form.pickup_location || !form.dropoff_location)) { formError.value = 'Vui lòng nhập đủ thông tin bắt buộc.'; return }
  try { const result = isEdit.value ? await mutations.updateRequest.mutateAsync({ id: id.value, data: payload() }) : await mutations.createRequest.mutateAsync(payload()); toast.success(isEdit.value ? 'Đã cập nhật yêu cầu thuê.' : 'Đã tạo yêu cầu thuê.'); await router.push({ name: 'rental-requests-detail', params: { id: result.id } }) } catch (error) { formError.value = error instanceof ApiError ? error.message : 'Không thể lưu yêu cầu thuê.' }
}
</script>
