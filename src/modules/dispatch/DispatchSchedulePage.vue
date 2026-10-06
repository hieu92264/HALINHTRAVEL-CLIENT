<script setup lang="ts">
import {
  AlertCircleIcon,
  BusFrontIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleDotIcon,
  Clock3Icon,
  SearchIcon,
  UserRoundIcon,
  XIcon,
} from '@lucide/vue'
import { computed, ref } from 'vue'

type Status = 'Đã phân công' | 'Chờ phân công' | 'Chưa có xe'
type Schedule = {
  id: string
  time: string
  route: string
  service: string
  customer: string
  vehicleType: string
  status: Status
  vehicle?: string
  driver?: string
}
const dateLabel = 'Thứ Ba, 06/10/2026'
const selectedId = ref('LP261006-04')
const selectedVehicle = ref('15B-123.45')
const selectedDriver = ref('Nguyễn Văn Nam')
const search = ref('')
const snapshotVisible = ref(true)
const notice = ref('')
const schedules = ref<Schedule[]>([
  {
    id: 'LP261006-01',
    time: '06:30',
    route: 'Hải Phòng → Cát Bà',
    service: 'Khách lẻ',
    customer: 'Khách lẻ',
    vehicleType: '29 chỗ',
    status: 'Đã phân công',
    vehicle: '15B-456.78',
    driver: 'Lê Văn Cường',
  },
  {
    id: 'LP261006-02',
    time: '08:00',
    route: 'Hải Phòng → Cát Bà',
    service: 'Hợp đồng',
    customer: 'Công ty Thành Đạt',
    vehicleType: '35 chỗ',
    status: 'Đã phân công',
    vehicle: '15B-678.90',
    driver: 'Trần Minh Hiếu',
  },
  {
    id: 'LP261006-03',
    time: '10:30',
    route: 'Hải Phòng → Cát Bà',
    service: 'Khách lẻ',
    customer: 'Khách lẻ',
    vehicleType: '29 chỗ',
    status: 'Đã phân công',
    vehicle: '15F-222.11',
    driver: 'Nguyễn Văn Nam',
  },
  {
    id: 'LP261006-04',
    time: '13:30',
    route: 'Hải Phòng → Cát Bà',
    service: 'Khách lẻ',
    customer: 'Khách lẻ',
    vehicleType: '29 chỗ',
    status: 'Chờ phân công',
  },
  {
    id: 'LP261006-05',
    time: '15:00',
    route: 'Hải Phòng → Cát Bà',
    service: 'Hợp đồng',
    customer: 'Công ty An Phát',
    vehicleType: '35 chỗ',
    status: 'Đã phân công',
    vehicle: '15B-123.45',
    driver: 'Nguyễn Văn Nam',
  },
  {
    id: 'LP261006-07',
    time: '06:00',
    route: 'Hải Phòng → VSIP',
    service: 'Đưa đón',
    customer: 'Công ty An Phát',
    vehicleType: '29 chỗ',
    status: 'Đã phân công',
    vehicle: '15B-123.45',
    driver: 'Nguyễn Văn Nam',
  },
  {
    id: 'LP261006-08',
    time: '09:00',
    route: 'Hải Phòng → VSIP',
    service: 'Đưa đón',
    customer: 'Công ty Hòa Phát',
    vehicleType: '35 chỗ',
    status: 'Đã phân công',
    vehicle: '15B-678.90',
    driver: 'Trần Minh Hiếu',
  },
  {
    id: 'LP261006-10',
    time: '17:00',
    route: 'Hải Phòng → VSIP',
    service: 'Khách lẻ',
    customer: 'Khách lẻ',
    vehicleType: '29 chỗ',
    status: 'Chưa có xe',
  },
])
const vehicles = [
  { plate: '15B-123.45', type: '29 chỗ (Universe)', available: true },
  { plate: '15B-456.78', type: '29 chỗ (Universe)', available: true },
  { plate: '15F-222.11', type: '29 chỗ (Thaco)', available: true },
  { plate: '15B-999.99', type: '29 chỗ (Đối tác)', available: false },
]
const drivers = [
  { name: 'Nguyễn Văn Nam', detail: 'Hạng D · 5 năm', available: true },
  { name: 'Lê Văn Cường', detail: 'Hạng D · 4 năm', available: true },
  { name: 'Trần Minh Hiếu', detail: 'Hạng D · 6 năm', available: true },
  { name: 'Hoàng Văn Hải', detail: 'Trùng giờ: 11:00 – 15:00', available: false },
]
const selected = computed<Schedule>(
  () => schedules.value.find((row) => row.id === selectedId.value) ?? schedules.value[0]!,
)
const groups = computed(() =>
  ['Hải Phòng → Cát Bà', 'Hải Phòng → VSIP']
    .map((route) => ({
      route,
      rows: schedules.value.filter(
        (row) =>
          row.route === route &&
          `${row.id}${row.customer}${row.vehicle || ''}${row.driver || ''}`
            .toLocaleLowerCase('vi-VN')
            .includes(search.value.toLocaleLowerCase('vi-VN')),
      ),
    }))
    .filter((group) => group.rows.length),
)
const stateClass = (status: Status) =>
  status === 'Đã phân công'
    ? 'bg-success/10 text-success'
    : status === 'Chờ phân công'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'
      : 'bg-destructive/10 text-destructive'
