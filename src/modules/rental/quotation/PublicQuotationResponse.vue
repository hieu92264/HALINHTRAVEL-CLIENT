<template>
  <main class="mx-auto min-h-svh max-w-3xl bg-background px-4 py-10">
    <div class="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <p v-if="!token" class="text-destructive">Liên kết phản hồi không hợp lệ.</p>
      <p v-else-if="query.isPending.value" class="text-muted-foreground">Đang tải báo giá...</p>
      <div v-else-if="query.isError.value" class="text-center">
        <h1 class="text-xl font-semibold">Liên kết không còn hiệu lực</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Liên kết có thể đã hết hạn hoặc đã được sử dụng.
        </p>
      </div>
      <template v-else-if="quotation"
        ><header class="border-b pb-5">
          <p class="text-sm text-muted-foreground">Hà Linh Travel</p>
          <h1 class="mt-1 text-2xl font-semibold">Báo giá {{ quotation.quotation_no }}</h1>
          <p class="mt-2 text-sm text-muted-foreground">Kính gửi {{ quotation.customer_name }}</p>
        </header>
        <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-muted-foreground">Ngày báo giá</dt>
            <dd>{{ formatDate(quotation.quotation_date) }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Hiệu lực đến</dt>
            <dd>{{ formatDate(quotation.valid_until) }}</dd>
          </div>
        </dl>
        <table class="mt-6 w-full text-sm">
          <thead class="border-b text-left text-muted-foreground">
            <tr>
              <th class="pb-2">Nội dung</th>
              <th class="pb-2 text-right">SL</th>
              <th class="pb-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in quotation.items" :key="item.id" class="border-b">
              <td class="py-3">{{ item.description || item.vehicle_type_name }}</td>
              <td class="py-3 text-right">{{ item.quantity }}</td>
              <td class="py-3 text-right">{{ formatCurrency(item.amount ?? 0) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-5 ml-auto max-w-xs space-y-2 border-t pt-3 text-sm">
          <div class="flex justify-between">
            <span>Tạm tính</span><b>{{ formatCurrency(quotation.subtotal) }}</b>
          </div>
          <div class="flex justify-between">
            <span>Chiết khấu</span><b>{{ formatCurrency(quotation.discount_amount) }}</b>
          </div>
          <div class="flex justify-between text-base">
            <span>Tổng tiền</span><b>{{ formatCurrency(quotation.total_amount) }}</b>
          </div>
        </div>
        <p
          v-if="quotation.payment_terms"
          class="mt-6 whitespace-pre-line rounded bg-muted p-3 text-sm"
        >
          {{ quotation.payment_terms }}
        </p>
        <div v-if="completed" class="mt-8 rounded-lg bg-primary/10 p-4 text-center">
          <b>{{
            completed === 'accepted'
              ? 'Cảm ơn quý khách đã chấp nhận báo giá.'
              : 'Chúng tôi đã ghi nhận phản hồi từ chối của quý khách.'
          }}</b>
        </div>
        <div v-else class="mt-8 space-y-3">
          <textarea
            v-model="rejectionNote"
            class="min-h-20 w-full rounded-md border bg-background p-3 text-sm"
            placeholder="Ghi chú nếu từ chối (không bắt buộc)"
          />
          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" :disabled="mutation.isPending.value" @click="reject"
              >Từ chối</Button
            ><Button :disabled="mutation.isPending.value" @click="accept">Chấp nhận báo giá</Button>
          </div>
          <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        </div></template
      >
    </div>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate } from '@/modules/rental/rental.format'
import { rentalQueryKeys } from '@/modules/rental/rental.composables'
import { RentalService } from '@/services/rental.service'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/api-error'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))
const completed = ref<'accepted' | 'rejected' | null>(null)
const rejectionNote = ref('')
const errorMessage = ref('')
const queryClient = useQueryClient()
const query = useQuery({
  queryKey: computed(() => rentalQueryKeys.publicQuotation(token.value)),
  queryFn: () => RentalService.getPublicQuotation(token.value),
  enabled: () => Boolean(token.value),
})
const quotation = computed(() => query.data.value)
const mutation = useMutation({
  mutationFn: ({ accepted, note }: { accepted: boolean; note?: string }) =>
    accepted
      ? RentalService.acceptPublicQuotation(token.value)
      : RentalService.rejectPublicQuotation(token.value, note),
  onSuccess: (result) => {
    queryClient.setQueryData(rentalQueryKeys.publicQuotation(token.value), result)
  },
})
async function accept() {
  errorMessage.value = ''
  try {
    await mutation.mutateAsync({ accepted: true })
    completed.value = 'accepted'
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Không thể ghi nhận phản hồi.'
  }
}
async function reject() {
  errorMessage.value = ''
  try {
    await mutation.mutateAsync({ accepted: false, note: rejectionNote.value || undefined })
    completed.value = 'rejected'
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Không thể ghi nhận phản hồi.'
  }
}
</script>
