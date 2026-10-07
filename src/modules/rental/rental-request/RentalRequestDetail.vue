<template>
  <section class="mx-auto max-w-6xl space-y-5">
    <p v-if="query.isPending.value" class="rounded-md border p-4 text-muted-foreground">
      Đang tải yêu cầu thuê xe...
    </p>
    <div v-else-if="query.isError.value" class="rounded-md bg-destructive/10 p-4 text-destructive">
      Không tìm thấy hoặc không thể tải yêu cầu thuê xe.
    </div>
    <template v-else-if="request">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-semibold">{{ request.request_no }}</h1>
            <span class="rounded-full bg-muted px-2 py-1 text-xs">{{
              requestStatusLabel(request.status)
            }}</span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ request.customer_name }} · {{ serviceTypeLabel(request.service_type) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            v-if="canManageRequest && request.status === 'new'"
            variant="outline"
            @click="router.push({ name: 'rental-requests-edit', params: { id: request.id } })"
            >Sửa</Button
          ><Button
            v-if="canCreateQuotation"
            variant="outline"
            :disabled="availabilityCheck.isPending.value"
            @click="checkCapacity"
            >{{
              availabilityCheck.isPending.value ? 'Đang kiểm tra...' : 'Kiểm tra năng lực'
            }}</Button
          ><Button
            v-if="canCreateQuotation"
            :disabled="!availabilityResult?.can_fulfill || availabilityCheck.isPending.value"
            @click="createQuotation"
            >Tạo báo giá</Button
          >
        </div>
      </header>

      <section
        v-if="canCreateQuotation && ['new', 'quoted'].includes(request.status)"
        class="rounded-lg border bg-card p-5"
      >
        <div>
          <h2 class="font-semibold">Năng lực phục vụ</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Kiểm tra tức thời theo giờ khởi hành và dự kiến kết thúc. Báo giá nháp không giữ xe hoặc
            tài xế.
          </p>
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
                ? 'Đủ xe và tài xế — có thể tạo báo giá.'
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
        <p v-else class="mt-4 text-sm text-muted-foreground">
          Chọn “Kiểm tra năng lực” trước khi tạo báo giá.
        </p>
      </section>

      <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div class="space-y-5">
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Thông tin hành trình</h2>
            <dl class="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt class="text-muted-foreground">Điểm đón</dt>
                <dd>{{ request.pickup_location || '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground">Điểm trả</dt>
                <dd>{{ request.dropoff_location || '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground">Khởi hành</dt>
                <dd>{{ formatDate(request.start_at, true) }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground">Dự kiến kết thúc</dt>
                <dd>{{ formatDate(request.end_at, true) }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground">Nguồn</dt>
                <dd>{{ request.source || '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground">Tiếp nhận</dt>
                <dd>{{ formatDate(request.requested_at, true) }}</dd>
              </div>
            </dl>
            <p v-if="request.note" class="mt-4 rounded bg-muted p-3 text-sm">{{ request.note }}</p>
          </section>
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Hạng mục xe</h2>
            <table class="mt-4 w-full text-sm">
              <thead class="text-left text-muted-foreground">
                <tr>
                  <th class="pb-2">Loại xe</th>
                  <th class="pb-2">Tuyến</th>
                  <th class="pb-2">Số lượng</th>
                  <th class="pb-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in request.items" :key="item.id" class="border-t">
                  <td class="py-2">{{ item.vehicle_type_name }}</td>
                  <td>{{ item.route_name || 'Tự nhập' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.note || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
        <aside class="space-y-5">
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Khách hàng</h2>
            <dl class="mt-3 space-y-2 text-sm">
              <div>{{ request.customer?.name }}</div>
              <div class="text-muted-foreground">{{ request.customer?.contact_name || '—' }}</div>
              <div>{{ request.customer?.phone || '—' }}</div>
              <div>{{ request.customer?.email || '—' }}</div>
            </dl>
          </section>
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Báo giá liên quan</h2>
            <div class="mt-3 space-y-2">
              <button
                v-for="quotation in relatedQuotations"
                :key="quotation.id"
                class="block w-full rounded border p-2 text-left text-sm hover:bg-muted"
                @click="router.push({ name: 'quotations-detail', params: { id: quotation.id } })"
              >
                {{ quotation.quotation_no }} · {{ quotationStatusLabel(quotation.status) }}
              </button>
              <p v-if="!relatedQuotations.length" class="text-sm text-muted-foreground">
                Chưa có báo giá.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import {
  availabilityFailureMessage,
  availabilityPayloadFromRequest,
} from '@/modules/rental/rental.capacity'
import {
  formatDate,
  quotationStatusLabel,
  requestStatusLabel,
  serviceTypeLabel,
} from '@/modules/rental/rental.format'
import {
  useAvailabilityCheckMutation,
  useQuotationsQuery,
  useRentalRequestQuery,
} from '@/modules/rental/rental.composables'
import type { AvailabilityResult } from '@/modules/rental/rental.types'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/api-error'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
const query = useRentalRequestQuery(() => id.value)
const quotationsQuery = useQuotationsQuery()
const availabilityCheck = useAvailabilityCheckMutation()
const request = computed(() => query.data.value)
const relatedQuotations = computed(() =>
  (quotationsQuery.data.value ?? []).filter((item) => item.rental_request_id === id.value),
)
const canManageRequest = computed(
  () => auth.user?.permissions.includes('rental-requests.manage') ?? false,
)
const canCreateQuotation = computed(
  () =>
    canManageRequest.value &&
    (auth.user?.permissions.includes('quotations.manage') ?? false) &&
    ['new', 'quoted'].includes(request.value?.status ?? ''),
)
const availabilityResult = ref<AvailabilityResult | null>(null)
const capacityError = ref('')
watch(id, () => {
  availabilityResult.value = null
  capacityError.value = ''
})

function capacityErrorMessage(error: unknown): string {
  return error instanceof ApiError && error.statusCode === 403
    ? 'Bạn không có quyền kiểm tra năng lực xe và tài xế.'
    : error instanceof ApiError
      ? error.message
      : 'Không thể kiểm tra năng lực điều độ.'
}
async function checkCapacity(): Promise<boolean> {
  const currentRequest = request.value
  if (!currentRequest) return false
  const payload = availabilityPayloadFromRequest(currentRequest)
  if (!payload) {
    availabilityResult.value = null
    capacityError.value =
      'Yêu cầu thuê cần có thời gian khởi hành, dự kiến kết thúc và ít nhất một hạng mục xe.'
    return false
  }
  capacityError.value = ''
  try {
    const result = await availabilityCheck.mutateAsync(payload)
    availabilityResult.value = result
    if (!result.can_fulfill) {
      capacityError.value = availabilityFailureMessage(result)
      toast.error(capacityError.value)
    }
    return result.can_fulfill
  } catch (error) {
    availabilityResult.value = null
    capacityError.value = capacityErrorMessage(error)
    toast.error(capacityError.value)
    return false
  }
}
async function createQuotation(): Promise<void> {
  if (!availabilityResult.value?.can_fulfill && !(await checkCapacity())) return
  if (!request.value) return
  await router.push({ name: 'quotations-create', query: { rental_request_id: request.value.id } })
}
</script>
