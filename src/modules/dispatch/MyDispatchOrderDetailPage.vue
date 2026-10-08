<script setup lang="ts">
import { AlertTriangleIcon, ArrowLeftIcon, BusFrontIcon, CheckCircle2Icon, FileUpIcon, InfoIcon, MapPinIcon, PlayIcon, UserRoundIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDispatchMutations, useMyDispatchOrder } from './dispatch.composables'

type OrderState = 'ISSUED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'COMPLETED' | 'CANCELLED'
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))
const orderQuery = useMyDispatchOrder(id)
const mutations = useDispatchMutations()
const startTime = ref('')
const startOdometer = ref('')
const endTime = ref('')
const endOdometer = ref('')
const distance = ref('')
const waitingHours = ref('0')
const note = ref('')
const message = ref('')
const order = computed(() => orderQuery.data.value)
const state = computed<OrderState>(() => order.value?.status ?? 'ASSIGNED')
const orderId = computed(() => order.value?.order_no ?? '—')
const schedule = computed(() => order.value?.trip_schedule)
const statusLabel = computed(() => ({ ISSUED: 'Đã phát hành', ASSIGNED: 'Đã phân công', IN_PROGRESS: 'Đang chạy', PENDING_CONFIRMATION: 'Chờ điều hành xác nhận', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' })[state.value])
const actualAt = (time: string) => {
  const date = new Date(schedule.value?.scheduled_start_at ?? new Date().toISOString())
  const [hour, minute] = time.split(':').map(Number)
  date.setHours(hour || 0, minute || 0, 0, 0)
  return date.toISOString()
}
function startTrip(): void {
  if (!order.value) return
  mutations.startMyOrder.mutate(order.value.id, { onSuccess: () => { message.value = 'Đã bắt đầu chuyến.' } })
}
function completeTrip(): void {
  if (!order.value) return
  mutations.reportMyCompletion.mutate({ id: order.value.id, payload: { actual_start_at: order.value.actual_start_at ?? actualAt(startTime.value), actual_end_at: actualAt(endTime.value), start_odometer: Number(order.value.start_odometer ?? startOdometer.value), end_odometer: Number(endOdometer.value), actual_distance_km: Number(distance.value) || undefined, waiting_hours: Number(waitingHours.value) || 0, note: note.value || null } }, { onSuccess: () => { message.value = 'Đã gửi báo cáo để điều hành xác nhận.' } })
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-4 sm:space-y-5">
    <header class="flex items-center gap-3 border-b border-border pb-4">
      <button class="grid size-9 place-items-center rounded-lg border border-input bg-card text-muted-foreground hover:bg-muted" aria-label="Quay lại danh sách lệnh" type="button" @click="router.back()"><ArrowLeftIcon class="size-4" /></button>
      <div class="min-w-0 flex-1"><div class="text-sm text-muted-foreground">Điều hành / Lệnh của tôi / Chi tiết</div><h1 class="truncate text-xl font-bold">Lệnh {{ orderId }}</h1></div>
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="state === 'COMPLETED' ? 'bg-success/10 text-success' : state === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'">{{ statusLabel }}</span>
    </header>
    <div class="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary"><InfoIcon class="mt-0.5 size-4 shrink-0" /><span>Bạn đang xem lệnh do bạn phụ trách. Hệ thống không hiển thị thông tin lệnh khác.</span></div>
    <article class="rounded-xl border border-border bg-card p-4 sm:p-5"><div class="flex flex-wrap items-center justify-between gap-2"><strong class="text-lg">{{ orderId }}</strong><span class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{{ schedule?.service_type ?? 'Dịch vụ' }}</span></div><div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><div><p class="text-2xl font-bold tabular-nums">{{ schedule ? new Date(schedule.scheduled_start_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—' }}</p><p class="text-sm text-muted-foreground">{{ schedule?.pickup_location ?? '—' }}</p></div><span class="text-xl text-primary">→</span><div><p class="text-2xl font-bold tabular-nums">{{ schedule ? new Date(schedule.scheduled_end_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—' }}</p><p class="text-sm text-muted-foreground">{{ schedule?.dropoff_location ?? '—' }}</p></div></div><div class="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"><div class="flex gap-2"><MapPinIcon class="mt-0.5 size-4 shrink-0 text-primary" /><div><p class="text-xs text-muted-foreground">Điểm đón</p><strong>{{ schedule?.pickup_location ?? '—' }}</strong></div></div><div class="flex gap-2"><MapPinIcon class="mt-0.5 size-4 shrink-0 text-primary" /><div><p class="text-xs text-muted-foreground">Điểm trả</p><strong>{{ schedule?.dropoff_location ?? '—' }}</strong></div></div></div><div class="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"><p class="flex items-center gap-2"><BusFrontIcon class="size-4 text-primary" /><span><span class="block text-xs text-muted-foreground">Xe thực hiện</span><strong class="tabular-nums">{{ order?.trip_assignment?.vehicle?.license_plate ?? '—' }}</strong></span></p><p class="flex items-center gap-2"><UserRoundIcon class="size-4 text-primary" /><span><span class="block text-xs text-muted-foreground">Hợp đồng</span><strong>{{ schedule?.contract?.contract_no ?? '—' }}</strong></span></p></div></article>
    <article v-if="state === 'ASSIGNED' || state === 'IN_PROGRESS'" class="rounded-xl border border-border bg-card p-4 sm:p-5"><h2 class="flex items-center gap-2 text-xl font-bold"><component :is="state === 'ASSIGNED' ? PlayIcon : CheckCircle2Icon" class="size-5 text-primary" />{{ state === 'ASSIGNED' ? 'Bắt đầu chuyến' : 'Gửi báo cáo hoàn tất' }}</h2><p class="mt-1 text-sm text-muted-foreground">{{ state === 'ASSIGNED' ? 'Xác nhận thời gian khởi hành và chỉ số ODO khi bắt đầu thực hiện chuyến.' : 'Nhập số liệu thực tế sau khi kết thúc chuyến đi.' }}</p><div class="mt-4 grid gap-4"><label class="grid gap-1.5 text-sm font-semibold sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center"><span>{{ state === 'ASSIGNED' ? 'Thời gian bắt đầu thực tế' : 'Thời gian kết thúc thực tế' }} <b class="text-destructive">*</b></span><span><input v-if="state === 'ASSIGNED'" v-model="startTime" class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" type="time" /><input v-else v-model="endTime" class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" type="time" /><small class="mt-1 block font-normal text-muted-foreground">{{ state === 'ASSIGNED' ? 'Không được sớm hơn giờ dự kiến 13:30.' : 'Không được trước thời gian bắt đầu 13:30.' }}</small></span></label><label class="grid gap-1.5 text-sm font-semibold sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center"><span>{{ state === 'ASSIGNED' ? 'Chỉ số ODO khi bắt đầu' : 'Chỉ số ODO kết thúc' }} (km) <b class="text-destructive">*</b></span><span><input v-if="state === 'ASSIGNED'" v-model="startOdometer" class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" min="45230" type="number" /><input v-else v-model="endOdometer" class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" min="45230" type="number" /><small class="mt-1 block font-normal text-muted-foreground">{{ state === 'ASSIGNED' ? 'Nhập chỉ số ODO thực tế, lớn hơn 0.' : 'Không được nhỏ hơn 45.230 km.' }}</small></span></label><template v-if="state === 'IN_PROGRESS'"><label class="grid gap-1.5 text-sm font-semibold sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center"><span>Quãng đường thực tế (km)</span><input v-model="distance" class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" min="0" type="number" /></label><label class="grid gap-1.5 text-sm font-semibold sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center"><span>Thời gian chờ (giờ)</span><input v-model="waitingHours" class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal" min="0" type="number" /></label></template><label class="grid gap-1.5 text-sm font-semibold sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start"><span>Ghi chú <em class="font-normal text-muted-foreground">(tùy chọn)</em></span><span><textarea v-model="note" class="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal" maxlength="500" placeholder="Nhập ghi chú về tình trạng chuyến đi..." /><small class="text-right font-normal text-muted-foreground">{{ note.length }}/500</small></span></label></div><button class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted" :disabled="state === 'ASSIGNED'" type="button"><FileUpIcon class="size-4" />Thêm chứng từ <span class="font-normal text-muted-foreground">(bật khi API cho phép)</span></button><div class="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900"><AlertTriangleIcon class="mt-0.5 size-4 shrink-0" /><span>Nếu API trả 403 hoặc 409, thao tác sẽ bị khóa và trạng thái lệnh hiện tại sẽ được tải lại.</span></div><p v-if="message" class="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success" role="status">{{ message }}</p><button class="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50" :disabled="mutations.startMyOrder.isPending.value || mutations.reportMyCompletion.isPending.value" type="button" @click="state === 'ASSIGNED' ? startTrip() : completeTrip()"><component :is="state === 'ASSIGNED' ? PlayIcon : CheckCircle2Icon" class="size-4" />{{ state === 'ASSIGNED' ? 'Bắt đầu chuyến' : 'Hoàn thành chuyến' }}</button></article>
    <article v-else class="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4 text-success"><CheckCircle2Icon class="mt-0.5 size-5 shrink-0" /><div><h2 class="font-bold">Chuyến đã hoàn tất</h2><p class="mt-1 text-sm">Thông tin thực tế đã được ghi nhận. Bạn không thể cập nhật lại lệnh này.</p></div></article>
  </section>
</template>
