<script setup lang="ts">
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BusFrontIcon,
  CheckCircle2Icon,
  Clock3Icon,
  InfoIcon,
  MapPinIcon,
  PlayIcon,
  XCircleIcon,
  CircleDotIcon,
  CalendarDaysIcon,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/shared/lib/api-error'
import { useDispatchMutations, useMyDispatchOrder } from './dispatch.composables'
import { completionReportSchema, startOrderSchema } from './schemas/dispatch.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))
const orderQuery = useMyDispatchOrder(id)
const mutations = useDispatchMutations()

const startTime = ref('')
const startOdometer = ref<number | undefined>()
const endTime = ref('')
const endOdometer = ref<number | undefined>()
const distance = ref('')
const waitingHours = ref('0')
const note = ref('')

const message = ref('')
const formError = ref('')

const order = computed(() => orderQuery.data.value)
const schedule = computed(() => order.value?.trip_schedule)
const state = computed(() => order.value?.status)

const statusLabel = computed(
  () =>
    ({
      ISSUED: 'Đã phát hành',
      ASSIGNED: 'Chưa bắt đầu',
      IN_PROGRESS: 'Đang chạy',
      PENDING_CONFIRMATION: 'Chờ điều hành xác nhận',
      COMPLETED: 'Hoàn tất',
      CANCELLED: 'Đã hủy',
    })[state.value ?? 'ISSUED'],
)

const toScheduledIso = (time: string) => {
  const date = new Date(schedule.value?.scheduled_start_at ?? new Date().toISOString())
  const [hour, minute] = time.split(':').map(Number)
  date.setHours(hour || 0, minute || 0, 0, 0)
  return date.toISOString()
}

const displayTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '—'

const displayDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    : '—'

function reportError(error: unknown, fallback: string): void {
  formError.value = error instanceof ApiError ? error.message : fallback
}

function startTrip(): void {
  if (!order.value) return
  formError.value = ''
  message.value = ''

  const parsed = startOrderSchema.safeParse({
    actual_start_at: toScheduledIso(startTime.value),
    start_odometer: startOdometer.value,
    note: note.value || null,
  })

  if (!parsed.success) {
    formError.value = parsed.error.issues[0]?.message ?? 'Nhập đủ giờ bắt đầu và ODO.'
    return
  }

  mutations.startMyOrder.mutate(
    { id: order.value.id, payload: parsed.data },
    {
      onSuccess: () => {
        message.value = 'Đã bắt đầu chuyến.'
      },
      onError: (error) => reportError(error, 'Không thể bắt đầu chuyến.'),
    },
  )
}

