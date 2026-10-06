<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div class="min-w-0">
        <nav class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <RouterLink
            class="transition-colors hover:text-foreground"
            :to="{ name: 'rental-requests' }"
          >
            Thuê xe
          </RouterLink>
          <ChevronRight class="size-4" />
          <RouterLink
            class="transition-colors hover:text-foreground"
            :to="{ name: 'rental-requests' }"
          >
            Yêu cầu thuê
          </RouterLink>
          <ChevronRight class="size-4" />
          <span class="font-medium text-foreground">{{ request.id }}</span>
        </nav>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {{ request.id }}
          </h1>
          <span :class="statusBadgeClass(request.status)">
            {{ request.status }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          class="h-10 min-w-32 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <Ban class="size-4" />
          Từ chối
        </Button>
        <Button class="h-10 min-w-44">
          <FilePlus2 class="size-4" />
          Tạo báo giá mới
        </Button>
      </div>
    </header>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <main class="space-y-5">
        <section class="rounded-lg border bg-card shadow-sm">
          <div class="border-b px-5 py-4">
            <h2 class="text-lg font-semibold text-foreground">Thông tin yêu cầu</h2>
          </div>

          <div class="grid gap-x-8 gap-y-6 p-5 md:grid-cols-2 2xl:grid-cols-3">
            <InfoItem :icon="Users" label="Khách hàng" :value="request.customer" />
            <InfoItem :icon="CalendarDays" label="Ngày yêu cầu" :value="request.requestedAt" />
            <InfoItem :icon="FileText" label="Mã yêu cầu" :value="request.id" />
            <InfoItem :icon="ClipboardList" label="Loại hình dịch vụ" :value="request.service" />
            <InfoItem :icon="UserRound" label="Người liên hệ" :value="request.contact" />
            <InfoItem :icon="Mail" label="Email" :value="request.email" />
            <InfoItem :icon="MessageSquareText" label="Nguồn yêu cầu" :value="request.source" />
            <InfoItem :icon="Phone" label="Số điện thoại" :value="request.phone" />
            <InfoItem :icon="Building2" label="Địa chỉ" :value="request.address" />
          </div>
        </section>

        <section class="rounded-lg border bg-card shadow-sm">
          <div class="border-b px-5 py-4">
            <h2 class="text-lg font-semibold text-foreground">Lịch trình chuyến đi</h2>
          </div>

          <div class="space-y-5 p-5">
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] lg:items-center">
              <RoutePoint :title="request.pickup.name" :address="request.pickup.address" />
              <div class="hidden items-center justify-center text-primary lg:flex">
                <span class="h-px flex-1 border-t border-dashed border-primary/60" />
                <Bus class="mx-2 size-5 shrink-0" />
                <span class="h-px flex-1 border-t border-dashed border-primary/60" />
              </div>
              <RoutePoint :title="request.dropoff.name" :address="request.dropoff.address" />
            </div>

            <div class="grid gap-4 rounded-lg bg-muted/60 p-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoItem compact :icon="CalendarDays" label="Ngày đi" :value="request.startAt" />
              <InfoItem compact :icon="CalendarDays" label="Ngày về" :value="request.endAt" />
              <InfoItem
                compact
                :icon="Clock3"
                label="Thời gian thuê (dự kiến)"
                :value="request.duration"
              />
              <InfoItem
                compact
                :icon="Map"
                label="Tổng quãng đường (dự kiến)"
                :value="request.distance"
              />
            </div>
          </div>
        </section>

        <section class="rounded-lg border bg-card shadow-sm">
          <div class="border-b px-5 py-4">
            <h2 class="text-lg font-semibold text-foreground">Hạng mục yêu cầu</h2>
          </div>

          <div class="space-y-5 p-5">
            <div class="overflow-x-auto rounded-lg border">
              <table class="w-full min-w-[720px] border-collapse text-sm">
                <thead class="bg-muted/70 text-left font-semibold text-muted-foreground">
                  <tr>
                    <th class="w-20 px-4 py-3 text-center">STT</th>
                    <th class="w-44 px-4 py-3">Loại xe</th>
                    <th class="w-36 px-4 py-3">Số lượng</th>
                    <th class="w-64 px-4 py-3">Thời gian sử dụng</th>
                    <th class="px-4 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="(item, index) in request.items"
                    :key="item.vehicleType"
                    class="bg-card"
                  >
                    <td class="px-4 py-3 text-center text-foreground">{{ index + 1 }}</td>
                    <td class="px-4 py-3 font-medium text-foreground">{{ item.vehicleType }}</td>
                    <td class="px-4 py-3 text-foreground">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-foreground">{{ item.usageTime }}</td>
                    <td class="px-4 py-3 text-foreground">{{ item.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex gap-3">
              <FileText class="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-foreground">Yêu cầu khác</h3>
                <div
                  class="mt-2 rounded-lg bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:bg-sky-950/30 dark:text-slate-200"
                >
                  <p v-for="note in request.notes" :key="note">{{ note }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <aside class="space-y-5">
        <section class="rounded-lg border bg-card shadow-sm">
          <div class="border-b px-5 py-4">
            <h2 class="text-lg font-semibold text-foreground">Tiến trình xử lý</h2>
          </div>

          <div class="p-5">
            <ol
              class="relative space-y-8 before:absolute before:left-4 before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-border"
            >
              <li
                v-for="step in timeline"
                :key="step.title"
                class="relative grid grid-cols-[40px_minmax(0,1fr)_auto] gap-2"
              >
                <span :class="timelineDotClass(step.state)">
                  <Check v-if="step.state === 'done'" class="size-4" />
                </span>
                <div class="min-w-0">
                  <h3
                    :class="
                      step.state === 'current'
                        ? 'font-semibold text-amber-600'
                        : 'font-semibold text-foreground'
                    "
                  >
                    {{ step.title }}
                  </h3>
                  <p class="mt-1 text-sm text-muted-foreground">{{ step.description }}</p>
                  <p v-if="step.actor" class="mt-1 text-sm text-muted-foreground">
                    Người thực hiện: {{ step.actor }}
                  </p>
                  <p v-if="step.source" class="mt-1 text-sm text-muted-foreground">
                    Nguồn: {{ step.source }}
                  </p>
                  <p v-if="step.note" class="mt-1 text-sm text-muted-foreground">
                    Ghi chú: {{ step.note }}
                  </p>
                </div>
                <time class="whitespace-nowrap text-sm text-muted-foreground">{{ step.time }}</time>
              </li>
            </ol>
          </div>
        </section>

        <section class="rounded-lg border bg-card shadow-sm">
          <div class="flex items-center gap-2 border-b px-5 py-4">
            <FileText class="size-5 text-foreground" />
            <h2 class="text-lg font-semibold text-foreground">Báo giá liên quan</h2>
          </div>

          <RouterLink
            class="flex items-center gap-4 p-5 transition-colors hover:bg-muted/40"
            :to="{ name: 'quotations' }"
          >
            <FileText class="size-8 shrink-0 text-muted-foreground" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-primary">{{ request.quotation.code }}</span>
                <ExternalLink class="size-3.5 text-primary" />
                <span
                  class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                >
                  {{ request.quotation.status }}
                </span>
              </div>
              <p class="mt-2 text-xs text-muted-foreground">
                Ngày tạo: {{ request.quotation.createdAt }} <span class="mx-1">|</span> Người tạo:
                {{ request.quotation.createdBy }}
              </p>
            </div>
            <ChevronRight class="size-5 text-muted-foreground" />
          </RouterLink>
        </section>

        <section
          class="flex gap-3 rounded-lg bg-sky-50 p-5 text-sky-950 ring-1 ring-sky-100 dark:bg-sky-950/30 dark:text-sky-50 dark:ring-sky-900"
        >
          <Info class="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 class="font-semibold">Lưu ý</h2>
            <p class="mt-2 text-sm leading-6 text-slate-700 dark:text-sky-100">
              Khách hàng đã được gửi báo giá. Bạn có thể tạo báo giá mới nếu cần điều chỉnh thông
              tin hoặc phương án xe.
            </p>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/shared/components/ui/button'
import {
  Ban,
  Building2,
  Bus,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  ExternalLink,
  FilePlus2,
  FileText,
  Info,
  Mail,
  Map,
  MapPin,
  MessageSquareText,
  Phone,
  UserRound,
  Users,
  type LucideIcon,
} from '@lucide/vue'
import { computed, defineComponent, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type RentalStatus = 'Mới' | 'Đã báo giá' | 'Đã chấp nhận' | 'Từ chối'
type TimelineState = 'done' | 'current' | 'pending'

interface RentalRequestDetail {
  id: string
  status: RentalStatus
  customer: string
  requestedAt: string
  service: string
  contact: string
  email: string
  source: string
  phone: string
  address: string
  pickup: {
    name: string
    address: string
  }
  dropoff: {
    name: string
    address: string
  }
  startAt: string
  endAt: string
  duration: string
  distance: string
  items: {
    vehicleType: string
    quantity: number
    usageTime: string
    note: string
  }[]
  notes: string[]
  quotation: {
    code: string
    status: string
    createdAt: string
    createdBy: string
  }
}

interface TimelineItem {
  title: string
  description: string
  time: string
  state: TimelineState
  actor?: string
  source?: string
  note?: string
}

const requests: RentalRequestDetail[] = [
  {
    id: 'YC-2026-0148',
    status: 'Đã báo giá',
    customer: 'Công ty Hải Phòng Xanh',
    requestedAt: '15/10/2026 14:32',
    service: 'Tour du lịch',
    contact: 'Trần Thị Mai',
    email: 'mai.tran@haiphongxanh.vn',
    source: 'Zalo',
    phone: '0903 246 789',
    address: 'Số 18 Trần Phú, Ngô Quyền, Hải Phòng',
    pickup: {
      name: 'Hà Nội - Văn phòng Cầu Giấy',
      address: 'Số 123 Dương Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    },
    dropoff: {
      name: 'Hạ Long - Bãi Cháy',
      address: 'Bãi Cháy, TP. Hạ Long, Quảng Ninh',
    },
    startAt: '20/10/2026\n06:00',
    endAt: '20/10/2026\n18:00',
    duration: '12 giờ',
    distance: '~ 320 km',
    items: [
      {
        vehicleType: 'Xe 45 chỗ',
        quantity: 2,
        usageTime: '20/10/2026 06:00\n- 20/10/2026 18:00',
        note: 'Có nước uống',
      },
    ],
    notes: [
      'Đón khách tại văn phòng, di chuyển Hạ Long tham quan trong ngày và về trong ngày.',
      'Ưu tiên xe đời mới, sạch sẽ, có nước uống cho khách.',
    ],
    quotation: {
      code: 'BG-2026-0086',
      status: 'Đã gửi',
      createdAt: '16/10/2026 09:15',
      createdBy: 'Nguyễn Văn A',
    },
  },
  {
    id: 'YC-2026-0147',
    status: 'Đã báo giá',
    customer: 'Trường THPT Ngô Quyền',
    requestedAt: '15/10/2026 08:10',
    service: 'Đưa đón học sinh',
    contact: 'Phạm Minh Anh',
    email: 'minhanh@nguyen.edu.vn',
    source: 'Hotline',
    phone: '0912 456 778',
    address: 'Ngô Quyền, Hải Phòng',
    pickup: {
      name: 'Hải Phòng - Trường THPT Ngô Quyền',
      address: 'Quận Ngô Quyền, Hải Phòng',
    },
    dropoff: {
      name: 'Hà Nội - Bảo tàng Dân tộc học',
      address: 'Cầu Giấy, Hà Nội',
    },
    startAt: '15/10/2026\n07:00',
    endAt: '15/10/2026\n17:00',
    duration: '10 giờ',
    distance: '~ 240 km',
    items: [
      {
        vehicleType: 'Xe 45 chỗ',
        quantity: 3,
        usageTime: '15/10/2026 07:00\n- 15/10/2026 17:00',
        note: 'Có micro',
      },
    ],
    notes: ['Đoàn học sinh đi tham quan trong ngày.', 'Cần tài xế quen tuyến Hà Nội.'],
    quotation: {
      code: 'BG-2026-0085',
      status: 'Đã gửi',
      createdAt: '15/10/2026 11:20',
      createdBy: 'Nguyễn Văn A',
    },
  },
]

const route = useRoute()
const fallbackRequest = requests[0] as RentalRequestDetail
const request = computed<RentalRequestDetail>(() => {
  const id = String(route.params.id ?? '')
  return requests.find((item) => item.id === id) ?? fallbackRequest
})

const timeline = computed<TimelineItem[]>(() => [
  {
    title: 'Mới',
    description: 'Tạo yêu cầu thuê',
    actor: 'Trần Thị Mai',
    source: request.value.source,
    time: '15/10/2026 14:32',
    state: 'done',
  },
  {
    title: 'Đã báo giá',
    description: 'Đã gửi báo giá cho khách hàng',
    actor: 'Nguyễn Văn A',
    note: 'Báo giá theo yêu cầu, chờ phản hồi từ khách.',
    time: request.value.quotation.createdAt,
    state: 'current',
  },
  {
    title: 'Đã chấp nhận',
    description: 'Khách hàng đồng ý báo giá',
    time: '--',
    state: 'pending',
  },
  {
    title: 'Từ chối',
    description: 'Khách hàng từ chối yêu cầu',
    time: '--',
    state: 'pending',
  },
])

function statusBadgeClass(status: RentalStatus): string {
  const classes: Record<RentalStatus, string> = {
    Mới: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-50 dark:ring-blue-400/35',
    'Đã báo giá':
      'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-50 dark:ring-amber-400/35',
    'Đã chấp nhận':
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-50 dark:ring-emerald-400/35',
    'Từ chối':
      'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-50 dark:ring-rose-400/35',
  }

  return `inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${classes[status]}`
}

function timelineDotClass(state: TimelineState): string {
  const classes: Record<TimelineState, string> = {
    done: 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950',
    current:
      'bg-white text-amber-500 ring-4 ring-amber-100 border-4 border-amber-400 dark:bg-slate-950 dark:ring-amber-950',
    pending:
      'bg-card text-muted-foreground ring-4 ring-background border border-slate-300 dark:border-slate-700',
  }

  return `relative z-10 flex size-8 items-center justify-center rounded-full ${classes[state]}`
}

const InfoItem = defineComponent({
  props: {
    icon: {
      type: Object as () => LucideIcon,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () =>
      h('div', { class: 'flex min-w-0 gap-3' }, [
        h(props.icon, {
          class: props.compact
            ? 'mt-0.5 size-5 shrink-0 text-slate-700 dark:text-slate-200'
            : 'mt-0.5 size-5 shrink-0 text-slate-700 dark:text-slate-200',
        }),
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'text-sm text-muted-foreground' }, props.label),
          h(
            'p',
            { class: 'mt-1 whitespace-pre-line font-semibold leading-6 text-foreground' },
            props.value,
          ),
        ]),
      ])
  },
})

const RoutePoint = defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h('div', { class: 'flex min-w-0 gap-3' }, [
        h(
          'span',
          {
            class:
              'grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground',
          },
          [h(MapPin, { class: 'size-5' })],
        ),
        h('div', { class: 'min-w-0' }, [
          h('h3', { class: 'font-semibold text-foreground' }, props.title),
          h('p', { class: 'mt-1 text-sm text-muted-foreground' }, props.address),
        ]),
      ])
  },
})
</script>
