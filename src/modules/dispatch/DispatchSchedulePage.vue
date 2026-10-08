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
import { useMutation } from '@tanstack/vue-query'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { RentalService } from '@/services/rental.service'
import { useDispatchMutations, useTripSchedules } from './dispatch.composables'
import type { TripSchedule } from './dispatch.types'

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
  source: TripSchedule
}
const selectedId = ref('')
const selectedVehicle = ref('')
const selectedDriver = ref('')
const search = ref('')
const snapshotVisible = ref(false)
const notice = ref('')
const issueDialogOpen = ref(false)
const activeTab = ref<'assignment' | 'history'>('assignment')
const schedulesQuery = useTripSchedules()
const dispatch = useDispatchMutations()
const availability = useMutation({ mutationFn: RentalService.checkAvailability })
const dateLabel = computed(() => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()))
const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
const toStatus = (schedule: TripSchedule): Status => schedule.status === 'ASSIGNED' ? 'Đã phân công' : schedule.status === 'PLANNED' ? 'Chờ phân công' : schedule.status === 'CANCELLED' ? 'Chưa có xe' : 'Đã phân công'
const schedules = computed<Schedule[]>(() => (schedulesQuery.data.value ?? []).map((source) => {
  const assignment = source.assignments?.find((item) => item.is_current)
  return {
    id: String(source.id),
    time: formatTime(source.scheduled_start_at),
    route: source.route?.name ?? ([source.pickup_location, source.dropoff_location].filter(Boolean).join(' → ') || 'Chưa có tuyến'),
    service: source.service_type,
    customer: source.contract?.contract_no ?? 'Hợp đồng',
    vehicleType: source.required_vehicle_type?.name ?? 'Chưa xác định',
    status: toStatus(source),
    vehicle: assignment?.vehicle?.license_plate,
    driver: assignment?.driver?.full_name,
    source,
  }
}))
const selected = computed<Schedule>(() => schedules.value.find((row) => row.id === selectedId.value) ?? schedules.value[0]!)
const groups = computed(() => [...new Set(schedules.value.map((row) => row.route))].map((route) => ({ route, rows: schedules.value.filter((row) => row.route === route && `${row.id}${row.customer}${row.vehicle || ''}${row.driver || ''}`.toLocaleLowerCase('vi-VN').includes(search.value.toLocaleLowerCase('vi-VN'))) })).filter((group) => group.rows.length))
const vehicles = computed(() => availability.data.value?.vehicle_capacities?.[0]?.candidates?.map((vehicle) => ({ plate: vehicle.license_plate, type: vehicle.ownership_type === 'partner' ? 'Xe đối tác' : 'Xe công ty', available: true, id: vehicle.id })) ?? [])
const drivers = computed(() => availability.data.value?.driver_capacity?.candidates?.map((driver) => ({ name: driver.full_name, detail: driver.license_expired_at ? `Hạn bằng: ${driver.license_expired_at}` : 'Đủ điều kiện', available: true, id: driver.id })) ?? [])
const replacementHistory = computed(() => selected.value?.source.assignments?.filter((item) => !item.is_current) ?? [])
const stateClass = (status: Status) => status === 'Đã phân công' ? 'bg-success/10 text-success' : status === 'Chờ phân công' ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300' : 'bg-destructive/10 text-destructive'
function choose(id: string) {
  selectedId.value = id
  snapshotVisible.value = false
  notice.value = ''
  selectedVehicle.value = ''
  selectedDriver.value = ''
}
function checkAvailability() {
  if (!selected.value?.source.required_vehicle_type?.id) return
  availability.mutate({ start_at: selected.value.source.scheduled_start_at, end_at: selected.value.source.scheduled_end_at, items: [{ vehicle_type_id: selected.value.source.required_vehicle_type.id, quantity: 1 }] }, {
    onSuccess: () => { snapshotVisible.value = true; notice.value = 'Đã cập nhật snapshot năng lực.' },
    onError: () => { notice.value = 'Không thể kiểm tra năng lực. Vui lòng thử lại.' },
  })
}
function assign() {
  const vehicle = vehicles.value.find((item) => item.plate === selectedVehicle.value)
  const driver = drivers.value.find((item) => item.name === selectedDriver.value)
  if (!selected.value || !vehicle || !driver) { notice.value = 'Hãy chọn xe và tài xế từ snapshot năng lực.'; return }
  const hasCurrent = selected.value.source.assignments?.some((item) => item.is_current)
  const mutation = hasCurrent ? dispatch.substitute : dispatch.assign
  mutation.mutate({ id: selected.value.source.id, payload: { vehicle_id: vehicle.id, driver_id: driver.id, replace_reason: hasCurrent ? 'Điều hành thay phân công' : undefined } }, { onSuccess: () => { notice.value = 'Đã lưu phân công và làm mới lịch chuyến.' } })
}
function issueOrder() {
  if (!selected.value) return
  dispatch.issue.mutate(selected.value.source.id, { onSuccess: () => { issueDialogOpen.value = false; notice.value = 'Đã phát hành lệnh điều xe.' } })
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
          <button class="border-b-2 px-1 pb-2.5" :class="activeTab === 'assignment' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'" type="button" @click="activeTab = 'assignment'">
            Chọn xe & tài xế</button
          ><button class="border-b-2 px-1 pb-2.5" :class="activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'" type="button" @click="activeTab = 'history'">
            Lịch sử thay thế
          </button>
        </div>
        <div
          v-if="snapshotVisible"
          class="flex gap-2 rounded-lg border border-primary/15 bg-primary/[0.06] px-3 py-2.5 text-xs text-primary"
        >
          <CheckCircle2Icon class="size-4 shrink-0" />Kết quả kiểm tra năng lực vừa cập nhật.
          Snapshot không giữ tài nguyên.
        </div>
        <button
          class="w-full rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/[0.05]"
          type="button"
          @click="checkAvailability"
        >
          Kiểm tra năng lực
        </button>
        <div v-if="activeTab === 'assignment'" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
          <div>
            <h3 class="mb-2 text-sm font-bold">
              Xe phù hợp <span class="text-muted-foreground">({{ selected.vehicleType }})</span>
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
        <div v-else class="space-y-2 rounded-lg border border-border p-3 text-sm">
          <p v-if="replacementHistory.length === 0" class="text-muted-foreground">Chưa có lần thay phân công.</p>
          <div v-for="assignment in replacementHistory" :key="assignment.id" class="border-b border-border pb-2 last:border-0">
            <strong>{{ assignment.vehicle?.license_plate ?? '—' }} · {{ assignment.driver?.full_name ?? '—' }}</strong>
            <p class="mt-1 text-xs text-muted-foreground">{{ assignment.replace_reason || 'Thay phân công' }}</p>
          </div>
        </div>
        <div
          v-if="snapshotVisible && availability.data.value && !availability.data.value.can_fulfill"
          class="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive"
        >
          <AlertCircleIcon class="size-4 shrink-0" />Không đủ xe hoặc tài xế phù hợp trong khung giờ này.
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
            :disabled="dispatch.assign.isPending.value || dispatch.substitute.isPending.value || activeTab !== 'assignment'"
            type="button"
            @click="assign"
          >
            <CheckCircle2Icon class="mr-1 inline size-4" />{{ selected.status === 'Đã phân công' ? 'Thay phân công' : 'Phân công' }}
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
        <button class="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success disabled:opacity-50" :disabled="selected.status !== 'Đã phân công' || dispatch.issue.isPending.value" type="button" @click="issueDialogOpen = true">Phát hành lệnh</button>
      </div>
      <div class="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
        <p>
          <span class="block text-xs text-muted-foreground">Mã lệnh</span
          ><strong>{{ selected.source.dispatch_order?.order_no ?? 'Chưa phát hành' }}</strong>
        </p>
        <p>
          <span class="block text-xs text-muted-foreground">Xe / Tài xế</span
          ><strong>{{ selected.vehicle ?? '—' }} · {{ selected.driver ?? '—' }}</strong>
        </p>
        <p>
          <span class="block text-xs text-muted-foreground">Tuyến</span
          ><strong>{{ selected.route }}</strong>
        </p>
        <p>
          <span class="block text-xs text-muted-foreground">Giờ đi</span
          ><strong class="tabular-nums">{{ selected.time }}</strong>
        </p>
      </div>
    </article>
    <AccessDialog :open="issueDialogOpen" title="Phát hành lệnh điều xe" :description="`Phát hành lệnh cho lịch ${selected.source.schedule_no}. Muốn thay xe hoặc tài xế sau đó phải hủy lệnh trước.`" confirm-label="Phát hành" cancel-label="Quay lại" :pending="dispatch.issue.isPending.value" @close="issueDialogOpen = false" @confirm="issueOrder" />
  </section>
</template>
