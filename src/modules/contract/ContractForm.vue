<template>
  <section class="mx-auto max-w-6xl space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">
          {{
            isEdit
              ? 'Cập nhật hợp đồng'
              : isFromQuotation
                ? 'Tạo hợp đồng từ báo giá'
                : 'Tạo hợp đồng'
          }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{
            isFromQuotation
              ? 'Dữ liệu nguồn được khóa theo báo giá đã duyệt; hợp đồng sẽ được lưu ở trạng thái nháp.'
              : 'Nhập thông tin hợp đồng và các hạng mục dịch vụ.'
          }}
        </p>
      </div>
      <Button variant="outline" @click="router.push({ name: 'contracts' })">Quay lại</Button>
    </header>
    <p v-if="sourceError" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {{ sourceError }}
    </p>
    <form class="space-y-5" @submit.prevent="submit">
      <section class="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-2 xl:grid-cols-4">
        <template v-if="isFromQuotation && quotation"
          ><div class="space-y-1.5">
            <span>Khách hàng</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ quotation.customer_name || '—' }}
            </p>
          </div>
          <div class="space-y-1.5">
            <span>Báo giá</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ quotation.quotation_no }}
            </p>
          </div>
          <div class="space-y-1.5">
            <span>Yêu cầu thuê</span>
            <p class="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">
              {{ quotation.rental_request_no || '—' }}
            </p>
          </div></template
        >
        <label v-else class="space-y-1.5"
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
          ><span>Loại hợp đồng *</span
          ><select
            v-model="form.contract_type"
            class="h-10 w-full rounded-md border bg-background px-3"
          >
            <option value="trip">Hợp đồng theo chuyến</option>
            <option value="principle">Hợp đồng nguyên tắc</option>
          </select></label
        >
        <label class="space-y-1.5"
          ><span>Ngày ký</span><Input v-model="form.signed_date" class="h-10" type="date"
        /></label>
        <label class="space-y-1.5"
          ><span>Hiệu lực từ *</span><Input v-model="form.effective_from" class="h-10" type="date"
        /></label>
        <label class="space-y-1.5"
          ><span>Hiệu lực đến</span><Input v-model="form.effective_to" class="h-10" type="date"
        /></label>
        <label class="space-y-1.5"
          ><span>Đặt cọc</span
          ><Input v-model="form.deposit_required" class="h-10" min="0" type="number"
        /></label>
      </section>
      <section class="rounded-lg border bg-card p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Hạng mục hợp đồng</h2>
            <p v-if="isFromQuotation" class="mt-1 text-sm text-muted-foreground">
              Hạng mục sao chép từ báo giá và được xử lý bởi backend.
            </p>
          </div>
          <Button v-if="!isFromQuotation" type="button" variant="outline" size="sm" @click="addItem"
            >Thêm hạng mục</Button
          >
        </div>
        <div v-if="isFromQuotation && quotation" class="overflow-x-auto">
          <table class="w-full min-w-[680px] text-sm">
            <thead class="border-b text-left text-muted-foreground">
              <tr>
                <th class="pb-2">Loại xe</th>
                <th class="pb-2">Tuyến</th>
                <th class="pb-2">Nội dung</th>
                <th class="pb-2 text-right">SL</th>
                <th class="pb-2 text-right">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in quotation.items" :key="item.id" class="border-b">
                <td class="py-2">{{ item.vehicle_type_name || '—' }}</td>
                <td>{{ item.route_name || '—' }}</td>
                <td>{{ item.description || '—' }}</td>
                <td class="text-right">{{ item.quantity }}</td>
                <td class="text-right">{{ formatCurrency(item.unit_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(item, index) in form.items"
            :key="item.key"
            class="grid gap-3 rounded-md border p-3 lg:grid-cols-[1fr_1fr_1fr_100px_140px_140px_auto]"
          >
            <select
              v-model.number="item.vehicle_type_id"
              class="h-10 rounded-md border bg-background px-3"
            >
              <option :value="0">Loại xe *</option>
              <option v-for="type in vehicleTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option></select
            ><select
              v-model.number="item.route_id"
              class="h-10 rounded-md border bg-background px-3"
            >
              <option :value="0">Không chọn tuyến</option>
              <option
                v-for="routeItem in availableRoutes"
                :key="routeItem.id"
                :value="routeItem.id"
              >
                {{ routeItem.name }}
              </option></select
            ><select v-model="item.service_type" class="h-10 rounded-md border bg-background px-3">
              <option value="tourism">Tour du lịch</option>
              <option value="school">Đưa đón học sinh</option>
              <option value="business">Đưa đón công nhân</option>
              <option value="fixed">Tuyến cố định</option></select
            ><Input v-model.number="item.quantity" class="h-10" min="1" type="number" /><Input
              v-model="item.unit_price"
              class="h-10"
              min="0"
              type="number"
              placeholder="Đơn giá"
            /><Input
              v-model="item.driver_wage"
              class="h-10"
              min="0"
              type="number"
              placeholder="Lương tài xế"
            /><Button
              type="button"
              variant="ghost"
              :disabled="form.items.length === 1"
              @click="removeItem(index)"
              >Xóa</Button
            ><Input
              v-model="item.pickup_location"
              class="h-10 lg:col-span-2"
              placeholder="Điểm đón"
            /><Input
              v-model="item.dropoff_location"
              class="h-10 lg:col-span-2"
              placeholder="Điểm trả"
            /><Input v-model="item.note" class="h-10 lg:col-span-3" placeholder="Ghi chú" />
            <p class="text-sm text-muted-foreground lg:col-span-7">
              Thành tiền:
              {{ formatCurrency(Number(item.quantity || 0) * Number(item.unit_price || 0)) }}
            </p>
          </div>
        </div>
      </section>
      <section class="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-3">
        <div class="rounded-md bg-muted p-3">
          <p class="text-sm text-muted-foreground">Tổng tiền dự kiến</p>
          <p class="font-semibold">{{ formatCurrency(previewTotal) }}</p>
        </div>
        <div class="rounded-md bg-muted p-3">
          <p class="text-sm text-muted-foreground">Đặt cọc</p>
          <p class="font-semibold">{{ formatCurrency(form.deposit_required || 0) }}</p>
        </div>
        <label class="space-y-1.5 md:col-span-3"
          ><span>Điều khoản thanh toán</span
          ><textarea
            v-model="form.payment_terms"
            class="min-h-22 w-full rounded-md border bg-background p-3 text-sm"
          /></label
        ><label class="space-y-1.5 md:col-span-3"
          ><span>Điều khoản hợp đồng</span
          ><textarea
            v-model="form.terms"
            class="min-h-28 w-full rounded-md border bg-background p-3 text-sm"
          />
        </label>
      </section>
      <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
      <div class="flex justify-end">
        <Button type="submit" :disabled="isPending || Boolean(sourceError)">{{
          isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Lưu hợp đồng nháp'
        }}</Button>
      </div>
    </form>
  </section>
</template>
<script setup lang="ts">
import { useContractMutations, useContractQuery } from '@/modules/contract/contract.composables'
import { isValidDeposit } from '@/modules/contract/contract.helpers'
import {
  contractFormSchema,
  contractFromQuotationSchema,
} from '@/modules/contract/schemas/contract.schema'
import type {
  ContractItemPayload,
  ContractPayload,
  ContractType,
} from '@/modules/contract/contract.types'
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import { useRouteQuery } from '@/modules/master-data/route/composables/useRouteQueries'
import { useVehicleTypeQuery } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
import { formatCurrency } from '@/modules/rental/rental.format'
import { useQuotationQuery, useRentalRequestQuery } from '@/modules/rental/rental.composables'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ApiError } from '@/shared/lib/api-error'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
type ItemForm = {
  key: number
  route_id: number | null
  vehicle_type_id: number
  service_type: ContractItemPayload['service_type']
  quantity: number
  unit_price: string
  driver_wage: string
  pickup_location: string
  dropoff_location: string
  note: string
}
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id ?? 0))
const quotationId = computed(() => Number(route.params.quotationId ?? 0))
const isEdit = computed(() => id.value > 0)
const isFromQuotation = computed(() => !isEdit.value && quotationId.value > 0)
const contractQuery = useContractQuery(() => id.value)
const quotationQuery = useQuotationQuery(() => quotationId.value)
const requestQuery = useRentalRequestQuery(() => quotationQuery.data.value?.rental_request_id ?? 0)
const { data: customerData } = useCustomerQuery()
const { data: vehicleTypeData } = useVehicleTypeQuery()
const { data: routeData } = useRouteQuery()
const mutations = useContractMutations()
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
let nextKey = 2
const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  customer_id: 0,
  contract_type: 'trip' as ContractType,
  signed_date: today,
  effective_from: '',
  effective_to: '',
  deposit_required: '0',
  payment_terms: '',
  terms: '',
  items: [
    {
      key: 1,
      route_id: null,
      vehicle_type_id: 0,
      service_type: 'tourism' as const,
      quantity: 1,
      unit_price: '0',
      driver_wage: '0',
      pickup_location: '',
      dropoff_location: '',
      note: '',
    },
  ] as ItemForm[],
})
const formError = ref('')
const quotation = computed(() => quotationQuery.data.value)
const sourceError = computed(() => {
  if (!isFromQuotation.value) return ''
  if (quotationQuery.isError.value) return 'Không thể tải báo giá để tạo hợp đồng.'
  if (requestQuery.isError.value) return 'Không thể tải yêu cầu thuê liên quan.'
  const quote = quotation.value
  const request = requestQuery.data.value
  if (!quote || !request) return ''
  return quote.status !== 'approved' || request.status !== 'accepted'
    ? 'Chỉ có thể tạo hợp đồng từ báo giá đã duyệt và yêu cầu thuê đã được chấp nhận.'
    : ''
})
const previewTotal = computed(() =>
  isFromQuotation.value
    ? Number(quotation.value?.total_amount ?? 0)
    : form.items.reduce((sum, item) => sum + item.quantity * Number(item.unit_price || 0), 0),
)
const isPending = computed(
  () =>
    mutations.create.isPending.value ||
    mutations.createFromQuotation.isPending.value ||
    mutations.update.isPending.value,
)
watch(
  () => contractQuery.data.value,
  (contract) => {
    if (!contract || !isEdit.value) return
    form.customer_id = contract.customer_id
    form.contract_type = contract.contract_type
    form.signed_date = contract.signed_date ?? ''
    form.effective_from = contract.effective_from
    form.effective_to = contract.effective_to ?? ''
    form.deposit_required = contract.deposit_required
    form.payment_terms = contract.payment_terms ?? ''
    form.terms = contract.terms ?? ''
    form.items = contract.items.map((item) => ({
      ...item,
      key: nextKey++,
      pickup_location: item.pickup_location ?? '',
      dropoff_location: item.dropoff_location ?? '',
      note: item.note ?? '',
    }))
  },
  { immediate: true },
)
watch(
  [quotation, () => requestQuery.data.value],
  ([quote, request]) => {
    if (!isFromQuotation.value || !quote || !request) return
    form.customer_id = quote.customer_id
    form.contract_type = 'trip'
    form.signed_date = today
    form.effective_from = request.start_at?.slice(0, 10) ?? today
    form.effective_to = request.end_at?.slice(0, 10) ?? form.effective_from
    form.deposit_required = '0'
    form.payment_terms = quote.payment_terms ?? ''
  },
  { immediate: true },
)
function addItem() {
  form.items.push({
    key: nextKey++,
    route_id: null,
    vehicle_type_id: 0,
    service_type: 'tourism',
    quantity: 1,
    unit_price: '0',
    driver_wage: '0',
    pickup_location: '',
    dropoff_location: '',
    note: '',
  })
}
function removeItem(index: number) {
  if (form.items.length > 1) form.items.splice(index, 1)
}
function payload(): ContractPayload {
  return {
    customer_id: form.customer_id,
    contract_type: form.contract_type,
    signed_date: form.signed_date || null,
    effective_from: form.effective_from,
    effective_to: form.effective_to || null,
    deposit_required: String(form.deposit_required || '0'),
    payment_terms: form.payment_terms || null,
    terms: form.terms || null,
    items: form.items.map(({ key: _key, ...item }) => ({
      ...item,
      route_id: item.route_id || null,
      pickup_location: item.pickup_location || null,
      dropoff_location: item.dropoff_location || null,
      note: item.note || null,
    })),
  }
}
async function submit() {
  formError.value = ''
  if (sourceError.value) {
    formError.value = sourceError.value
    return
  }
  const schema = isFromQuotation.value ? contractFromQuotationSchema : contractFormSchema
  const validation = schema.safeParse(
    isFromQuotation.value
      ? {
          quotation_id: quotationId.value,
          ...form,
          signed_date: form.signed_date || '',
          effective_to: form.effective_to || '',
        }
      : {
          ...form,
          signed_date: form.signed_date || '',
          effective_to: form.effective_to || '',
          items: form.items.map(({ key: _key, ...item }) => item),
        },
  )
  if (!validation.success) {
    formError.value = validation.error.issues[0]?.message || 'Dữ liệu chưa hợp lệ.'
    return
  }
  if (
    !form.effective_from ||
    !isValidDeposit(form.deposit_required, previewTotal.value) ||
    (!isFromQuotation.value &&
      (!form.customer_id ||
        !form.items.every(
          (item) => item.vehicle_type_id && item.quantity > 0 && Number(item.unit_price) >= 0,
        )))
  ) {
    formError.value = !isValidDeposit(form.deposit_required, previewTotal.value)
      ? 'Tiền đặt cọc không được lớn hơn tổng giá trị hợp đồng.'
      : 'Vui lòng nhập đủ các trường bắt buộc.'
    return
  }
  try {
    const result = isFromQuotation.value
      ? await mutations.createFromQuotation.mutateAsync({
          quotation_id: quotationId.value,
          contract_type: form.contract_type,
          signed_date: form.signed_date || null,
          effective_from: form.effective_from,
          effective_to: form.effective_to || null,
          deposit_required: String(form.deposit_required || '0'),
          payment_terms: form.payment_terms || null,
          terms: form.terms || null,
        })
      : isEdit.value
        ? await mutations.update.mutateAsync({ id: id.value, data: payload() })
        : await mutations.create.mutateAsync(payload())
    toast.success(isEdit.value ? 'Đã cập nhật hợp đồng.' : 'Đã lưu hợp đồng nháp.')
    await router.push({ name: 'contracts-detail', params: { id: result.id } })
  } catch (error) {
    formError.value = error instanceof ApiError ? error.message : 'Không thể lưu hợp đồng.'
  }
}
</script>
