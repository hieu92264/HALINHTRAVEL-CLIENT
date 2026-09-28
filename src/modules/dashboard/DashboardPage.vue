<script setup lang="ts">
import {
  AlertTriangleIcon,
  BusFrontIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  Clock3Icon,
  MapPinIcon,
  UserRoundIcon,
} from '@lucide/vue'

type TripStatus = 'Đang chạy' | 'Đã xác nhận' | 'Chờ phân công'

const todayLabel = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date())

const trips: Array<{
  time: string
  route: string
  service: string
  plate: string
  driver: string
  status: TripStatus
}> = [
  {
    time: '06:30',
    route: 'Hải Phòng → VSIP',
    service: 'Đưa đón công nhân · Ca sáng',
    plate: '15B-123.45',
    driver: 'Nguyễn Văn An',
    status: 'Đang chạy',
  },
  {
    time: '08:00',
    route: 'Hải Phòng → Cát Bà',
    service: 'Xe du lịch · Khách đoàn',
    plate: '15F-088.68',
    driver: 'Trần Minh Bình',
    status: 'Đã xác nhận',
  },
  {
    time: '13:30',
    route: 'Hải Phòng → Hạ Long',
    service: 'Xe du lịch · Khách đoàn',
    plate: 'Chưa phân xe',
    driver: 'Chưa phân tài xế',
    status: 'Chờ phân công',
  },
]

const statusClass: Record<TripStatus, string> = {
  'Đang chạy': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
  'Đã xác nhận': 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300',
  'Chờ phân công': 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/15 dark:text-amber-300',
}
</script>

<template>
  <section class="mx-auto max-w-[1440px] space-y-6">
    <header class="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="flex items-center gap-2 text-sm font-medium text-primary">
          <CalendarDaysIcon class="size-4" />
          {{ todayLabel }}
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
          Điều hành hôm nay
        </h1>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Theo dõi lịch xe, phân công tài xế và các khoản cần đối soát trong ngày.
        </p>
      </div>

      <div class="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card text-center">
        <div class="px-4 py-3 sm:px-6">
          <p class="text-xl font-bold tabular-nums text-foreground">12</p>
          <p class="mt-0.5 text-xs text-muted-foreground">chuyến hôm nay</p>
        </div>
        <div class="px-4 py-3 sm:px-6">
          <p class="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">8</p>
          <p class="mt-0.5 text-xs text-muted-foreground">đã hoàn tất</p>
        </div>
        <div class="px-4 py-3 sm:px-6">
          <p class="text-xl font-bold tabular-nums text-amber-600 dark:text-amber-300">3</p>
          <p class="mt-0.5 text-xs text-muted-foreground">cần xử lý</p>
        </div>
      </div>
    </header>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 class="text-base font-bold text-foreground">Lịch xe hôm nay</h2>
            <p class="mt-0.5 text-xs text-muted-foreground">Các chuyến sắp khởi hành và đang vận hành</p>
          </div>
          <Clock3Icon class="size-5 text-muted-foreground" />
        </div>

        <ol class="divide-y divide-border">
          <li v-for="trip in trips" :key="`${trip.time}-${trip.route}`" class="relative p-5 sm:px-6">
            <div class="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
              <time class="font-semibold tabular-nums text-foreground">{{ trip.time }}</time>

              <div class="relative min-w-0 border-l-2 border-primary/25 pl-5">
                <span class="absolute -left-1.5 top-1.5 size-3 rounded-full border-[3px] border-card bg-primary" />
                <p class="truncate text-sm font-semibold text-foreground">{{ trip.route }}</p>
                <p class="mt-1 text-xs text-muted-foreground">{{ trip.service }}</p>
                <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span class="inline-flex items-center gap-1.5">
                    <BusFrontIcon class="size-3.5 text-primary" />
                    <strong class="font-semibold tabular-nums text-foreground">{{ trip.plate }}</strong>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <UserRoundIcon class="size-3.5" />
                    {{ trip.driver }}
                  </span>
                </div>
              </div>

              <span
                class="w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                :class="statusClass[trip.status]"
              >
                {{ trip.status }}
              </span>
            </div>
          </li>
        </ol>
      </article>

      <aside class="space-y-6">
        <article class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/20 dark:bg-amber-400/5">
          <div class="flex items-start gap-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
              <AlertTriangleIcon class="size-5" />
            </span>
            <div>
              <h2 class="text-sm font-bold text-foreground">Cần xử lý</h2>
              <p class="mt-1 text-xs leading-5 text-muted-foreground">3 việc cần hoàn thành trước khi chốt ngày.</p>
            </div>
          </div>
          <ul class="mt-4 space-y-3 border-t border-amber-200/70 pt-4 dark:border-amber-500/20">
            <li class="text-sm leading-5 text-foreground">Phân xe và tài xế cho chuyến Hải Phòng → Hạ Long.</li>
            <li class="text-sm leading-5 text-foreground">Bổ sung chứng từ chi phí xe 15B-123.45.</li>
            <li class="text-sm leading-5 text-foreground">Đối soát cước xe đoàn Cát Bà.</li>
          </ul>
        </article>

        <article class="rounded-2xl border border-border bg-card p-5">
          <div class="flex items-center gap-3">
            <span class="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <CircleDollarSignIcon class="size-5" />
            </span>
            <div>
              <h2 class="text-sm font-bold text-foreground">Đối soát hôm nay</h2>
              <p class="text-xs text-muted-foreground">Cập nhật lúc 08:15</p>
            </div>
          </div>
          <dl class="mt-5 space-y-3 text-sm">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-muted-foreground">Cần thu khách hàng</dt>
              <dd class="font-bold tabular-nums text-foreground">18.500.000 đ</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-muted-foreground">Cần chi chủ xe</dt>
              <dd class="font-bold tabular-nums text-foreground">6.200.000 đ</dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-t border-border pt-3">
              <dt class="font-medium text-foreground">Đã đối soát</dt>
              <dd class="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">72%</dd>
            </div>
          </dl>
        </article>
      </aside>
    </div>

    <article class="overflow-hidden rounded-2xl border border-border bg-card">
      <div class="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <MapPinIcon class="size-5 text-primary" />
        <div>
          <h2 class="text-base font-bold text-foreground">Năng lực vận hành</h2>
          <p class="mt-0.5 text-xs text-muted-foreground">Tình trạng đội xe và phân công theo ca hôm nay</p>
        </div>
      </div>
      <div class="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div class="p-5 sm:px-6">
          <p class="text-sm text-muted-foreground">Xe sẵn sàng</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">18 <span class="text-sm font-medium text-muted-foreground">/ 22 xe</span></p>
        </div>
        <div class="p-5 sm:px-6">
          <p class="text-sm text-muted-foreground">Tài xế đã phân công</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">16 <span class="text-sm font-medium text-muted-foreground">/ 18 người</span></p>
        </div>
        <div class="p-5 sm:px-6">
          <p class="text-sm text-muted-foreground">Xe cần kiểm tra</p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-300">2 <span class="text-sm font-medium text-muted-foreground">xe</span></p>
        </div>
      </div>
    </article>
  </section>
</template>