function choose(id: string) {
  selectedId.value = id
  snapshotVisible.value = false
  notice.value = ''
}
function checkAvailability() {
  snapshotVisible.value = true
  notice.value = 'Đã cập nhật snapshot năng lực lúc 09:15.'
}
function assign() {
  selected.value.vehicle = selectedVehicle.value
  selected.value.driver = selectedDriver.value
  selected.value.status = 'Đã phân công'
  notice.value = `Đã phân công ${selectedVehicle.value} và ${selectedDriver.value}; lệnh điều xe đã sẵn sàng tạo.`
}
</script>

<template>
  <section class="mx-auto max-w-[1480px] space-y-4">
    <header class="rounded-xl border border-border bg-card">
      <div
        class="flex flex-col gap-3 border-b border-border px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5"
      >
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">Lịch chuyến</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Điều phối lịch xe, phân công và lệnh điều xe trong ngày.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-semibold"
          >
            <CalendarDaysIcon class="size-4 text-primary" />{{ dateLabel
            }}<ChevronDownIcon class="size-3.5" /></button
          ><button class="h-9 rounded-lg border border-input px-3 text-sm">Hôm nay</button
          ><button
            class="h-9 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
          >
            + Tạo lịch chuyến
          </button>
        </div>
      </div>
      <div class="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-6">
        <label
          v-for="filter in ['Thời gian', 'Trạng thái', 'Hợp đồng', 'Dịch vụ', 'Tuyến']"
          :key="filter"
          class="space-y-1 text-xs font-medium text-muted-foreground"
          >{{ filter
          }}<button
            class="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground"
          >
            Tất cả <ChevronDownIcon class="size-3.5" /></button></label
        ><label class="space-y-1 text-xs font-medium text-muted-foreground"
          >Xe / Tài xế<span class="relative block"
            ><SearchIcon class="absolute left-3 top-2.5 size-4" /><input
              v-model="search"
              class="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Tìm xe, tài xế..." /></span
        ></label>
      </div>
    </header>
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.72fr)_minmax(380px,0.88fr)]">
      <article class="overflow-hidden rounded-xl border border-border bg-card">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px] text-left text-[13px]">
            <thead
              class="border-b border-border bg-muted/45 text-xs font-semibold text-muted-foreground"
            >
              <tr>
                <th class="px-3 py-3">#</th>
                <th class="px-3 py-3">Giờ đi</th>
                <th class="px-3 py-3">Số lịch</th>
                <th class="px-3 py-3">Dịch vụ</th>
                <th class="px-3 py-3">Hợp đồng / Khách hàng</th>
                <th class="px-3 py-3">Loại xe</th>
                <th class="px-3 py-3">Trạng thái</th>
                <th class="px-3 py-3">Phân công</th>
              </tr>
            </thead>
            <tbody v-for="group in groups" :key="group.route">
              <tr class="border-y border-border bg-primary/[0.055]">
                <td colspan="8" class="px-3 py-2.5">
                  <div class="flex justify-between gap-4">
                    <span class="flex items-center gap-2 font-bold"
                      ><BusFrontIcon class="size-4 text-primary" />{{ group.route }}</span
                    ><span class="text-xs text-muted-foreground"
                      >{{ group.rows.length }} chuyến</span
                    >
                  </div>
                </td>
              </tr>
              <tr
                v-for="(row, index) in group.rows"
                :key="row.id"
                class="cursor-pointer border-b border-border hover:bg-muted/60"
                :class="
                  selectedId === row.id
                    ? 'bg-amber-50/70 ring-1 ring-inset ring-amber-300 dark:bg-amber-400/10'
                    : ''
                "
                tabindex="0"
                @click="choose(row.id)"
                @keydown.enter="choose(row.id)"
              >
                <td class="px-3 py-3 tabular-nums text-muted-foreground">{{ index + 1 }}</td>
                <td class="px-3 py-3 font-semibold tabular-nums">{{ row.time }}</td>
                <td class="px-3 py-3 font-medium text-primary">{{ row.id }}</td>
                <td class="px-3 py-3">{{ row.service }}</td>
                <td class="px-3 py-3">{{ row.customer }}</td>
                <td class="px-3 py-3">{{ row.vehicleType }}</td>
                <td class="px-3 py-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                    :class="stateClass(row.status)"
                    ><CircleDotIcon class="size-3" />{{ row.status }}</span
                  >
                </td>
                <td class="px-3 py-3">
                  <strong v-if="row.vehicle" class="block tabular-nums">{{ row.vehicle }}</strong
                  ><span class="text-xs text-muted-foreground">{{ row.driver || '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
      <aside class="space-y-3 rounded-xl border border-border bg-card p-4 lg:p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Phân công xe & tài xế
            </p>
            <h2 class="mt-1 text-xl font-bold">{{ selected.route }}</h2>
            <p class="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock3Icon class="size-4" />{{ dateLabel }} · {{ selected.time }} – 16:00
            </p>
          </div>
          <button class="rounded-md p-1.5 text-muted-foreground hover:bg-muted" type="button">
            <XIcon class="size-4" />
          </button>
        </div>
        <div class="flex gap-5 border-b border-border text-sm font-semibold">
          <button class="border-b-2 border-primary px-1 pb-2.5 text-primary" type="button">
            Chọn xe & tài xế</button
          ><button class="px-1 pb-2.5 text-muted-foreground" type="button">
            Thông tin lịch chuyến
          </button>
        </div>
        <div
          v-if="snapshotVisible"
          class="flex gap-2 rounded-lg border border-primary/15 bg-primary/[0.06] px-3 py-2.5 text-xs text-primary"
        >
          <CheckCircle2Icon class="size-4 shrink-0" />Kết quả kiểm tra năng lực tại 06/10/2026
          09:15. Snapshot không giữ tài nguyên.
        </div>
        <button
          class="w-full rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/[0.05]"
          type="button"
          @click="checkAvailability"
        >
          Kiểm tra năng lực
        </button>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
          <div>
            <h3 class="mb-2 text-sm font-bold">
              Xe phù hợp <span class="text-muted-foreground">(29 chỗ)</span>
            </h3>
            <label
              v-for="vehicle in vehicles"
              :key="vehicle.plate"
              class="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border p-2"
              :class="[
                selectedVehicle === vehicle.plate
                  ? 'border-primary bg-primary/[0.045]'
                  : 'border-border',
                vehicle.available ? '' : 'opacity-50',
              ]"
              ><input
                v-model="selectedVehicle"
                :value="vehicle.plate"
                :disabled="!vehicle.available"
                type="radio"
                class="size-3.5 accent-primary"
              /><BusFrontIcon class="size-5 text-primary" /><span class="min-w-0"
                ><strong class="block text-xs tabular-nums">{{ vehicle.plate }}</strong
                ><span class="block text-[11px] text-muted-foreground">{{
                  vehicle.type
                }}</span></span
              ></label
            >
          </div>
          <div>
            <h3 class="mb-2 text-sm font-bold">Tài xế phù hợp</h3>
            <label
              v-for="driver in drivers"
              :key="driver.name"
              class="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border p-2"
              :class="[
                selectedDriver === driver.name
                  ? 'border-primary bg-primary/[0.045]'
                  : 'border-border',
                driver.available ? '' : 'opacity-50',
              ]"
              ><input
                v-model="selectedDriver"
                :value="driver.name"
                :disabled="!driver.available"
                type="radio"
                class="size-3.5 accent-primary"
              /><UserRoundIcon class="size-4 text-primary" /><span class="min-w-0"
                ><strong class="block text-xs">{{ driver.name }}</strong
                ><span class="block text-[11px] text-muted-foreground">{{
                  driver.detail
                }}</span></span
              ></label
            >
          </div>
        </div>
        <div
          class="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive"
        >
          <AlertCircleIcon class="size-4 shrink-0" />1 xe và 1 tài xế không khả dụng do trùng giờ.
        </div>
        <p
          v-if="notice"
          class="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success"
          role="status"
        >
          {{ notice }}
        </p>
        <div class="flex justify-end gap-2 border-t border-border pt-3">
          <button class="h-9 rounded-lg border border-input px-4 text-sm" type="button">Hủy</button
          ><button
            class="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            :disabled="selected.status === 'Đã phân công'"
            type="button"
            @click="assign"
          >
            <CheckCircle2Icon class="mr-1 inline size-4" />Phân công
          </button>
        </div>
      </aside>
    </div>
    <article class="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex gap-3">
          <span class="grid size-9 place-items-center rounded-lg bg-success/10 text-success"
            ><CheckCircle2Icon class="size-5"
          /></span>
          <div>
            <h2 class="font-bold">Lệnh điều xe sẽ được tạo</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Sau khi lịch có xe và tài xế hợp lệ, tạo một lệnh duy nhất cho mỗi lịch chuyến.
            </p>
          </div>
        </div>
        <span class="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
          >Đã phát hành</span
        >
      </div>
      <div class="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
        <p>
          <span class="block text-xs text-muted-foreground">Mã lệnh</span
          ><strong>LX261006-015</strong>
        </p>
        <p>
          <span class="block text-xs text-muted-foreground">Xe / Tài xế</span
          ><strong>15B-123.45 · Nguyễn Văn Nam</strong>
        </p>
        <p>
          <span class="block text-xs text-muted-foreground">Tuyến</span
          ><strong>Hải Phòng → Cát Bà</strong>
        </p>
        <p>
          <span class="block text-xs text-muted-foreground">Giờ đi</span
          ><strong class="tabular-nums">13:30 · 06/10/2026</strong>
        </p>
      </div>
    </article>
  </section>
</template>
