<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div class="min-w-0">
        <nav class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <RouterLink class="transition-colors hover:text-foreground" :to="{ name: 'quotations' }">
            Thuê xe
          </RouterLink>
          <ChevronRight class="size-4" />
          <RouterLink class="transition-colors hover:text-foreground" :to="{ name: 'quotations' }">
            Báo giá
          </RouterLink>
          <ChevronRight class="size-4" />
          <span class="font-medium text-foreground">{{ quotation.code }}</span>
        </nav>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {{ quotation.code }}
          </h1>
          <span :class="statusBadgeClass(quotation.status)">
            <CheckCircle2 class="size-4" />
            {{ quotation.status }}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant="outline" class="h-10 min-w-40">
          <Printer class="size-4" />
          In báo giá
        </Button>
        <Button class="h-10 min-w-44">
          <FileCheck2 class="size-4" />
          Tạo hợp đồng
        </Button>
      </div>
    </header>

    <div class="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <main class="rounded-lg border bg-card shadow-sm">
        <div class="p-5 sm:p-7">
          <div
            class="flex flex-col gap-5 border-b pb-5 lg:flex-row lg:items-start lg:justify-between"
          >
            <div>
              <h2 class="text-3xl font-extrabold tracking-tight text-primary">HÀ LINH TRAVEL</h2>
              <p class="mt-1 font-bold text-foreground">CÔNG TY TNHH VẬN TẢI DU LỊCH HÀ LINH</p>
              <p class="mt-2 text-sm text-muted-foreground">
                Số 123 Nguyễn Văn Cừ, Long Biên, Hà Nội
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                MST: 0101234567 <span class="mx-2">|</span> ĐT: 024 3939 6688
                <span class="mx-2">|</span> Email: info@halinhtravel.vn
              </p>
            </div>

            <dl class="grid gap-2 text-sm sm:min-w-60">
              <InfoRow label="Số báo giá" :value="quotation.code" strong />
              <InfoRow label="Ngày báo giá" :value="quotation.quotedAt" />
              <InfoRow label="Hiệu lực đến" :value="quotation.validUntil" />
            </dl>
          </div>

          <div class="py-7 text-center">
            <h2 class="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              BÁO GIÁ DỊCH VỤ VẬN CHUYỂN
            </h2>
            <p class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Công ty TNHH Vận tải Du lịch Hà Linh xin trân trọng gửi tới Quý khách hàng báo giá
              dịch vụ vận chuyển với các nội dung chi tiết như sau:
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <section class="overflow-hidden rounded-lg border">
              <h3 class="bg-sky-50 px-4 py-3 font-bold text-primary dark:bg-sky-950/30">
                Khách hàng
              </h3>
              <dl class="grid gap-2 p-4 text-sm">
                <InfoRow label="Tên khách hàng" :value="quotation.customer.name" />
                <InfoRow label="Người liên hệ" :value="quotation.customer.contact" />
                <InfoRow label="Số điện thoại" :value="quotation.customer.phone" />
                <InfoRow label="Email" :value="quotation.customer.email" />
                <InfoRow label="Địa chỉ" :value="quotation.customer.address" />
              </dl>
            </section>

            <section class="overflow-hidden rounded-lg border">
              <h3 class="bg-sky-50 px-4 py-3 font-bold text-primary dark:bg-sky-950/30">
                Yêu cầu liên kết
              </h3>
              <dl class="grid gap-2 p-4 text-sm">
                <InfoRow label="Mã yêu cầu" :value="quotation.request.code" link />
                <InfoRow label="Tuyến đường" :value="quotation.request.route" />
                <InfoRow label="Ngày đi" :value="quotation.request.departureDate" />
                <InfoRow label="Ngày về" :value="quotation.request.returnDate" />
                <InfoRow label="Số khách" :value="quotation.request.passengers" />
                <InfoRow label="Mục đích" :value="quotation.request.purpose" />
              </dl>
            </section>
          </div>

          <div class="mt-5 overflow-x-auto rounded-lg border">
            <table class="w-full min-w-[760px] border-collapse text-sm">
              <thead class="bg-sky-50 text-slate-700 dark:bg-sky-950/30 dark:text-slate-200">
                <tr>
                  <th class="w-14 border-r px-4 py-3 text-center">STT</th>
                  <th class="border-r px-4 py-3 text-left">Nội dung</th>
                  <th class="w-24 border-r px-4 py-3 text-center">Đơn vị</th>
                  <th class="w-24 border-r px-4 py-3 text-center">Số lượng</th>
                  <th class="w-40 border-r px-4 py-3 text-right">Đơn giá (đ)</th>
                  <th class="w-44 px-4 py-3 text-right">Thành tiền (đ)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in quotation.items" :key="item.name" class="border-t">
                  <td class="border-r px-4 py-3 text-center">{{ index + 1 }}</td>
                  <td class="border-r px-4 py-3 font-medium text-foreground">{{ item.name }}</td>
                  <td class="border-r px-4 py-3 text-center">{{ item.unit }}</td>
                  <td class="border-r px-4 py-3 text-center">{{ item.quantity }}</td>
                  <td class="border-r px-4 py-3 text-right">{{ item.price }}</td>
                  <td class="px-4 py-3 text-right font-semibold">{{ item.amount }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t bg-muted/30">
                <tr>
                  <td class="px-4 py-3" colspan="4" rowspan="3"></td>
                  <td class="border-x px-4 py-3 font-semibold">Tạm tính</td>
                  <td class="px-4 py-3 text-right font-bold">{{ quotation.subtotal }}</td>
                </tr>
                <tr class="border-t">
                  <td class="border-x px-4 py-3 font-semibold">Giảm giá</td>
                  <td class="px-4 py-3 text-right font-bold">{{ quotation.discount }}</td>
                </tr>
                <tr
                  class="border-t bg-sky-50 text-emerald-700 dark:bg-sky-950/30 dark:text-emerald-300"
                >
                  <td class="border-x px-4 py-4 text-lg font-extrabold">TỔNG CỘNG</td>
                  <td class="px-4 py-4 text-right text-xl font-extrabold">{{ quotation.total }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <section class="mt-5 overflow-hidden rounded-lg border">
            <div
              class="flex items-center gap-2 bg-sky-50 px-4 py-3 font-bold text-primary dark:bg-sky-950/30"
            >
              <WalletCards class="size-5" />
              Điều khoản thanh toán
            </div>
            <ol class="space-y-3 p-4 text-sm">
              <li v-for="(term, index) in quotation.paymentTerms" :key="term" class="flex gap-3">
                <span
                  class="grid size-7 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-bold text-primary"
                >
                  {{ index + 1 }}
                </span>
                <span class="pt-1 text-foreground">{{ term }}</span>
              </li>
            </ol>
          </section>
        </div>
      </main>

      <aside class="space-y-5">
        <section class="rounded-lg border bg-card shadow-sm">
          <div class="flex items-center gap-2 border-b px-5 py-4">
            <ClipboardList class="size-5 text-foreground" />
            <h2 class="font-bold text-foreground">Trạng thái xử lý</h2>
          </div>
          <ol
            class="relative space-y-7 p-5 before:absolute before:left-9 before:top-9 before:h-[calc(100%-72px)] before:w-px before:bg-border"
          >
            <li v-for="step in timeline" :key="step.title" class="relative flex gap-4">
              <span :class="timelineDotClass(step.state)">
                <Check v-if="step.state !== 'current'" class="size-4" />
              </span>
              <div>
                <h3
                  :class="
                    step.state === 'current'
                      ? 'font-bold text-emerald-700 dark:text-emerald-300'
                      : 'font-bold text-foreground'
                  "
                >
                  {{ step.title }}
                </h3>
                <p class="mt-1 text-sm text-muted-foreground">{{ step.time }}</p>
                <p class="mt-2 text-sm font-semibold text-foreground">{{ step.actor }}</p>
                <p class="mt-1 text-sm text-muted-foreground">{{ step.note }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="rounded-lg border bg-card p-5 shadow-sm">
          <div class="flex items-center gap-2">
            <Paperclip class="size-5 text-foreground" />
            <h2 class="font-bold text-foreground">Tệp đính kèm</h2>
          </div>
          <div class="mt-4 flex items-center gap-3 rounded-lg border p-3">
            <div
              class="grid size-11 shrink-0 place-items-center rounded bg-rose-100 text-xs font-extrabold text-rose-600"
            >
              PDF
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-primary">{{ quotation.attachment.name }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ quotation.attachment.size }} <span class="mx-1">•</span>
                {{ quotation.attachment.createdAt }}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Tải tệp báo giá">
              <Download class="size-4" />
            </Button>
          </div>
        </section>

        <section class="rounded-lg border bg-card p-5 shadow-sm">
          <div class="flex items-center gap-2">
            <FileText class="size-5 text-foreground" />
            <h2 class="font-bold text-foreground">Thông tin khác</h2>
          </div>
          <dl class="mt-4 grid gap-3 text-sm">
            <InfoRow label="Người tạo" :value="quotation.createdBy" />
            <InfoRow label="Ngày tạo" :value="quotation.createdAt" />
            <InfoRow label="Người duyệt" :value="quotation.approvedBy" />
            <InfoRow label="Ngày duyệt" :value="quotation.approvedAt" />
          </dl>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/shared/components/ui/button'
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FileCheck2,
  FileText,
  Paperclip,
  Printer,
  WalletCards,
} from '@lucide/vue'
import { computed, defineComponent, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type QuotationStatus = 'Đã duyệt' | 'Đã gửi' | 'Dự thảo'
type TimelineState = 'done' | 'current'

interface QuotationDetail {
  code: string
  status: QuotationStatus
  quotedAt: string
  validUntil: string
  customer: {
    name: string
    contact: string
    phone: string
    email: string
    address: string
  }
  request: {
    code: string
    route: string
    departureDate: string
    returnDate: string
    passengers: string
    purpose: string
  }
  items: {
    name: string
    unit: string
    quantity: number
    price: string
    amount: string
  }[]
  subtotal: string
  discount: string
  total: string
  paymentTerms: string[]
  attachment: {
    name: string
    size: string
    createdAt: string
  }
  createdBy: string
  createdAt: string
  approvedBy: string
  approvedAt: string
}

interface TimelineItem {
  title: string
  time: string
  actor: string
  note: string
  state: TimelineState
}

const quotations: QuotationDetail[] = [
  {
    code: 'BG-2026-0086',
    status: 'Đã duyệt',
    quotedAt: '18/10/2026',
    validUntil: '25/10/2026',
    customer: {
      name: 'Công ty Hải Phòng Xanh',
      contact: 'Nguyễn Thị Mai',
      phone: '0903 456 789',
      email: 'mai.nguyen@haiphongxanh.vn',
      address: 'Số 18 Trần Phú, Quận Ngô Quyền, Hải Phòng',
    },
    request: {
      code: 'YC-2026-0148',
      route: 'Hà Nội → Hạ Long',
      departureDate: '22/10/2026',
      returnDate: '22/10/2026',
      passengers: '40 khách',
      purpose: 'Du lịch, tham quan Hạ Long',
    },
    items: [
      {
        name: 'Thuê xe 45 chỗ tuyến Hà Nội → Hạ Long',
        unit: 'Xe',
        quantity: 1,
        price: '28.000.000',
        amount: '28.000.000',
      },
      {
        name: 'Phí cầu đường',
        unit: 'Gói',
        quantity: 1,
        price: '1.000.000',
        amount: '1.000.000',
      },
    ],
    subtotal: '29.000.000 đ',
    discount: '500.000 đ',
    total: '28.500.000 đ',
    paymentTerms: [
      'Thanh toán 50% giá trị hợp đồng (14.250.000đ) ngay sau khi ký kết.',
      'Thanh toán 50% còn lại (14.250.000đ) sau khi hoàn thành chương trình vận chuyển.',
    ],
    attachment: {
      name: 'bao-gia-BG-2026-0086.pdf',
      size: '1,2 MB',
      createdAt: '18/10/2026 08:46',
    },
    createdBy: 'Nguyễn Văn Tùng',
    createdAt: '17/10/2026 09:12',
    approvedBy: 'Trần Thị Hương',
    approvedAt: '18/10/2026 08:45',
  },
]

const route = useRoute()
const quotation = computed<QuotationDetail>(() => {
  const id = String(route.params.id ?? '')
  const fallback = quotations[0] as QuotationDetail

  return (
    quotations.find((item) => item.code === id) ?? {
      ...fallback,
      code: id || fallback.code,
      attachment: {
        ...fallback.attachment,
        name: `bao-gia-${id || fallback.code}.pdf`,
      },
    }
  )
})

const timeline = computed<TimelineItem[]>(() => [
  {
    title: 'Dự thảo',
    time: '17/10/2026 09:12',
    actor: 'Nguyễn Văn Tùng',
    note: 'Tạo báo giá',
    state: 'done',
  },
  {
    title: 'Đã gửi',
    time: '17/10/2026 14:30',
    actor: 'Nguyễn Văn Tùng',
    note: 'Gửi báo giá cho khách hàng',
    state: 'done',
  },
  {
    title: quotation.value.status,
    time: quotation.value.approvedAt,
    actor: quotation.value.approvedBy,
    note: 'Duyệt báo giá',
    state: 'current',
  },
])

function statusBadgeClass(status: QuotationStatus): string {
  const classes: Record<QuotationStatus, string> = {
    'Đã duyệt':
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-50 dark:ring-emerald-400/35',
    'Đã gửi':
      'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-50 dark:ring-amber-400/35',
    'Dự thảo':
      'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-50 dark:ring-slate-400/35',
  }

  return `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-inset ${classes[status]}`
}

function timelineDotClass(state: TimelineState): string {
  const classes: Record<TimelineState, string> = {
    done: 'bg-primary text-primary-foreground ring-4 ring-primary/10',
    current:
      'border-[6px] border-emerald-500 bg-card text-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950',
  }

  return `relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full ${classes[state]}`
}

const InfoRow = defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    strong: {
      type: Boolean,
      default: false,
    },
    link: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () =>
      h('div', { class: 'grid grid-cols-[120px_minmax(0,1fr)] gap-3' }, [
        h('dt', { class: 'text-muted-foreground' }, props.label),
        h('dd', { class: 'grid grid-cols-[8px_minmax(0,1fr)] gap-3 text-foreground' }, [
          h('span', { class: 'text-muted-foreground' }, ':'),
          h(
            'span',
            {
              class: [
                'min-w-0 whitespace-pre-line',
                props.strong ? 'font-bold' : 'font-medium',
                props.link ? 'text-primary' : '',
              ].join(' '),
            },
            props.value,
          ),
        ]),
      ])
  },
})
</script>
