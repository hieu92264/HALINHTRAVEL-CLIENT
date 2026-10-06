<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Báo giá</h1>
        <p class="mt-1 text-base text-muted-foreground">Lập, gửi và theo dõi báo giá thuê xe</p>
      </div>

      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText class="size-4 text-primary" />
        <span>{{ quotations.length }} báo giá</span>
      </div>
    </header>

    <div class="rounded-lg border bg-card p-4 shadow-sm">
      <div
        class="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_minmax(170px,0.95fr)_minmax(170px,0.95fr)_minmax(230px,1.25fr)_auto]"
      >
        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-foreground">Khách hàng</label>
          <Select v-model="filters.customer">
            <SelectTrigger class="h-10 w-full bg-background">
              <SelectValue placeholder="Tất cả khách hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khách hàng</SelectItem>
              <SelectItem v-for="customer in customerOptions" :key="customer" :value="customer">
                {{ customer }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-foreground">Mã yêu cầu thuê</label>
          <Input
            v-model="filters.requestCode"
            class="h-10 bg-background"
            placeholder="Nhập mã yêu cầu..."
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-foreground">Trạng thái</label>
          <Select v-model="filters.status">
            <SelectTrigger class="h-10 w-full bg-background">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-foreground">Hiệu lực đến</label>
          <button
            type="button"
            class="flex h-10 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm text-muted-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <CalendarDays class="size-4 shrink-0" />
            <span class="truncate">Từ ngày</span>
            <ArrowRight class="size-4 shrink-0 opacity-60" />
            <span class="truncate">Đến ngày</span>
          </button>
        </div>

        <div class="flex items-end">
          <Button class="h-10 w-full min-w-36" @click="goToCreateQuotation">
            <Plus class="size-4" />
            Tạo báo giá
          </Button>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div class="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-xl font-bold tracking-tight text-foreground">Danh sách báo giá</h2>
        <p class="text-sm text-muted-foreground">
          Hiển thị 1 - {{ filteredQuotations.length }} của {{ quotations.length }} bản ghi
        </p>
      </div>

      <div class="hidden overflow-x-auto xl:block">
        <table
          class="w-full min-w-[1040px] table-fixed border-collapse text-sm [&_td:not(:last-child)]:border-r [&_td:not(:last-child)]:border-border [&_th:not(:last-child)]:border-r [&_th:not(:last-child)]:border-border"
        >
          <thead class="bg-muted/70 text-left text-xs font-semibold text-muted-foreground">
            <tr>
              <th class="w-[13%] px-4 py-3">Mã báo giá</th>
              <th class="w-[26%] px-4 py-3">Khách hàng</th>
              <th class="w-[13%] px-4 py-3">Yêu cầu thuê</th>
              <th class="w-[12%] px-4 py-3">Ngày báo giá</th>
              <th class="w-[12%] px-4 py-3">Hiệu lực đến</th>
              <th class="w-[12%] px-4 py-3">Tổng tiền</th>
              <th class="w-[12%] px-4 py-3">Trạng thái</th>
              <th class="w-14 px-4 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="quotation in filteredQuotations"
              :key="quotation.code"
              class="bg-card transition-colors hover:bg-muted/35"
            >
              <td class="px-4 py-3 font-semibold text-blue-600">{{ quotation.code }}</td>
              <td class="truncate px-4 py-3 font-medium text-foreground">
                {{ quotation.customer }}
              </td>
              <td class="px-4 py-3 font-semibold text-blue-600">{{ quotation.requestCode }}</td>
              <td class="px-4 py-3 text-foreground">{{ quotation.quotedAt }}</td>
              <td class="px-4 py-3 text-foreground">{{ quotation.validUntil }}</td>
              <td class="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                {{ quotation.total }}
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <span :class="statusBadgeClass(quotation.status)">
                  <component :is="statusIcon(quotation.status)" class="size-3.5" />
                  {{ quotation.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" aria-label="Thao tác báo giá">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="goToQuotationDetail(quotation.code)">
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem>Gửi báo giá</DropdownMenuItem>
                    <DropdownMenuItem>Nhân bản</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="divide-y xl:hidden">
        <article
          v-for="quotation in filteredQuotations"
          :key="quotation.code"
          class="space-y-4 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-blue-600">{{ quotation.code }}</p>
              <p class="mt-1 text-sm font-medium text-foreground">{{ quotation.customer }}</p>
            </div>
            <span :class="statusBadgeClass(quotation.status)">
              <component :is="statusIcon(quotation.status)" class="size-3.5" />
              {{ quotation.status }}
            </span>
          </div>

          <div class="grid gap-3 rounded-lg bg-muted/45 p-3 text-sm sm:grid-cols-2">
            <div>
              <p class="text-muted-foreground">Yêu cầu thuê</p>
              <p class="mt-1 font-semibold text-blue-600">{{ quotation.requestCode }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Tổng tiền</p>
              <p class="mt-1 font-semibold text-foreground">{{ quotation.total }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Ngày báo giá</p>
              <p class="mt-1 font-medium text-foreground">{{ quotation.quotedAt }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Hiệu lực đến</p>
              <p class="mt-1 font-medium text-foreground">{{ quotation.validUntil }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" size="sm" @click="goToQuotationDetail(quotation.code)">
              Xem
            </Button>
            <Button variant="outline" size="sm">Gửi</Button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Plus,
  Send,
  XCircle,
  Clipboard,
} from '@lucide/vue'
import type { Component } from 'vue'
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

type QuotationStatus = 'Đã gửi' | 'Dự thảo' | 'Đã duyệt' | 'Từ chối'

interface Quotation {
  code: string
  customer: string
  requestCode: string
  quotedAt: string
  validUntil: string
  total: string
  status: QuotationStatus
}

const filters = reactive({
  customer: 'all',
  requestCode: '',
  status: 'all',
})
const router = useRouter()

const quotations: Quotation[] = [
  {
    code: 'BG-2026-0086',
    customer: 'Công ty Hải Phòng Xanh',
    requestCode: 'YC-2026-0148',
    quotedAt: '18/10/2026',
    validUntil: '25/10/2026',
    total: '28.500.000 đ',
    status: 'Đã gửi',
  },
  {
    code: 'BG-2026-0085',
    customer: 'Trường THPT Lê Quý Đôn',
    requestCode: 'YC-2026-0146',
    quotedAt: '17/10/2026',
    validUntil: '24/10/2026',
    total: '42.000.000 đ',
    status: 'Dự thảo',
  },
  {
    code: 'BG-2026-0084',
    customer: 'Công ty CP Minh Phát',
    requestCode: 'YC-2026-0145',
    quotedAt: '16/10/2026',
    validUntil: '23/10/2026',
    total: '35.700.000 đ',
    status: 'Đã duyệt',
  },
  {
    code: 'BG-2026-0083',
    customer: 'Công ty Du lịch Biển Việt',
    requestCode: 'YC-2026-0143',
    quotedAt: '15/10/2026',
    validUntil: '22/10/2026',
    total: '18.000.000 đ',
    status: 'Từ chối',
  },
  {
    code: 'BG-2026-0082',
    customer: 'Trường THCS Ngô Quyền',
    requestCode: 'YC-2026-0141',
    quotedAt: '14/10/2026',
    validUntil: '21/10/2026',
    total: '24.500.000 đ',
    status: 'Đã gửi',
  },
  {
    code: 'BG-2026-0081',
    customer: 'Công ty TNHH Sao Mai',
    requestCode: 'YC-2026-0140',
    quotedAt: '13/10/2026',
    validUntil: '20/10/2026',
    total: '31.800.000 đ',
    status: 'Dự thảo',
  },
  {
    code: 'BG-2026-0080',
    customer: 'Công ty CP Xây dựng Thăng Long',
    requestCode: 'YC-2026-0138',
    quotedAt: '12/10/2026',
    validUntil: '19/10/2026',
    total: '27.000.000 đ',
    status: 'Đã duyệt',
  },
  {
    code: 'BG-2026-0079',
    customer: 'Trường Đại học Bách Khoa Hà Nội',
    requestCode: 'YC-2026-0136',
    quotedAt: '11/10/2026',
    validUntil: '18/10/2026',
    total: '56.000.000 đ',
    status: 'Đã gửi',
  },
  {
    code: 'BG-2026-0078',
    customer: 'Công ty TNHH An Phú',
    requestCode: 'YC-2026-0135',
    quotedAt: '10/10/2026',
    validUntil: '17/10/2026',
    total: '12.500.000 đ',
    status: 'Từ chối',
  },
  {
    code: 'BG-2026-0077',
    customer: 'Công ty Du lịch Hạ Long Xanh',
    requestCode: 'YC-2026-0133',
    quotedAt: '09/10/2026',
    validUntil: '16/10/2026',
    total: '45.000.000 đ',
    status: 'Dự thảo',
  },
]

const statusOptions: QuotationStatus[] = ['Đã gửi', 'Dự thảo', 'Đã duyệt', 'Từ chối']
const customerOptions = [...new Set(quotations.map((quotation) => quotation.customer))]

const filteredQuotations = computed(() => {
  const requestCode = filters.requestCode.trim().toLowerCase()

  return quotations.filter((quotation) => {
    const matchesCustomer = filters.customer === 'all' || quotation.customer === filters.customer
    const matchesStatus = filters.status === 'all' || quotation.status === filters.status
    const matchesRequestCode =
      !requestCode || quotation.requestCode.toLowerCase().includes(requestCode)

    return matchesCustomer && matchesStatus && matchesRequestCode
  })
})

function statusBadgeClass(status: QuotationStatus): string {
  const classes: Record<QuotationStatus, string> = {
    'Đã gửi':
      'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-50 dark:ring-amber-400/35',
    'Dự thảo':
      'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-50 dark:ring-slate-400/35',
    'Đã duyệt':
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-50 dark:ring-emerald-400/35',
    'Từ chối':
      'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-50 dark:ring-rose-400/35',
  }

  return `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes[status]}`
}

function goToQuotationDetail(id: string) {
  void router.push({ name: 'quotations-detail', params: { id } })
}

function goToCreateQuotation() {
  void router.push({ name: 'quotations-create' })
}

function statusIcon(status: QuotationStatus): Component {
  const icons: Record<QuotationStatus, Component> = {
    'Đã gửi': Send,
    'Dự thảo': Clipboard,
    'Đã duyệt': CheckCircle2,
    'Từ chối': XCircle,
  }

  return icons[status]
}
</script>
