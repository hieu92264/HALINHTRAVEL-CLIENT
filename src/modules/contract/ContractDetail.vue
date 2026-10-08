<template>
  <section class="mx-auto max-w-6xl space-y-5">
    <p v-if="query.isLoading.value" class="rounded-md border p-4 text-sm text-muted-foreground">
      Đang tải hợp đồng...
    </p>
    <p
      v-else-if="query.isError.value"
      class="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
    >
      Không tìm thấy hoặc không thể tải hợp đồng.
    </p>
    <template v-else-if="contract"
      ><header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-semibold">{{ contract.contract_no }}</h1>
            <span class="rounded-full bg-muted px-2 py-1 text-xs">{{
              contractStatusLabel(contract.status)
            }}</span>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ contract.customer_name || '—' }} · {{ contractTypeLabel(contract.contract_type) }}
          </p>
        </div>
        <div v-if="canManage" class="flex flex-wrap gap-2">
          <Button
            v-if="contract.status === 'draft'"
            variant="outline"
            @click="router.push({ name: 'contracts-edit', params: { id: contract.id } })"
            >Sửa</Button
          ><Button v-if="contract.status === 'draft'" @click="openConfirmation('activate')"
            >Kích hoạt</Button
          ><Button v-if="contract.status === 'active'" @click="openConfirmation('complete')"
            >Hoàn thành</Button
          ><Button
            v-if="contract.status === 'draft' || contract.status === 'active'"
            variant="outline"
            @click="openConfirmation('cancel')"
            >Hủy</Button
          ><Button
            v-if="contract.status === 'draft'"
            variant="ghost"
            @click="openConfirmation('remove')"
            >Ngừng hoạt động</Button
          >
        </div>
      </header>
      <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div class="space-y-5">
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Hạng mục hợp đồng</h2>
            <div class="mt-4 overflow-x-auto">
              <table class="w-full min-w-[760px] text-sm">
                <thead class="border-b text-left text-muted-foreground">
                  <tr>
                    <th class="pb-2">Loại xe</th>
                    <th class="pb-2">Dịch vụ</th>
                    <th class="pb-2">Tuyến / hành trình</th>
                    <th class="pb-2 text-right">SL</th>
                    <th class="pb-2 text-right">Đơn giá</th>
                    <th class="pb-2 text-right">Lương tài xế</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in contract.items" :key="item.id" class="border-b">
                    <td class="py-2">{{ item.vehicle_type_name || '—' }}</td>
                    <td>{{ serviceTypeLabel(item.service_type) }}</td>
                    <td>
                      {{
                        item.route_name ||
                        [item.pickup_location, item.dropoff_location].filter(Boolean).join(' → ') ||
                        '—'
                      }}
                    </td>
                    <td class="text-right">{{ item.quantity }}</td>
                    <td class="text-right">{{ formatCurrency(item.unit_price) }}</td>
                    <td class="text-right">{{ formatCurrency(item.driver_wage) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ml-auto mt-5 max-w-sm space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Tổng giá trị</span><b>{{ formatCurrency(contract.total_amount) }}</b>
              </div>
              <div class="flex justify-between border-t pt-2">
                <span>Đặt cọc yêu cầu</span><b>{{ formatCurrency(contract.deposit_required) }}</b>
              </div>
            </div>
          </section>
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Điều khoản</h2>
            <p class="mt-3 whitespace-pre-line text-sm">
              {{ contract.terms || 'Chưa có điều khoản hợp đồng.' }}
            </p>
            <p
              v-if="contract.payment_terms"
              class="mt-4 whitespace-pre-line rounded-md bg-muted p-3 text-sm"
            >
              <b>Thanh toán:</b><br />{{ contract.payment_terms }}
            </p>
          </section>
          <ScheduleRulesPanel :contract="contract" :can-manage="canManage" />
        </div>
        <aside class="space-y-5">
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Thông tin hợp đồng</h2>
            <dl class="mt-3 space-y-2 text-sm">
              <div>Ngày ký: {{ formatDate(contract.signed_date) }}</div>
              <div>
                Hiệu lực: {{ formatDate(contract.effective_from) }} —
                {{ formatDate(contract.effective_to) }}
              </div>
              <div>Nguồn báo giá: {{ contract.quotation_no || 'Hợp đồng độc lập' }}</div>
              <div>Yêu cầu thuê: {{ contract.rental_request_no || '—' }}</div>
            </dl>
          </section>
          <section class="rounded-lg border bg-card p-5">
            <h2 class="font-semibold">Lưu ý vận hành</h2>
            <p class="mt-2 text-sm text-muted-foreground">
              Quy tắc lịch chỉ được tạo sau khi hợp đồng được kích hoạt. Quy tắc đã sinh lịch chuyến
              sẽ bị khóa chỉnh sửa.
            </p>
          </section>
        </aside>
      </div>
    </template>
  </section>
  <AccessDialog
    :open="confirmation !== null"
    :title="confirmationCopy.title"
    :description="confirmationCopy.description"
    :confirm-label="confirmationCopy.confirmLabel"
    cancel-label="Quay lại"
    :destructive="confirmationCopy.destructive"
    :pending="isConfirmationPending"
    @close="closeConfirmation"
    @confirm="confirmAction"
  />
</template>
<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { useContractMutations, useContractQuery } from '@/modules/contract/contract.composables'
import { contractStatusLabel, contractTypeLabel } from '@/modules/contract/contract.format'
import ScheduleRulesPanel from '@/modules/contract/components/ScheduleRulesPanel.vue'
import { formatCurrency, formatDate, serviceTypeLabel } from '@/modules/rental/rental.format'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { Button } from '@/shared/components/ui/button'
import { ApiError } from '@/shared/lib/api-error'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
const query = useContractQuery(() => id.value)
const contract = computed(() => query.data.value)
const mutations = useContractMutations()
const canManage = computed(() => auth.user?.permissions.includes('contracts.manage') ?? false)
type ContractAction = 'activate' | 'complete' | 'cancel' | 'remove'
const confirmation = ref<ContractAction | null>(null)
const confirmationCopy = computed(() => {
  const contractNo = contract.value?.contract_no ?? 'hợp đồng này'
  switch (confirmation.value) {
    case 'activate':
      return {
        title: 'Kích hoạt hợp đồng',
        description: `Hợp đồng ${contractNo} sẽ được chuyển sang trạng thái đang hiệu lực.`,
        confirmLabel: 'Kích hoạt',
        destructive: false,
      }
    case 'complete':
      return {
        title: 'Hoàn thành hợp đồng',
        description: `Hợp đồng ${contractNo} sẽ được đánh dấu hoàn thành.`,
        confirmLabel: 'Hoàn thành',
        destructive: false,
      }
    case 'cancel':
      return {
        title: 'Hủy hợp đồng',
        description: `Hợp đồng ${contractNo} sẽ bị hủy và không thể tiếp tục thực hiện.`,
        confirmLabel: 'Hủy hợp đồng',
        destructive: true,
      }
    case 'remove':
      return {
        title: 'Ngừng hoạt động hợp đồng',
        description: `Hợp đồng nháp ${contractNo} sẽ bị ngừng hoạt động.`,
        confirmLabel: 'Ngừng hoạt động',
        destructive: true,
      }
    default:
      return { title: '', description: '', confirmLabel: '', destructive: false }
  }
})
const isConfirmationPending = computed(() => {
  switch (confirmation.value) {
    case 'activate':
      return mutations.activate.isPending.value
    case 'complete':
      return mutations.complete.isPending.value
    case 'cancel':
      return mutations.cancel.isPending.value
    case 'remove':
      return mutations.remove.isPending.value
    default:
      return false
  }
})
function openConfirmation(action: ContractAction) {
  confirmation.value = action
}
function closeConfirmation() {
  if (!isConfirmationPending.value) confirmation.value = null
}
async function confirmAction() {
  const action = confirmation.value
  if (!action) return
  try {
    if (action === 'remove') {
      await mutations.remove.mutateAsync(id.value)
      toast.success('Đã ngừng hoạt động hợp đồng.')
      confirmation.value = null
      await router.push({ name: 'contracts' })
      return
    }
    await mutations[action].mutateAsync(id.value)
    toast.success('Đã cập nhật trạng thái hợp đồng.')
    await query.refetch()
  } catch (error) {
    toast.error(
      error instanceof ApiError
        ? error.message
        : action === 'remove'
          ? 'Không thể ngừng hoạt động hợp đồng.'
          : 'Không thể cập nhật hợp đồng.',
    )
  } finally {
    confirmation.value = null
  }
}
</script>
