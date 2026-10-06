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

type OrderStatus = 'ISSUED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type Order = {
  id: string
  time: string
  route: string
  plate: string
  driver: string
  customer: string
  status: OrderStatus
}
const orders = ref<Order[]>([
  {
    id: 'LX261006-011',
    time: '07:30',
    route: 'Hải Phòng → Hạ Long',
    plate: '15B-678.99',
    driver: 'Trần Minh Hiếu',
    customer: 'Công ty Hòa Phát',
    status: 'COMPLETED',
  },
  {
    id: 'LX261006-012',
    time: '09:00',
    route: 'Hải Phòng → Cát Bà',
    plate: '15F-222.11',
    driver: 'Phạm Văn Long',
    customer: 'Khách lẻ',
    status: 'ISSUED',
  },
  {
    id: 'LX261006-013',
    time: '10:30',
    route: 'Hải Phòng → Cát Bà',
    plate: '15B-456.78',
    driver: 'Lê Văn Cường',
    customer: 'Khách lẻ',
    status: 'IN_PROGRESS',
  },
  {
    id: 'LX261006-015',
    time: '13:30',
    route: 'Hải Phòng → Cát Bà',
    plate: '15B-123.45',
    driver: 'Nguyễn Văn Nam',
    customer: 'Khách lẻ',
    status: 'ASSIGNED',
  },
  {
    id: 'LX261006-016',
    time: '15:00',
    route: 'Hải Phòng → Cát Bà',
    plate: '15F-222.11',
    driver: 'Lê Văn Cường',
    customer: 'Công ty Thành Đạt',
    status: 'ISSUED',
  },
])
const selectedId = ref('LX261006-015')
const search = ref('')
const actualStart = ref('13:35')
const startOdometer = ref('45230')
const actualEnd = ref('16:10')
const endOdometer = ref('45372')
const notice = ref('')
const selected = computed<Order>(
  () => orders.value.find((order) => order.id === selectedId.value) ?? orders.value[0]!,
)
const visibleOrders = computed(() =>
  orders.value.filter((order) =>
    `${order.id}${order.plate}${order.driver}${order.route}`
      .toLocaleLowerCase('vi-VN')
      .includes(search.value.toLocaleLowerCase('vi-VN')),
  ),
)
const statusLabel: Record<OrderStatus, string> = {
  ISSUED: 'Đã phát hành',
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang chạy',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
}
const statusClass = (status: OrderStatus) =>
  status === 'COMPLETED'
    ? 'bg-success/10 text-success'
    : status === 'IN_PROGRESS'
      ? 'bg-amber-100 text-amber-800'
      : status === 'CANCELLED'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-primary/10 text-primary'
function startTrip() {
  selected.value.status = 'IN_PROGRESS'
  notice.value = `Đã bắt đầu chuyến lúc ${actualStart.value}; ODO đầu ${startOdometer.value} km.`
}
function completeTrip() {
  selected.value.status = 'COMPLETED'
  notice.value = `Đã hoàn tất chuyến lúc ${actualEnd.value}; ODO cuối ${endOdometer.value} km.`
}
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
            <CalendarDaysIcon class="size-4 text-primary" />Thứ Ba, 06/10/2026<ChevronDownIcon
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
            <CalendarDaysIcon class="size-4" />Thứ Ba, 06/10/2026 · {{ selected.time }} – 16:00
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
            ><strong>Khách lẻ</strong>
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
          v-else
          class="rounded-lg border border-border bg-muted/35 p-3 text-sm text-muted-foreground"
        >
          <Clock3Icon class="mr-1 inline size-4" />Chọn lệnh đã phân công hoặc đang chạy để cập nhật
          số liệu thực tế.
        </section>
      </aside>
    </div>
  </section>
</template>
