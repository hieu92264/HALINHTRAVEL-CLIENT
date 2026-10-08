<template>
  <section class="mx-auto max-w-6xl space-y-5">
    <p v-if="query.isPending.value" class="rounded-md border p-4 text-muted-foreground">
      Đang tải báo giá...
    </p>
    <div v-else-if="query.isError.value" class="rounded-md bg-destructive/10 p-4 text-destructive">
      Không tìm thấy hoặc không thể tải báo giá.
    </div>
    <template v-else-if="quotation"
      ><header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-semibold">{{ quotation.quotation_no }}</h1>
            <span class="rounded-full bg-muted px-2 py-1 text-xs">{{
              quotationStatusLabel(quotation.status)
            }}</span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ quotation.customer_name }} · {{ formatDate(quotation.quotation_date) }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            v-if="canCreateContract && quotation.status === 'approved' && quotation.rental_request_id"
            @click="
              router.push({
                name: 'contracts-from-quotation',
                params: { quotationId: quotation.id },
              })
            "
            >Tạo hợp đồng</Button
          ><template v-if="canManage"
            ><Button
              v-if="quotation.status === 'draft' && isQuotationCurrent(quotation)"
              variant="outline"
              @click="router.push({ name: 'quotations-edit', params: { id: quotation.id } })"
              >Sửa</Button
            ><Button v-if="quotation.status === 'draft' && quotation.customer_email && isQuotationCurrent(quotation)" @click="send"
              >Gửi email</Button
            ><Button
              v-if="
                (quotation.status === 'sent' ||
                (quotation.status === 'draft' && !quotation.customer_email)) &&
                isQuotationCurrent(quotation)
              "
              variant="outline"
              @click="phoneResponse"
              >Ghi nhận cuộc gọi</Button
            ><Button v-if="quotation.status === 'sent'" variant="outline" @click="expire"
              >Hết hạn</Button
            ></template
          >
        </div>
      </header>
      <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div class="space-y-5">
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Hạng mục báo giá</h2>
            <table class="mt-4 w-full text-sm">
              <thead class="text-left text-muted-foreground">
                <tr>
                  <th class="pb-2">Loại xe</th>
                  <th class="pb-2">Tuyến</th>
                  <th class="pb-2">Nội dung</th>
                  <th class="pb-2">SL</th>
                  <th class="pb-2 text-right">Đơn giá</th>
                  <th class="pb-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in quotation.items" :key="item.id" class="border-t">
                  <td class="py-2">{{ item.vehicle_type_name }}</td>
                  <td>{{ item.route_name || '—' }}</td>
                  <td>{{ item.description || '—' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td class="text-right">{{ formatCurrency(item.unit_price) }}</td>
                  <td class="text-right">{{ formatCurrency(item.amount ?? 0) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="ml-auto mt-5 max-w-sm space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Tạm tính</span><b>{{ formatCurrency(quotation.subtotal) }}</b>
              </div>
              <div class="flex justify-between">
                <span>Chiết khấu</span><b>{{ formatCurrency(quotation.discount_amount) }}</b>
              </div>
              <div class="flex justify-between border-t pt-2 text-base">
                <span>Tổng tiền</span><b>{{ formatCurrency(quotation.total_amount) }}</b>
              </div>
            </div>
          </section>
          <section v-if="quotation.payment_terms" class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Điều khoản thanh toán</h2>
            <p class="mt-3 whitespace-pre-line text-sm">{{ quotation.payment_terms }}</p>
          </section>
        </div>
        <aside class="space-y-5">
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Thông tin phản hồi</h2>
            <dl class="mt-3 space-y-2 text-sm">
              <div>Hạn hiệu lực: {{ formatDate(quotation.valid_until) }}</div>
              <div>Phản hồi lúc: {{ formatDate(quotation.customer_responded_at, true) }}</div>
              <div>Người duyệt: {{ quotation.approved_by || '—' }}</div>
              <div>Ngày duyệt: {{ formatDate(quotation.approved_at, true) }}</div>
              <div v-if="quotation.customer_response_note" class="rounded bg-muted p-2">
                {{ quotation.customer_response_note }}
              </div>
            </dl>
          </section>
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Thông tin hệ thống</h2>
            <dl class="mt-3 space-y-2 text-sm">
              <div>Tạo bởi: {{ quotation.user_name_created || '—' }}</div>
              <div>Tạo lúc: {{ formatDate(quotation.created_at, true) }}</div>
              <div>Cập nhật: {{ formatDate(quotation.updated_at, true) }}</div>
            </dl>
          </section>
        </aside>
      </div></template
    >
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { formatCurrency, formatDate, quotationStatusLabel } from '@/modules/rental/rental.format'
import { isQuotationCurrent } from '@/modules/rental/rental-table'
import { useQuotationQuery, useRentalMutations } from '@/modules/rental/rental.composables'
import { Button } from '@/shared/components/ui/button'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
const query = useQuotationQuery(() => id.value)
const quotation = computed(() => query.data.value)
const mutations = useRentalMutations()
const canManage = computed(() => auth.user?.permissions.includes('quotations.manage') ?? false)
const canCreateContract = computed(
  () => auth.user?.permissions.includes('contracts.manage') ?? false,
)
async function send() {
  try {
    await mutations.sendQuotation.mutateAsync(id.value)
    toast.success('Đã gửi báo giá qua email.')
  } catch {
    toast.error('Không thể gửi báo giá.')
  }
}
async function expire() {
  if (!window.confirm('Đánh dấu báo giá hết hạn?')) return
  try {
    await mutations.expireQuotation.mutateAsync(id.value)
    toast.success('Đã cập nhật trạng thái hết hạn.')
  } catch {
    toast.error('Không thể cập nhật báo giá.')
  }
}
async function phoneResponse() {
  const accepted = window.confirm('Khách hàng đồng ý báo giá? Chọn “Hủy” để ghi nhận từ chối.')
  const note = window.prompt('Ghi chú cuộc gọi (không bắt buộc):') ?? undefined
  try {
    await mutations.recordCustomerResponse.mutateAsync({ id: id.value, accepted, note })
    toast.success(accepted ? 'Đã ghi nhận khách đồng ý.' : 'Đã ghi nhận khách từ chối.')
  } catch {
    toast.error('Không thể ghi nhận phản hồi.')
  }
}
</script>
