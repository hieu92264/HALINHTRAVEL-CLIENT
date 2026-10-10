<script setup lang="ts">
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  FilterIcon,
  Undo2Icon,
  XCircleIcon,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/lib/api-error'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { useDispatchMutations, useDispatchOrders } from './dispatch.composables'
import { orderColumns } from './components/order-column'
import { completionConfirmationSchema } from './schemas/dispatch.schema'
import { orderStatusLabels } from './dispatch.format'
import type { DispatchOrder } from './dispatch.types'

const auth = useAuthStore()
const ordersQuery = useDispatchOrders()
const mutations = useDispatchMutations()

const expandedRowId = ref<string | null>(null)
const isFilterRowVisible = ref(false)
const cancelDialogOpen = ref(false)
const confirmDialogOpen = ref(false)
const returnDialogOpen = ref(false)
const cancelNote = ref('')
const reviewNote = ref('')
const customerAmount = ref('0')
const partnerVehicleCost = ref('0')
const externalDriverCost = ref('0')
const confirmFormErrors = ref<Record<string, string>>({})

const canManage = computed(
  () => auth.user?.permissions.includes('dispatch-orders.manage') === true,
)
const orders = computed(() => ordersQuery.data.value ?? [])
const dataSource = computed<DataGridDataSource<DispatchOrder>>(() => ({
  data: orders.value,
  isLoading: ordersQuery.isLoading.value,
  isFetching: ordersQuery.isFetching.value,
  error: ordersQuery.error.value,
}))

const expandedOrder = computed(() =>
  orders.value.find((o) => String(o.id) === expandedRowId.value) ?? null,
)
const hasReport = computed(() =>
  expandedOrder.value
    ? [
        expandedOrder.value.actual_start_at,
        expandedOrder.value.actual_end_at,
        expandedOrder.value.start_odometer,
        expandedOrder.value.end_odometer,
      ].some((v) => v !== null)
    : false,
)

function showError(error: unknown, fallback: string): void {
  const msg = error instanceof ApiError ? error.message : fallback
  toast.error(msg)
}

function toggleRow(row: DispatchOrder): void {
  const rowId = String(row.id)
  expandedRowId.value = expandedRowId.value === rowId ? null : rowId
}

function formatDatetime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN')
}

function assignOrder(): void {
  if (!expandedOrder.value) return
  mutations.assignOrder.mutate(expandedOrder.value.id, {
    onSuccess: () => toast.success('Đã xác nhận phân công lệnh.'),
    onError: (error) => showError(error, 'Không thể xác nhận phân công.'),
  })
}

function cancelOrder(): void {
  if (!expandedOrder.value || !cancelNote.value.trim()) return
  mutations.cancelOrder.mutate(
    { id: expandedOrder.value.id, note: cancelNote.value.trim() },
    {
      onSuccess: () => {
        cancelDialogOpen.value = false
        cancelNote.value = ''
        toast.success('Đã hủy lệnh điều xe.')
      },
      onError: (error) => showError(error, 'Không thể hủy lệnh.'),
    },
  )
}

function returnCompletion(): void {
  if (!expandedOrder.value || !reviewNote.value.trim()) return
  mutations.returnCompletion.mutate(
    { id: expandedOrder.value.id, reviewNote: reviewNote.value.trim() },
    {
      onSuccess: () => {
        returnDialogOpen.value = false
        reviewNote.value = ''
        toast.success('Đã trả báo cáo cho tài xế bổ sung.')
      },
      onError: (error) => showError(error, 'Không thể trả báo cáo.'),
    },
  )
}

