<script setup lang="ts">
import {
  BusFrontIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDotIcon,
  Clock3Icon,
  FileCheck2Icon,
  FlagIcon,
  PlayIcon,
  SearchIcon,
  UserRoundIcon,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { useDispatchMutations, useDispatchOrders } from './dispatch.composables'
import type { DispatchOrder } from './dispatch.types'

type OrderStatus = 'ISSUED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'COMPLETED' | 'CANCELLED'
type Order = { id: string; time: string; route: string; plate: string; driver: string; customer: string; status: OrderStatus; source: DispatchOrder }
const ordersQuery = useDispatchOrders()
const mutations = useDispatchMutations()
const selectedId = ref('')
const search = ref('')
const actualStart = ref('')
const startOdometer = ref('')
const actualEnd = ref('')
const endOdometer = ref('')
const notice = ref('')
const cancelDialogOpen = ref(false)
const confirmDialogOpen = ref(false)
const returnDialogOpen = ref(false)
const customerAmount = ref(0)
const partnerVehicleCost = ref(0)
const externalDriverCost = ref(0)
const reviewNote = ref('')
const dateLabel = computed(() => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()))
const formatTime = (value: string | null | undefined) => value ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
const orders = computed<Order[]>(() => (ordersQuery.data.value ?? []).map((source) => ({
  id: String(source.id),
  time: formatTime(source.trip_schedule?.scheduled_start_at),
  route: source.trip_schedule?.route?.name ?? ([source.trip_schedule?.pickup_location, source.trip_schedule?.dropoff_location].filter(Boolean).join(' → ') || 'Chưa có tuyến'),
  plate: source.trip_assignment?.vehicle?.license_plate ?? '—',
  driver: source.trip_assignment?.driver?.full_name ?? '—',
  customer: source.trip_schedule?.contract?.contract_no ?? 'Hợp đồng',
  status: source.status,
  source,
})))
const selected = computed<Order>(() => orders.value.find((order) => order.id === selectedId.value) ?? orders.value[0]!)
const visibleOrders = computed(() => orders.value.filter((order) => `${order.id}${order.plate}${order.driver}${order.route}`.toLocaleLowerCase('vi-VN').includes(search.value.toLocaleLowerCase('vi-VN'))))
const statusLabel: Record<OrderStatus, string> = { ISSUED: 'Đã phát hành', ASSIGNED: 'Đã phân công', IN_PROGRESS: 'Đang chạy', PENDING_CONFIRMATION: 'Chờ điều hành xác nhận', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' }
const statusClass = (status: OrderStatus) => status === 'COMPLETED' ? 'bg-success/10 text-success' : status === 'PENDING_CONFIRMATION' || status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : status === 'CANCELLED' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
function selectOrder(id: string) { selectedId.value = id; notice.value = '' }
function assignOrder() { mutations.assignOrder.mutate(selected.value.source.id, { onSuccess: () => { notice.value = 'Đã xác nhận phân công lệnh.' } }) }
function cancelOrder() { mutations.cancelOrder.mutate(selected.value.source.id, { onSuccess: () => { cancelDialogOpen.value = false; notice.value = 'Đã hủy lệnh điều xe.' } }) }
function confirmCompletion() { mutations.confirmCompletion.mutate({ id: selected.value.source.id, payload: { customer_amount: customerAmount.value, partner_vehicle_cost: partnerVehicleCost.value, external_driver_cost: externalDriverCost.value } }, { onSuccess: () => { confirmDialogOpen.value = false; notice.value = 'Đã xác nhận hoàn tất chuyến.' } }) }
function returnCompletion() { if (!reviewNote.value.trim()) return; mutations.returnCompletion.mutate({ id: selected.value.source.id, reviewNote: reviewNote.value }, { onSuccess: () => { returnDialogOpen.value = false; notice.value = 'Đã trả báo cáo cho tài xế bổ sung.' } }) }
function startTrip() { notice.value = 'Tài xế bắt đầu chuyến từ màn hình Lệnh của tôi.' }
function completeTrip() { notice.value = 'Tài xế gửi báo cáo hoàn tất; điều hành xác nhận tại trạng thái chờ xác nhận.' }
</script>

<template>
  <section class="mx-auto max-w-[1480px] space-y-4">
    <header class="rounded-xl border border-border bg-card">
      <div
        class="flex flex-col gap-3 border-b border-border px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5"
      >
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Lệnh điều xe</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Theo dõi lệnh theo ngày, xác nhận vận hành và ghi nhận số liệu thực tế.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-semibold"
            type="button"
          >
            <CalendarDaysIcon class="size-4 text-primary" />{{ dateLabel }}<ChevronDownIcon
              class="size-3.5"
            /></button
          ><button
            class="h-9 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
            type="button"
          >
            + Tạo từ lịch đã phân công
          </button>
        </div>
      </div>
      <div class="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <label
          v-for="filter in ['Thời gian', 'Trạng thái', 'Xe', 'Tài xế', 'Khách hàng']"
          :key="filter"
          class="space-y-1 text-xs font-medium text-muted-foreground"
          >{{ filter
          }}<button
            class="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground"
            type="button"
          >
            Tất cả<ChevronDownIcon class="size-3.5" /></button></label
        ><label class="space-y-1 text-xs font-medium text-muted-foreground"
          >Tìm lệnh<span class="relative block"
            ><SearchIcon class="absolute left-3 top-2.5 size-4" /><input
              v-model="search"
              class="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Mã lệnh, biển số..." /></span
        ></label>
      </div>
    </header>
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.85fr)]">
      <article class="overflow-hidden rounded-xl border border-border bg-card">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-muted/50 text-xs font-semibold text-muted-foreground">
              <tr>
                <th class="px-4 py-3">Mã lệnh</th>
                <th class="px-4 py-3">Giờ đi</th>
                <th class="px-4 py-3">Tuyến</th>
                <th class="px-4 py-3">Biển số xe</th>
                <th class="px-4 py-3">Tài xế</th>
                <th class="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in visibleOrders"
                :key="order.id"
                class="cursor-pointer border-t border-border hover:bg-muted/60"
                :class="
                  selected.id === order.id
                    ? 'bg-primary/[0.05] ring-1 ring-inset ring-primary/30'
                    : ''
                "
                tabindex="0"
                @click="selectedId = order.id"
                @keydown.enter="selectedId = order.id"
              >
                <td class="px-4 py-3 font-semibold text-primary">{{ order.id }}</td>
                <td class="px-4 py-3 font-semibold tabular-nums">{{ order.time }}</td>
                <td class="px-4 py-3">{{ order.route }}</td>
                <td class="px-4 py-3 font-semibold tabular-nums">{{ order.plate }}</td>
                <td class="px-4 py-3">{{ order.driver }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                    :class="statusClass(order.status)"
                    ><CircleDotIcon class="size-3" />{{ statusLabel[order.status] }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <aside class="space-y-4 rounded-xl border border-border bg-card p-4 lg:p-5">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold">{{ selected.id }}</h2>
            <span
              class="rounded-full px-2 py-1 text-xs font-semibold"
              :class="statusClass(selected.status)"
              >{{ statusLabel[selected.status] }}</span
            >
          </div>
          <h3 class="mt-2 text-lg font-bold">{{ selected.route }}</h3>
          <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDaysIcon class="size-4" />{{ selected.time }} · {{ selected.route }}
          </p>
        </div>
        <ol
          class="grid grid-cols-4 gap-1 border-y border-border py-4 text-center text-[11px] font-semibold"
        >
          <li class="text-success"><CheckCircle2Icon class="mx-auto mb-1 size-5" />Phát hành</li>
          <li :class="selected.status !== 'ISSUED' ? 'text-success' : 'text-primary'">
            <BusFrontIcon class="mx-auto mb-1 size-5" />Phân công
          </li>
          <li
            :class="
              ['IN_PROGRESS', 'COMPLETED'].includes(selected.status)
                ? 'text-success'
                : 'text-muted-foreground'
            "
          >
            <PlayIcon class="mx-auto mb-1 size-5" />Đang chạy
          </li>
          <li :class="selected.status === 'COMPLETED' ? 'text-success' : 'text-muted-foreground'">
            <FlagIcon class="mx-auto mb-1 size-5" />Hoàn tất
          </li>
        </ol>
        <div class="grid gap-3 rounded-lg bg-muted/45 p-3 text-sm sm:grid-cols-2">
          <p>
            <span class="block text-xs text-muted-foreground">Xe / Biển số</span
            ><strong class="flex items-center gap-1.5"
              ><BusFrontIcon class="size-4 text-primary" />{{ selected.plate }}</strong
            >
          </p>
          <p>
            <span class="block text-xs text-muted-foreground">Tài xế</span
            ><strong class="flex items-center gap-1.5"
              ><UserRoundIcon class="size-4 text-primary" />{{ selected.driver }}</strong
            >
          </p>
          <p>
            <span class="block text-xs text-muted-foreground">Khách hàng</span
            ><strong>{{ selected.customer }}</strong>
          </p>
          <p>
            <span class="block text-xs text-muted-foreground">Dịch vụ</span
            ><strong>{{ selected.source.trip_schedule?.service_type ?? '—' }}</strong>
          </p>
        </div>
        <p
          v-if="notice"
          class="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success"
          role="status"
        >
          {{ notice }}
        </p>
        <section
          v-if="selected.status === 'ASSIGNED'"
          class="rounded-lg border border-primary/20 bg-primary/[0.04] p-3"
        >
          <h3 class="flex items-center gap-2 font-bold text-primary">
            <PlayIcon class="size-4" />Bắt đầu chuyến
          </h3>
          <p class="mt-1 text-xs text-muted-foreground">
            Xác nhận thời điểm và ODO khi xe bắt đầu khởi hành.
          </p>
          <div class="mt-3 grid gap-2 sm:grid-cols-2">
            <label class="text-xs font-medium"
              >Giờ thực tế<input
                v-model="actualStart"
                class="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                type="time" /></label
            ><label class="text-xs font-medium"
              >ODO đầu (km)<input
                v-model="startOdometer"
                class="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                type="number"
            /></label>
          </div>
          <button
            class="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            type="button"
            @click="startTrip"
          >
            <PlayIcon class="size-4" />Bắt đầu chuyến
          </button>
          <button class="mt-2 h-8 w-full rounded-lg border border-destructive/30 text-xs font-semibold text-destructive" type="button" @click="cancelDialogOpen = true">Hủy lệnh trước khi chuyến chạy</button>
        </section>
        <section
          v-else-if="selected.status === 'IN_PROGRESS'"
          class="rounded-lg border border-success/20 bg-success/[0.04] p-3"
        >
          <h3 class="flex items-center gap-2 font-bold text-success">
            <FileCheck2Icon class="size-4" />Hoàn thành chuyến
          </h3>
          <div class="mt-3 grid gap-2 sm:grid-cols-2">
            <label class="text-xs font-medium"
              >Giờ thực tế<input
                v-model="actualEnd"
                class="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                type="time" /></label
            ><label class="text-xs font-medium"
              >ODO cuối (km)<input
                v-model="endOdometer"
                class="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                type="number" /></label
            ><label class="text-xs font-medium"
              >Quãng đường (km)<input
                class="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value="142"
                type="number" /></label
            ><label class="text-xs font-medium"
              >Giờ chờ<input
                class="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value="0.5"
                type="number"
            /></label>
          </div>
          <button
            class="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-success text-sm font-semibold text-white"
            type="button"
            @click="completeTrip"
          >
            <CheckCircle2Icon class="size-4" />Hoàn thành chuyến
          </button>
        </section>
        <section
          v-else-if="selected.status === 'PENDING_CONFIRMATION'"
          class="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900"
        >
          <FileCheck2Icon class="mr-1 inline size-4" />Tài xế đã gửi báo cáo. Điều hành kiểm tra và chốt số liệu.
          <div class="mt-3 flex gap-2"><button class="h-9 rounded-lg border border-amber-300 px-3 text-xs font-semibold" type="button" @click="returnDialogOpen = true">Trả báo cáo</button><button class="h-9 rounded-lg bg-success px-3 text-xs font-semibold text-white" type="button" @click="confirmDialogOpen = true">Xác nhận hoàn tất</button></div>
        </section>
        <section
          v-else-if="selected.status === 'ISSUED'"
          class="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-sm text-primary"
        >
          <BusFrontIcon class="mr-1 inline size-4" />Lệnh đã phát hành và đang chờ điều hành xác nhận phân công.
          <div class="mt-3 flex gap-2"><button class="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground" type="button" @click="assignOrder">Xác nhận phân công</button><button class="h-9 rounded-lg border border-destructive/30 px-3 text-xs font-semibold text-destructive" type="button" @click="cancelDialogOpen = true">Hủy lệnh</button></div>
        </section>
        <section
          v-else
          class="rounded-lg border border-border bg-muted/35 p-3 text-sm text-muted-foreground"
        >
          <Clock3Icon class="mr-1 inline size-4" />Chọn lệnh đã phân công hoặc đang chạy để cập nhật
          số liệu thực tế.
        </section>
      </aside>
    </div>
    <AccessDialog :open="cancelDialogOpen" title="Hủy lệnh điều xe" :description="`Hủy lệnh ${selected.id}; sau đó có thể thay phân công và phát hành lệnh mới.`" confirm-label="Hủy lệnh" cancel-label="Quay lại" destructive :pending="mutations.cancelOrder.isPending.value" @close="cancelDialogOpen = false" @confirm="cancelOrder" />
    <AccessDialog :open="returnDialogOpen" title="Trả báo cáo" description="Nhập lý do để tài xế bổ sung báo cáo." confirm-label="Trả báo cáo" cancel-label="Quay lại" :pending="mutations.returnCompletion.isPending.value" @close="returnDialogOpen = false" @confirm="returnCompletion"><textarea v-model="reviewNote" class="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm" placeholder="Lý do cần bổ sung" /></AccessDialog>
    <AccessDialog :open="confirmDialogOpen" title="Xác nhận hoàn tất" description="Chốt số liệu tài chính và cập nhật ODO xe." confirm-label="Xác nhận" cancel-label="Quay lại" :pending="mutations.confirmCompletion.isPending.value" @close="confirmDialogOpen = false" @confirm="confirmCompletion"><div class="grid gap-3 sm:grid-cols-3"><label class="text-xs font-medium">Doanh thu<input v-model.number="customerAmount" class="mt-1 h-9 w-full rounded border border-input bg-background px-2" min="0" type="number" /></label><label class="text-xs font-medium">Chi phí xe<input v-model.number="partnerVehicleCost" class="mt-1 h-9 w-full rounded border border-input bg-background px-2" min="0" type="number" /></label><label class="text-xs font-medium">Chi phí lái<input v-model.number="externalDriverCost" class="mt-1 h-9 w-full rounded border border-input bg-background px-2" min="0" type="number" /></label></div></AccessDialog>
  </section>
</template>
