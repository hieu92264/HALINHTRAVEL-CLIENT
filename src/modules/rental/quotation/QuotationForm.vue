<template>
  <section class="mx-auto max-w-6xl space-y-5">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">{{ isEdit ? 'Cập nhật báo giá' : 'Tạo báo giá' }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{
            isRequestPrefill
              ? 'Thông tin yêu cầu đã được khóa; chỉ cần nhập đơn giá cho từng hạng mục.'
              : 'Báo giá phải được tạo từ trang chi tiết của một yêu cầu thuê xe.'
          }}
        </p>
      </div>
      <Button variant="outline" @click="router.push({ name: 'quotations' })">Quay lại</Button>
    </header>

    <p
      v-if="quotationQuery.isError.value"
      class="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
    >
      Không thể tải báo giá.
    </p>
    <p
      v-if="linkedRequestQuery.isError.value"
      class="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
    >
      Không thể tải yêu cầu thuê xe để lập báo giá.
    </p>
    <p
      v-if="!isEdit && !isRequestPrefill"
      class="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
    >
      Báo giá phải được tạo từ một yêu cầu thuê xe hợp lệ.
      <button class="ml-1 font-semibold underline" type="button" @click="router.push({ name: 'rental-requests' })">Đi đến danh sách yêu cầu thuê xe</button>.
    </p>

    <form v-if="isEdit || isRequestPrefill" class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2 xl:grid-cols-4">
        <template v-if="isRequestPrefill && linkedRequest">
          <div class="space-y-1.5">
            <span>Khách hàng</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ linkedRequest.customer_name || '—' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <span>Yêu cầu thuê</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ linkedRequest.request_no }}
            </p>
          </div>
          <div class="space-y-1.5">
            <span>Khởi hành dự kiến</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ formatDate(linkedRequest.start_at, true) }}
            </p>
          </div>
          <div class="space-y-1.5">
            <span>Kết thúc dự kiến</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ formatDate(linkedRequest.end_at, true) }}
            </p>
          </div>
          <label class="space-y-1.5"
            ><span>Ngày báo giá *</span><Input v-model="form.quotation_date" class="h-10" type="date"
          /></label>
          <label class="space-y-1.5"
            ><span>Hiệu lực đến *</span><Input v-model="form.valid_until" class="h-10" type="date"
          /></label>
        </template>
        <template v-else>
          <label class="space-y-1.5"
            ><span>Khách hàng *</span
            ><select
              v-model.number="form.customer_id"
              class="h-10 w-full rounded-md border bg-background px-3"
            >
              <option :value="0">Chọn khách hàng</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select></label
          >
          <label class="space-y-1.5"
            ><span>Yêu cầu thuê</span
            ><select
              v-model.number="form.rental_request_id"
              class="h-10 w-full rounded-md border bg-background px-3"
              @change="prefillFromRequest"
            >
              <option :value="0">Không gắn yêu cầu</option>
              <option v-for="request in eligibleRequests" :key="request.id" :value="request.id">
                {{ request.request_no }} — {{ request.customer_name }}
              </option>
            </select></label
          >
          <label class="space-y-1.5"
            ><span>Ngày báo giá *</span
            ><Input v-model="form.quotation_date" class="h-10" type="date"
          /></label>
          <label class="space-y-1.5"
            ><span>Hiệu lực đến *</span><Input v-model="form.valid_until" class="h-10" type="date"
          /></label>
        </template>
      </div>

      <section v-if="isRequestPrefill" class="rounded-lg border bg-card p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-semibold">Kiểm tra năng lực điều độ</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Kết quả tức thời, chưa giữ xe hoặc tài xế cho báo giá nháp.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            :disabled="availabilityCheck.isPending.value"
            @click="checkLinkedRequestCapacity"
            >{{ availabilityCheck.isPending.value ? 'Đang kiểm tra...' : 'Kiểm tra lại' }}</Button
          >
        </div>
        <p
          v-if="capacityError"
          class="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {{ capacityError }}
        </p>
        <div v-else-if="availabilityResult" class="mt-4 space-y-3 text-sm">
          <p
            :class="availabilityResult.can_fulfill ? 'text-emerald-700' : 'text-destructive'"
            class="font-medium"
          >
            {{
              availabilityResult.can_fulfill
                ? 'Đủ xe và tài xế để lập báo giá.'
                : availabilityFailureMessage(availabilityResult)
            }}
          </p>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[620px]">
              <thead class="border-b text-left text-muted-foreground">
                <tr>
                  <th class="pb-2">Loại xe</th>
                  <th class="pb-2 text-right">Yêu cầu</th>
                  <th class="pb-2 text-right">Xe công ty</th>
                  <th class="pb-2 text-right">Xe đối tác</th>
                  <th class="pb-2 text-right">Tổng rảnh</th>
                  <th class="pb-2">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="capacity in availabilityResult.vehicle_capacities"
                  :key="capacity.vehicle_type_id"
                  class="border-b"
                >
                  <td class="py-2">{{ capacity.vehicle_type_name || '—' }}</td>
                  <td class="text-right">{{ capacity.required_quantity }}</td>
                  <td class="text-right">{{ capacity.company_available_count }}</td>
                  <td class="text-right">{{ capacity.partner_available_count }}</td>
                  <td class="text-right">{{ capacity.available_count }}</td>
                  <td :class="capacity.is_sufficient ? 'text-emerald-700' : 'text-destructive'">
                    {{ capacity.is_sufficient ? 'Đủ xe' : 'Thiếu xe' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            :class="
              availabilityResult.driver_capacity.is_sufficient
                ? 'text-emerald-700'
                : 'text-destructive'
            "
          >
            Tài xế: yêu cầu {{ availabilityResult.driver_capacity.required_quantity }}, rảnh
            {{ availabilityResult.driver_capacity.available_count }} (công ty
            {{ availabilityResult.driver_capacity.company_available_count }}, đối tác
            {{ availabilityResult.driver_capacity.partner_available_count }}) —
            {{ availabilityResult.driver_capacity.is_sufficient ? 'Đủ tài xế' : 'Thiếu tài xế' }}.
          </p>
        </div>
        <p v-else-if="availabilityCheck.isPending.value" class="mt-4 text-sm text-muted-foreground">
          Đang kiểm tra xe và tài xế khả dụng...
        </p>
      </section>

      <div class="rounded-lg border bg-card p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Hạng mục báo giá</h2>
            <p v-if="isRequestPrefill" class="mt-1 text-sm text-muted-foreground">
              Loại xe, tuyến và số lượng lấy từ yêu cầu thuê.
            </p>
          </div>
          <Button
            v-if="!isRequestPrefill"
            type="button"
            variant="outline"
            size="sm"
            @click="addItem"
            >Thêm hạng mục</Button
          >
        </div>
        <div class="space-y-3">
          <div
            v-for="(item, index) in form.items"
            :key="item.key"
            class="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_1fr_1fr_100px_150px_auto]"
          >
            <select
              v-model.number="item.vehicle_type_id"
              :disabled="isRequestPrefill"
              class="h-10 rounded-md border bg-background px-3 disabled:cursor-not-allowed disabled:bg-muted"
            >
              <option :value="0">Loại xe *</option>
              <option
                v-for="vehicleType in vehicleTypes"
                :key="vehicleType.id"
                :value="vehicleType.id"
              >
                {{ vehicleType.name }}
              </option></select
            ><select
              v-model.number="item.route_id"
              :disabled="isRequestPrefill"
              class="h-10 rounded-md border bg-background px-3 disabled:cursor-not-allowed disabled:bg-muted"
            >
              <option :value="0">Không chọn tuyến</option>
              <option
                v-for="itemRoute in availableRoutes"
                :key="itemRoute.id"
                :value="itemRoute.id"
              >
                {{ itemRoute.name }}
              </option></select
            ><Input
              v-model="item.description"
              :disabled="isRequestPrefill"
              class="h-10"
              placeholder="Nội dung"
            /><Input
              v-model.number="item.quantity"
              :disabled="isRequestPrefill"
              class="h-10"
              min="1"
              type="number"
            /><Input
              v-model="item.unit_price"
              class="h-10"
              min="0"
              type="number"
              placeholder="Đơn giá"
            /><Button
              v-if="!isRequestPrefill"
              type="button"
              variant="ghost"
              :disabled="form.items.length === 1"
              @click="removeItem(index)"
              >Xóa</Button
            >
            <p class="text-sm text-muted-foreground lg:col-span-6">
              Thành tiền:
              {{ formatCurrency(Number(item.quantity || 0) * Number(item.unit_price || 0)) }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-3">
        <label class="space-y-1.5"
          ><span>Chiết khấu</span
          ><Input v-model="form.discount_amount" class="h-10" min="0" type="number"
        /></label>
        <div class="rounded-md bg-muted p-3">
          <p class="text-sm text-muted-foreground">Tạm tính</p>
          <p class="font-semibold">{{ formatCurrency(subtotal) }}</p>
        </div>
        <div class="rounded-md bg-primary/10 p-3">
          <p class="text-sm text-muted-foreground">Tổng tiền dự kiến</p>
          <p class="font-semibold">{{ formatCurrency(total) }}</p>
        </div>
        <label class="space-y-1.5 md:col-span-3"
          ><span>Điều khoản thanh toán</span
          ><textarea
            v-model="form.payment_terms"
            class="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
          />
        </label>
      </div>
      <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
      <div class="flex justify-end">
        <Button
          type="submit"
          :disabled="
            mutationPending ||
            (!isEdit && !isRequestPrefill) ||
            (isRequestPrefill &&
              (!availabilityResult?.can_fulfill || availabilityCheck.isPending.value))
          "
          >{{ mutationPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Lưu nháp' }}</Button
        >
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import { useRouteQuery } from '@/modules/master-data/route/composables/useRouteQueries'
import { useVehicleTypeQuery } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
import {
  availabilityFailureMessage,
  availabilityPayloadFromRequest,
} from '@/modules/rental/rental.capacity'
import { formatCurrency, formatDate } from '@/modules/rental/rental.format'
import { quotationFormSchema } from '@/modules/rental/schemas/quotation.schema'
import {
  useAvailabilityCheckMutation,
  useQuotationQuery,
  useRentalMutations,
  useRentalRequestQuery,
  useRentalRequestsQuery,
} from '@/modules/rental/rental.composables'
import type {
  AvailabilityResult,
  QuotationPayload,
  QuotationUpdatePayload,
  RentalRequest,
} from '@/modules/rental/rental.types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ApiError } from '@/shared/lib/api-error'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

type FormItem = {
  key: number
  vehicle_type_id: number
  route_id: number
  description: string
  quantity: number
  unit_price: string
}
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id ?? 0))
const isEdit = computed(() => id.value > 0)
const routeRequestId = computed(() => Number(route.query.rental_request_id ?? 0))
const linkedRequestId = computed(() =>
  isEdit.value ? quotationQuery.data.value?.rental_request_id ?? 0 : routeRequestId.value,
)
const isRequestPrefill = computed(
  () => Number.isInteger(linkedRequestId.value) && linkedRequestId.value > 0,
)
const quotationQuery = useQuotationQuery(() => id.value)
const requestsQuery = useRentalRequestsQuery()
const linkedRequestQuery = useRentalRequestQuery(() =>
  isRequestPrefill.value ? linkedRequestId.value : 0,
)
const { data: customerData } = useCustomerQuery()
const { data: vehicleTypeData } = useVehicleTypeQuery()
const { data: routeData } = useRouteQuery()
const mutations = useRentalMutations()
const availabilityCheck = useAvailabilityCheckMutation()
const customers = computed(() =>
  (customerData.value ?? []).filter((item) => item.is_active !== false),
)
const vehicleTypes = computed(() =>
  (vehicleTypeData.value ?? []).filter((item) => item.is_active !== false),
)
const availableRoutes = computed(() =>
  (routeData.value ?? []).filter(
    (item) =>
      item.is_active !== false &&
      (item.customer_id === null || item.customer_id === form.customer_id),
  ),
)
const eligibleRequests = computed(() =>
  (requestsQuery.data.value ?? []).filter(
    (item) => item.status === 'new' || item.status === 'quoted',
  ),
)
const linkedRequest = computed(() => linkedRequestQuery.data.value)
let nextKey = 2
const form = reactive({
  customer_id: 0,
  rental_request_id: isRequestPrefill.value ? linkedRequestId.value : 0,
  quotation_date: new Date().toISOString().slice(0, 10),
  valid_until: '',
  discount_amount: '0',
  payment_terms: '',
  items: [
    { key: 1, vehicle_type_id: 0, route_id: 0, description: '', quantity: 1, unit_price: '0' },
  ] as FormItem[],
})
const formError = ref('')
const availabilityResult = ref<AvailabilityResult | null>(null)
const capacityError = ref('')
const subtotal = computed(() =>
  form.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0,
  ),
)
const total = computed(() =>
  Math.max(0, subtotal.value - Number(form.discount_amount || 0)),
)
const mutationPending = computed(
  () => mutations.createQuotation.isPending.value || mutations.updateQuotation.isPending.value,
)

function itemDescription(item: RentalRequest['items'][number]): string {
  return [item.vehicle_type_name, item.route_name].filter(Boolean).join(' · ')
}
function applyRentalRequest(request: RentalRequest): void {
  form.customer_id = request.customer_id
  form.rental_request_id = request.id
  form.items = request.items.map((item) => ({
    key: nextKey++,
    vehicle_type_id: item.vehicle_type_id,
    route_id: item.route_id ?? 0,
    description: itemDescription(item),
    quantity: item.quantity,
    unit_price: '0',
  }))
}
watch(
  () => quotationQuery.data.value,
  (quotation) => {
    if (!quotation) return
    form.customer_id = quotation.customer_id
    form.rental_request_id = quotation.rental_request_id ?? 0
    form.quotation_date = quotation.quotation_date
    form.valid_until = quotation.valid_until ?? ''
    form.discount_amount = quotation.discount_amount
    form.payment_terms = quotation.payment_terms ?? ''
    form.items = quotation.items.map((item) => ({
      key: nextKey++,
      vehicle_type_id: item.vehicle_type_id,
      route_id: item.route_id ?? 0,
      description: item.description ?? '',
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  },
  { immediate: true },
)
watch(
  linkedRequest,
  async (request) => {
    if (!request || !isRequestPrefill.value) return
    applyRentalRequest(request)
    await checkLinkedRequestCapacity()
  },
  { immediate: true },
)
watch(
  () => form.customer_id,
  () => {
    if (!isRequestPrefill.value)
      form.items.forEach((item) => {
        if (
          item.route_id &&
          !availableRoutes.value.some((routeItem) => routeItem.id === item.route_id)
        )
          item.route_id = 0
      })
  },
)

function addItem() {
  form.items.push({
    key: nextKey++,
    vehicle_type_id: 0,
    route_id: 0,
    description: '',
    quantity: 1,
    unit_price: '0',
  })
}
function removeItem(index: number) {
  if (form.items.length > 1) form.items.splice(index, 1)
}
function prefillFromRequest() {
  const request = eligibleRequests.value.find((item) => item.id === form.rental_request_id)
  if (request) applyRentalRequest(request)
}
function capacityErrorMessage(error: unknown): string {
  return error instanceof ApiError && error.statusCode === 403
    ? 'Bạn không có quyền kiểm tra năng lực xe và tài xế.'
    : error instanceof ApiError
      ? error.message
      : 'Không thể kiểm tra năng lực điều độ.'
}
async function checkLinkedRequestCapacity(): Promise<boolean> {
  const request = linkedRequest.value
  if (!request) return false
  const capacityPayload = availabilityPayloadFromRequest(request)
  if (!capacityPayload) {
    capacityError.value =
      'Yêu cầu thuê cần có thời gian khởi hành, dự kiến kết thúc và ít nhất một hạng mục xe.'
    availabilityResult.value = null
    return false
  }
  capacityError.value = ''
  try {
    const result = await availabilityCheck.mutateAsync(capacityPayload)
    availabilityResult.value = result
    if (!result.can_fulfill) capacityError.value = availabilityFailureMessage(result)
    return result.can_fulfill
  } catch (error) {
    availabilityResult.value = null
    capacityError.value = capacityErrorMessage(error)
    return false
  }
}
function payload(): QuotationPayload {
  return {
    customer_id: form.customer_id,
    rental_request_id: form.rental_request_id,
    quotation_date: form.quotation_date,
    valid_until: form.valid_until,
    discount_amount: String(form.discount_amount || '0'),
    payment_terms: form.payment_terms || null,
    items: form.items.map((item) => ({
      vehicle_type_id: item.vehicle_type_id,
      route_id: item.route_id || null,
      description: item.description || null,
      quantity: Number(item.quantity),
      unit_price: String(item.unit_price),
    })),
  }
}
function updatePayload(): QuotationUpdatePayload {
  const { rental_request_id: _rentalRequestId, ...data } = payload()

  return data
}
async function submit() {
  formError.value = ''
  if (!isEdit.value && !isRequestPrefill.value) {
    formError.value = 'Báo giá phải được tạo từ một yêu cầu thuê xe.'
    return
  }
  if (isRequestPrefill.value && !(await checkLinkedRequestCapacity())) {
    formError.value = capacityError.value || 'Chưa đủ năng lực để lập báo giá.'
    return
  }
  const validation = quotationFormSchema.safeParse({
    ...form,
    rental_request_id: form.rental_request_id,
    valid_until: form.valid_until || '',
    items: form.items.map(({ key: _key, ...item }) => ({
      ...item,
      route_id: item.route_id || null,
    })),
  })
  if (!validation.success) {
    formError.value = validation.error.issues[0]?.message || 'Dữ liệu chưa hợp lệ.'
    return
  }
  try {
    const result = isEdit.value
      ? await mutations.updateQuotation.mutateAsync({ id: id.value, data: updatePayload() })
      : await mutations.createQuotation.mutateAsync(payload())
    toast.success(isEdit.value ? 'Đã cập nhật báo giá.' : 'Đã lưu báo giá nháp.')
    await router.push({ name: 'quotations-detail', params: { id: result.id } })
  } catch (error) {
    formError.value = error instanceof ApiError ? error.message : 'Không thể lưu báo giá.'
  }
}
</script>