function completeTrip(): void {
  if (!order.value || !order.value.actual_start_at || order.value.start_odometer === null)
    return
  formError.value = ''
  message.value = ''

  const parsed = completionReportSchema.safeParse({
    actual_end_at: toScheduledIso(endTime.value),
    end_odometer: endOdometer.value,
    actual_distance_km: distance.value || null,
    waiting_hours: waitingHours.value || null,
    note: note.value || null,
  })

  if (!parsed.success) {
    formError.value = parsed.error.issues[0]?.message ?? 'Nhập đủ dữ liệu hoàn tất.'
    return
  }

  if (
    parsed.data.end_odometer < order.value.start_odometer ||
    new Date(parsed.data.actual_end_at) < new Date(order.value.actual_start_at)
  ) {
    formError.value = 'Thời gian kết thúc và ODO phải lớn hơn hoặc bằng dữ liệu bắt đầu.'
    return
  }

  mutations.reportMyCompletion.mutate(
    { id: order.value.id, payload: parsed.data },
    {
      onSuccess: () => {
        message.value = 'Đã gửi báo cáo để điều hành xác nhận.'
      },
      onError: (error) => reportError(error, 'Không thể gửi báo cáo hoàn tất.'),
    },
  )
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6 pb-12">
    <!-- Header -->
    <header class="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        class="size-10 shrink-0 shadow-sm"
        aria-label="Quay lại"
        @click="router.back()"
      >
        <ArrowLeftIcon class="size-4" />
      </Button>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-primary">Điều hành / Lệnh của tôi</p>
        <h1 class="truncate text-2xl font-bold tracking-tight text-foreground">
          Lệnh {{ order?.order_no ?? '—' }}
        </h1>
      </div>
      <span
        v-if="order"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold shadow-sm"
        :class="{
          'bg-success/10 text-success': state === 'COMPLETED',
          'bg-blue-500/10 text-blue-700 dark:text-blue-400': state === 'ASSIGNED',
          'bg-amber-500/10 text-amber-700 dark:text-amber-400': state === 'IN_PROGRESS',
          'bg-orange-500/10 text-orange-700 dark:text-orange-400': state === 'PENDING_CONFIRMATION',
          'bg-primary/10 text-primary': state === 'ISSUED',
          'bg-destructive/10 text-destructive': state === 'CANCELLED',
        }"
      >
        <CircleDotIcon class="size-4" />
        {{ statusLabel }}
      </span>
    </header>

    <!-- Loading State -->
    <article
      v-if="orderQuery.isPending.value"
      class="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center shadow-sm"
    >
      <div class="grid size-12 place-items-center rounded-full bg-muted">
        <span class="size-5 animate-pulse rounded-full bg-primary/20" />
      </div>
      <p class="mt-4 font-medium text-foreground">Đang tải lệnh điều xe…</p>
    </article>

    <!-- Error State -->
    <article
      v-else-if="orderQuery.isError.value"
      class="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-sm"
    >
      <AlertTriangleIcon class="size-8 text-destructive" />
      <p class="mt-4 font-medium text-destructive">Không thể tải lệnh điều xe.</p>
      <Button
        variant="outline"
        class="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        @click="orderQuery.refetch()"
      >
        Thử lại
      </Button>
    </article>

    <!-- Order Content -->
    <template v-else-if="order">
      <!-- Order Summary Card -->
      <article class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div class="border-b border-border bg-muted/20 p-5">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-foreground tabular-nums">
              {{ order.order_no }}
            </h2>
            <span class="rounded-md bg-background px-2.5 py-1 text-sm font-medium shadow-sm">
              {{ schedule?.service_type ?? '—' }}
            </span>
          </div>
        </div>

        <div class="p-5 sm:p-6">
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            <div class="grid gap-1">
              <span class="text-sm font-medium text-muted-foreground">
                Đón · {{ displayDate(schedule?.scheduled_start_at) }}
              </span>
              <p class="text-3xl font-black tracking-tight tabular-nums text-foreground">
                {{ displayTime(schedule?.scheduled_start_at) }}
              </p>
              <p class="mt-1 text-sm font-medium text-muted-foreground">
                {{ schedule?.pickup_location ?? '—' }}
              </p>
            </div>
            
            <div class="flex flex-col items-center text-primary">
              <div class="h-px w-8 bg-primary/30" />
              <ArrowLeftIcon class="my-1 size-5 rotate-180" />
              <div class="h-px w-8 bg-primary/30" />
            </div>
            
            <div class="grid gap-1">
              <span class="text-sm font-medium text-muted-foreground">
                Trả · {{ displayDate(schedule?.scheduled_end_at) }}
              </span>
              <p class="text-3xl font-black tracking-tight tabular-nums text-foreground">
                {{ displayTime(schedule?.scheduled_end_at) }}
              </p>
              <p class="mt-1 text-sm font-medium text-muted-foreground">
                {{ schedule?.dropoff_location ?? '—' }}
              </p>
            </div>
          </div>

          <div class="mt-8 grid gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
            <div class="flex items-start gap-3">
              <div class="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <BusFrontIcon class="size-4" />
              </div>
              <div>
                <span class="text-xs font-medium text-muted-foreground">Phân công xe</span>
                <p class="font-bold tabular-nums text-foreground">
                  {{ order.trip_assignment?.vehicle?.license_plate ?? '—' }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <MapPinIcon class="size-4" />
              </div>
              <div>
                <span class="text-xs font-medium text-muted-foreground">Khách hàng / Đối tác</span>
                <p class="font-bold text-foreground">
                  {{ schedule?.contract?.customer?.name ?? schedule?.contract?.contract_no ?? '—' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Warning / Info Alert -->
      <div
        v-if="state === 'ISSUED'"
        class="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-primary"
      >
        <InfoIcon class="mt-0.5 size-5 shrink-0" />
        <div class="text-sm">
          <p class="font-bold">Lệnh mới được phân công</p>
          <p class="mt-0.5 opacity-90">Hãy chuẩn bị xe và có mặt đúng giờ. Khi bắt đầu chạy, vui lòng xác nhận bên dưới.</p>
        </div>
      </div>

      <!-- Action Form: Start / Complete -->
      <article
        v-if="state === 'ASSIGNED' || state === 'IN_PROGRESS'"
        class="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div class="border-b border-border bg-muted/20 px-5 py-4">
          <h2 class="flex items-center gap-2 text-lg font-bold">
            <component
              :is="state === 'ASSIGNED' ? PlayIcon : CheckCircle2Icon"
              class="size-5"
              :class="state === 'ASSIGNED' ? 'text-blue-500' : 'text-primary'"
            />
            {{ state === 'ASSIGNED' ? 'Bắt đầu chuyến' : 'Gửi báo cáo hoàn tất' }}
          </h2>
        </div>

        <form
          class="p-5 sm:p-6"
          @submit.prevent="state === 'ASSIGNED' ? startTrip() : completeTrip()"
        >
          <div class="grid gap-5">
            <template v-if="state === 'ASSIGNED'">
              <div class="grid gap-1.5">
                <Label for="start-time">Thời gian bắt đầu <span class="text-destructive">*</span></Label>
                <Input
                  id="start-time"
                  v-model="startTime"
                  type="time"
                  class="h-11 shadow-sm"
                  required
                />
              </div>
              <div class="grid gap-1.5">
                <Label for="start-odo">ODO bắt đầu (km) <span class="text-destructive">*</span></Label>
                <Input
                  id="start-odo"
                  v-model.number="startOdometer"
                  type="number"
                  min="0"
                  class="h-11 tabular-nums shadow-sm"
                  placeholder="Nhập số KM hiện tại"
                  required
                />
              </div>
            </template>

            <template v-else>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="grid gap-1.5">
                  <Label for="end-time">Thời gian kết thúc <span class="text-destructive">*</span></Label>
                  <Input
                    id="end-time"
                    v-model="endTime"
                    type="time"
                    class="h-11 shadow-sm"
                    required
                  />
                </div>
                <div class="grid gap-1.5">
                  <Label for="end-odo">ODO kết thúc (km) <span class="text-destructive">*</span></Label>
                  <Input
                    id="end-odo"
                    v-model.number="endOdometer"
                    type="number"
                    :min="order.start_odometer ?? 0"
                    class="h-11 tabular-nums shadow-sm"
                    placeholder="Nhập số KM hiện tại"
                    required
                  />
                </div>
              </div>
              
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="grid gap-1.5">
                  <Label for="actual-distance">Quãng đường thực tế (km)</Label>
                  <Input
                    id="actual-distance"
                    v-model="distance"
                    inputmode="decimal"
                    class="h-11 tabular-nums shadow-sm"
                    placeholder="Tùy chọn"
                  />
                </div>
                <div class="grid gap-1.5">
                  <Label for="waiting-hours">Giờ chờ (nếu có)</Label>
                  <Input
                    id="waiting-hours"
                    v-model="waitingHours"
                    inputmode="decimal"
                    class="h-11 tabular-nums shadow-sm"
                    placeholder="Tùy chọn"
                  />
                </div>
              </div>
            </template>

            <div class="grid gap-1.5">
              <Label for="trip-note">Ghi chú vận hành</Label>
              <textarea
                id="trip-note"
                v-model="note"
                class="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm shadow-sm focus:ring-2 focus:ring-ring"
                maxlength="2000"
                placeholder="Ghi chú thêm về chuyến đi (chi phí trạm thu phí, bến bãi, v.v...)"
              />
            </div>
          </div>

          <!-- Feedback Messages -->
          <div v-if="formError || message" class="mt-6 space-y-3">
            <div
              v-if="formError"
              class="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangleIcon class="mt-0.5 size-4 shrink-0" />
              {{ formError }}
            </div>
            <div
              v-if="message"
              class="flex items-start gap-2 rounded-lg bg-success/10 p-3 text-sm text-success"
            >
              <CheckCircle2Icon class="mt-0.5 size-4 shrink-0" />
              {{ message }}
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="mt-6 w-full gap-2 py-6 text-base shadow-sm"
            :class="state === 'ASSIGNED' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''"
            :disabled="mutations.startMyOrder.isPending.value || mutations.reportMyCompletion.isPending.value"
          >
            <component :is="state === 'ASSIGNED' ? PlayIcon : CheckCircle2Icon" class="size-5" />
            {{ state === 'ASSIGNED' ? 'Bắt đầu chuyến đi' : 'Gửi báo cáo hoàn tất' }}
          </Button>
        </form>
      </article>

      <!-- Status Alerts -->
      <article
        v-else-if="state === 'PENDING_CONFIRMATION'"
        class="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm"
      >
        <div class="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
          <Clock3Icon class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Chờ điều hành xác nhận</h2>
          <p class="mt-1 text-sm opacity-90">
            Báo cáo đã được gửi. Điều hành viên sẽ kiểm tra lại số liệu trước khi chốt chuyến.
          </p>
          <div
            v-if="order.review_note"
            class="mt-3 rounded-lg bg-amber-100/50 p-3 text-sm font-medium"
          >
            Yêu cầu bổ sung từ điều hành: {{ order.review_note }}
          </div>
        </div>
      </article>

      <article
        v-else-if="state === 'COMPLETED'"
        class="flex items-start gap-4 rounded-xl border border-success/20 bg-success/5 p-5 text-success shadow-sm"
      >
        <div class="grid size-10 shrink-0 place-items-center rounded-full bg-success/20">
          <CheckCircle2Icon class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Chuyến đã hoàn tất</h2>
          <p class="mt-1 text-sm opacity-90">
            Cảm ơn bạn! Thông tin vận hành và báo cáo đã được xác nhận.
          </p>
        </div>
      </article>

      <article
        v-else-if="state === 'CANCELLED'"
        class="flex items-start gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-destructive shadow-sm"
      >
        <div class="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/20">
          <XCircleIcon class="size-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold">Lệnh đã bị hủy</h2>
          <p class="mt-1 text-sm opacity-90">
            Chuyến xe này đã bị hủy bỏ bởi điều hành viên.
          </p>
        </div>
      </article>
    </template>
  </section>
</template>