function confirmCompletion(): void {
  if (!expandedOrder.value) return
  confirmFormErrors.value = {}

  const parsed = completionConfirmationSchema.safeParse({
    customer_amount: customerAmount.value,
    partner_vehicle_cost: partnerVehicleCost.value || null,
    external_driver_cost: externalDriverCost.value || null,
  })
  if (!parsed.success) {
    const errs: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      errs[issue.path[0]?.toString() ?? '_'] = issue.message
    }
    confirmFormErrors.value = errs
    toast.error(parsed.error.issues[0]?.message ?? 'Số tiền không hợp lệ.')
    return
  }
  mutations.confirmCompletion.mutate(
    { id: expandedOrder.value.id, payload: parsed.data },
    {
      onSuccess: () => {
        confirmDialogOpen.value = false
        toast.success('Đã xác nhận hoàn tất chuyến.')
      },
      onError: (error) => showError(error, 'Không thể xác nhận hoàn tất.'),
    },
  )
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Lệnh điều xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Theo dõi, xử lý báo cáo và xác nhận hoàn tất chuyến.
        </p>
      </div>
    </header>

    <DataGrid
      :data-source="dataSource"
      :columns="orderColumns"
      width="100%"
      height="calc(100svh - 250px)"
      :pagination="{ mode: 'client', pageSize: 25, pageSizeOptions: [10, 25, 50, 100] }"
      filtering-mode="client"
      sorting-mode="client"
      :filter-row="isFilterRowVisible"
      global-filter
      :get-row-id="(order) => String(order.id)"
      v-model:expanded-row-id="expandedRowId"
      :persist="{ key: 'dispatch-orders', url: true, queryPrefix: 'do' }"
      empty-title="Chưa có lệnh điều xe"
      empty-description="Lệnh sẽ xuất hiện ở đây khi có bản ghi phù hợp."
      @retry="ordersQuery.refetch()"
      @row-click="(row) => toggleRow(row)"
    >
      <template #toolbar-start>
        <Button
          variant="outline"
          :class="
            isFilterRowVisible
              ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
              : ''
          "
          @click="isFilterRowVisible = !isFilterRowVisible"
        >
          <FilterIcon class="size-4" />Lọc
        </Button>
      </template>
      <template #row-detail>
      <article
        v-if="expandedOrder"
        class="bg-card"
      >
        <div class="border-b border-border px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold tabular-nums">{{ expandedOrder.order_no }}</h2>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="{
                    'bg-primary/10 text-primary': expandedOrder.status === 'ISSUED',
                    'bg-blue-500/10 text-blue-700': expandedOrder.status === 'ASSIGNED',
                    'bg-amber-500/10 text-amber-700': expandedOrder.status === 'IN_PROGRESS',
                    'bg-orange-500/10 text-orange-700': expandedOrder.status === 'PENDING_CONFIRMATION',
                    'bg-success/10 text-success': expandedOrder.status === 'COMPLETED',
                    'bg-destructive/10 text-destructive': expandedOrder.status === 'CANCELLED',
                  }"
                >
                  {{ orderStatusLabels[expandedOrder.status] }}
                </span>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ expandedOrder.trip_schedule?.contract?.customer?.name ?? expandedOrder.trip_schedule?.contract?.contract_no ?? '—' }}
                · {{ expandedOrder.trip_schedule?.route?.name ?? 'Chưa có tuyến' }}
              </p>
            </div>
            <Button variant="outline" size="sm" @click="expandedRowId = null">
              <ChevronDownIcon class="size-4 rotate-180" />Thu gọn
            </Button>
          </div>
        </div>

        <div class="grid gap-5 p-5 lg:grid-cols-2">
          <!-- Info Section -->
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Xe</dt>
                <dd class="mt-0.5 font-semibold tabular-nums">
                  {{ expandedOrder.trip_assignment?.vehicle?.license_plate ?? '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Tài xế</dt>
                <dd class="mt-0.5">
                  {{ expandedOrder.trip_assignment?.driver?.full_name ?? '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Phát hành</dt>
                <dd class="mt-0.5 tabular-nums">{{ formatDatetime(expandedOrder.issued_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Tuyến</dt>
                <dd class="mt-0.5">{{ expandedOrder.trip_schedule?.route?.name ?? '—' }}</dd>
              </div>
            </div>

            <!-- Operations Report -->
            <section v-if="hasReport" class="rounded-lg border border-border bg-muted/30 p-4">
              <h3 class="text-sm font-bold">Báo cáo vận hành</h3>
              <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt class="text-xs text-muted-foreground">Bắt đầu thực tế</dt>
                  <dd class="tabular-nums">{{ formatDatetime(expandedOrder.actual_start_at) }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted-foreground">Kết thúc thực tế</dt>
                  <dd class="tabular-nums">{{ formatDatetime(expandedOrder.actual_end_at) }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-muted-foreground">ODO</dt>
                  <dd class="tabular-nums">
                    {{ expandedOrder.start_odometer ?? '—' }} → {{ expandedOrder.end_odometer ?? '—' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs text-muted-foreground">Km / giờ chờ</dt>
                  <dd class="tabular-nums">
                    {{ expandedOrder.actual_distance_km ?? '—' }} / {{ expandedOrder.waiting_hours ?? '—' }}
                  </dd>
                </div>
              </dl>
              <p v-if="expandedOrder.note" class="mt-3 text-sm text-muted-foreground">
                {{ expandedOrder.note }}
              </p>
            </section>

            <p
              v-if="expandedOrder.review_note"
              class="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-200"
            >
              Lý do trả báo cáo: {{ expandedOrder.review_note }}
            </p>
          </div>

          <!-- Actions Section -->
          <div class="space-y-3">
            <template v-if="canManage">
              <Button
                v-if="expandedOrder.status === 'ISSUED'"
                class="w-full justify-center"
                :disabled="mutations.assignOrder.isPending.value"
                @click="assignOrder"
              >
                Xác nhận phân công
              </Button>

              <Button
                v-if="expandedOrder.status === 'ISSUED' || expandedOrder.status === 'ASSIGNED'"
                variant="destructive"
                class="w-full justify-center gap-2"
                @click="cancelDialogOpen = true"
              >
                <XCircleIcon class="size-4" />Hủy lệnh
              </Button>

              <template v-if="expandedOrder.status === 'PENDING_CONFIRMATION'">
                <Button
                  variant="outline"
                  class="w-full justify-center gap-2 border-amber-300 text-amber-900 hover:bg-amber-50 dark:text-amber-200"
                  @click="returnDialogOpen = true"
                >
                  <Undo2Icon class="size-4" />Trả báo cáo
                </Button>
                <Button
                  class="w-full justify-center gap-2 bg-success text-white hover:bg-success/90"
                  @click="confirmDialogOpen = true"
                >
                  <CheckCircle2Icon class="size-4" />Xác nhận hoàn tất
                </Button>
              </template>
            </template>

            <p v-else class="text-sm text-muted-foreground">
              Bạn chỉ có quyền xem lệnh điều xe.
            </p>
          </div>
        </div>
      </article>
      </template>
    </DataGrid>

    <!-- Cancel Order Dialog -->
    <AccessDialog
      :open="cancelDialogOpen"
      title="Hủy lệnh điều xe"
      description="Nhập lý do hủy; sau đó có thể thay phân công và phát hành lệnh mới."
      confirm-label="Hủy lệnh"
      cancel-label="Quay lại"
      destructive
      :pending="mutations.cancelOrder.isPending.value"
      @close="cancelDialogOpen = false"
      @confirm="cancelOrder"
    >
      <textarea
        v-model="cancelNote"
        class="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-ring"
        placeholder="Lý do hủy"
      />
    </AccessDialog>

    <!-- Return Report Dialog -->
    <AccessDialog
      :open="returnDialogOpen"
      title="Trả báo cáo"
      description="Nhập lý do để tài xế bổ sung báo cáo."
      confirm-label="Trả báo cáo"
      cancel-label="Quay lại"
      :pending="mutations.returnCompletion.isPending.value"
      @close="returnDialogOpen = false"
      @confirm="returnCompletion"
    >
      <textarea
        v-model="reviewNote"
        class="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-ring"
        placeholder="Lý do cần bổ sung"
      />
    </AccessDialog>

    <!-- Confirm Completion Dialog -->
    <AccessDialog
      :open="confirmDialogOpen"
      title="Xác nhận hoàn tất"
      description="Chốt số liệu tài chính và cập nhật ODO xe."
      confirm-label="Xác nhận"
      cancel-label="Quay lại"
      :pending="mutations.confirmCompletion.isPending.value"
      @close="confirmDialogOpen = false"
      @confirm="confirmCompletion"
    >
      <div class="grid gap-3">
        <div class="grid gap-1.5">
          <Label for="confirm-customer-amount">Doanh thu</Label>
          <Input
            id="confirm-customer-amount"
            v-model="customerAmount"
            inputmode="decimal"
            :class="confirmFormErrors.customer_amount ? 'border-destructive' : ''"
          />
          <p v-if="confirmFormErrors.customer_amount" class="text-xs text-destructive">
            {{ confirmFormErrors.customer_amount }}
          </p>
        </div>
        <div class="grid gap-1.5">
          <Label for="confirm-partner-cost">Chi phí xe</Label>
          <Input
            id="confirm-partner-cost"
            v-model="partnerVehicleCost"
            inputmode="decimal"
          />
        </div>
        <div class="grid gap-1.5">
          <Label for="confirm-driver-cost">Chi phí lái</Label>
          <Input
            id="confirm-driver-cost"
            v-model="externalDriverCost"
            inputmode="decimal"
          />
        </div>
      </div>
    </AccessDialog>
  </section>
</template>
