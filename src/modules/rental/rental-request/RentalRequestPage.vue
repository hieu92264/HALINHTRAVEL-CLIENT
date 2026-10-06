<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Yêu cầu thuê xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">Theo dõi và xử lý yêu cầu thuê xe</p>
      </div>

      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <ClipboardList class="size-4 text-primary" />
        <span>{{ filteredRequests.length }} yêu cầu</span>
      </div>
    </header>

    <div class="rounded-lg border bg-card p-4 shadow-sm">
      <div
        class="grid gap-3 lg:grid-cols-[minmax(220px,1.3fr)_170px_180px_180px_minmax(240px,1.35fr)_auto]"
      >
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Tìm kiếm khách hàng</label>
          <div class="relative">
            <Search
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="filters.keyword"
              class="h-10 pl-9"
              placeholder="Nhập tên khách hàng..."
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Trạng thái</label>
          <Select v-model="filters.status">
            <SelectTrigger class="h-10 w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Dịch vụ</label>
          <Select v-model="filters.service">
            <SelectTrigger class="h-10 w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem v-for="service in serviceOptions" :key="service" :value="service">
                {{ service }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Nguồn yêu cầu</label>
          <Select v-model="filters.source">
            <SelectTrigger class="h-10 w-full">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem v-for="source in sourceOptions" :key="source" :value="source">
                {{ source }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Thời gian yêu cầu</label>
          <button
            type="button"
            class="flex h-10 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm text-foreground shadow-xs transition-colors hover:bg-muted"
          >
            <CalendarDays class="size-4 shrink-0 text-muted-foreground" />
            <span class="min-w-0 flex-1 truncate">Từ ngày 01/10/2026</span>
            <span class="text-muted-foreground">-</span>
            <span class="truncate">31/10/2026</span>
          </button>
        </div>

        <div class="flex items-end">
          <Button class="h-10 w-full min-w-36" @click="goToCreateRequest">
            <Plus class="size-4" />
            Tạo yêu cầu
          </Button>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div class="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-foreground">Danh sách yêu cầu</h2>
          <p class="mt-1 text-sm text-muted-foreground sm:hidden">
            Hiển thị {{ filteredRequests.length }} trong tổng số {{ rentalRequests.length }} yêu cầu
          </p>
        </div>

        <div class="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
          <span
            >Hiển thị 1 - {{ filteredRequests.length }} trong tổng số
            {{ rentalRequests.length }} yêu cầu</span
          >
          <Select v-model="pageSize">
            <SelectTrigger class="h-9 w-20 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="hidden overflow-x-auto xl:block">
        <table class="w-full min-w-[1120px] border-collapse text-sm">
          <thead
            class="bg-muted/70 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <tr>
              <th class="w-32 px-5 py-3">Mã yêu cầu</th>
              <th class="w-56 px-5 py-3">Khách hàng</th>
              <th class="w-48 px-5 py-3">Dịch vụ</th>
              <th class="w-64 px-5 py-3">Tuyến đi</th>
              <th class="w-40 px-5 py-3">Thời gian</th>
              <th class="w-24 px-5 py-3">Số xe</th>
              <th class="w-40 px-5 py-3">Trạng thái</th>
              <th class="w-36 px-5 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
              class="bg-card transition-colors hover:bg-muted/35"
            >
              <td class="px-5 py-3 font-medium text-foreground">{{ request.id }}</td>
              <td class="px-5 py-3 text-foreground">{{ request.customer }}</td>
              <td class="px-5 py-3">
                <span :class="serviceBadgeClass(request.service)">
                  {{ request.service }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="min-w-56">
                  <div class="flex items-center justify-between gap-2 font-medium text-foreground">
                    <span>{{ request.from }}</span>
                    <span class="h-px flex-1 bg-border" />
                    <span>{{ request.to }}</span>
                  </div>
                  <div class="relative mt-2 flex items-center justify-between">
                    <span
                      class="size-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-950"
                    />
                    <span
                      class="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-blue-200 dark:bg-blue-900"
                    />
                    <span
                      class="relative size-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-950"
                    />
                  </div>
                  <div class="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{{ request.departure }}</span>
                    <span>{{ request.arrival }}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-foreground">
                <div>{{ request.date }}</div>
                <div class="mt-1 text-muted-foreground">
                  {{ request.departure }} - {{ request.arrival }}
                </div>
              </td>
              <td class="px-5 py-3 text-foreground">{{ request.vehicles }} xe</td>
              <td class="px-5 py-3">
                <span :class="statusBadgeClass(request.status)">
                  {{ request.status }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Xem chi tiết"
                    @click="goToRequestDetail(request.id)"
                  >
                    <Eye class="size-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" aria-label="Chỉnh sửa">
                    <Pencil class="size-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="outline" size="icon-sm" aria-label="Thêm thao tác">
                        <MoreHorizontal class="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Gửi báo giá</DropdownMenuItem>
                      <DropdownMenuItem>Nhân bản yêu cầu</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">Từ chối yêu cầu</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="divide-y xl:hidden">
        <article v-for="request in filteredRequests" :key="request.id" class="space-y-4 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-foreground">{{ request.id }}</p>
              <p class="mt-1 text-sm text-muted-foreground">{{ request.customer }}</p>
            </div>
            <span :class="statusBadgeClass(request.status)">{{ request.status }}</span>
          </div>

          <div class="flex flex-wrap gap-2">
            <span :class="serviceBadgeClass(request.service)">{{ request.service }}</span>
            <span
              class="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              <Car class="size-3.5" />
              {{ request.vehicles }} xe
            </span>
          </div>

          <div class="grid gap-3 rounded-lg bg-muted/50 p-3 text-sm sm:grid-cols-2">
            <div class="flex gap-2">
              <Route class="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p class="font-medium text-foreground">{{ request.from }} - {{ request.to }}</p>
                <p class="mt-0.5 text-muted-foreground">
                  {{ request.departure }} - {{ request.arrival }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <Clock class="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p class="font-medium text-foreground">{{ request.date }}</p>
                <p class="mt-0.5 text-muted-foreground">{{ request.source }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline" size="sm" @click="goToRequestDetail(request.id)">
              <Eye class="size-4" />
              Xem
            </Button>
            <Button variant="outline" size="sm">
              <Pencil class="size-4" />
              Sửa
            </Button>
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
  CalendarDays,
  Car,
  ClipboardList,
  Clock,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Route,
  Search,
} from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

type RentalStatus = 'Mới' | 'Đã báo giá' | 'Đã chấp nhận' | 'Từ chối'
type RentalService =
  'Tour du lịch' | 'Đưa đón học sinh' | 'Thuê xe theo hợp đồng' | 'Đưa đón công nhân'
type RentalSource = 'Website' | 'Hotline' | 'Zalo' | 'Khách quen'

interface RentalRequest {
  id: string
  customer: string
  service: RentalService
  source: RentalSource
  from: string
  to: string
  date: string
  departure: string
  arrival: string
  vehicles: number
  status: RentalStatus
}

const filters = reactive({
  keyword: '',
  status: 'all',
  service: 'all',
  source: 'all',
})

const pageSize = ref('10')
const router = useRouter()

const rentalRequests: RentalRequest[] = [
  {
    id: 'YC-2026-0148',
    customer: 'Công ty Hải Phòng Xanh',
    service: 'Tour du lịch',
    source: 'Website',
    from: 'Hải Phòng',
    to: 'Hạ Long',
    date: '12/10/2026',
    departure: '06:30',
    arrival: '09:30',
    vehicles: 2,
    status: 'Mới',
  },
  {
    id: 'YC-2026-0147',
    customer: 'Trường THPT Ngô Quyền',
    service: 'Đưa đón học sinh',
    source: 'Hotline',
    from: 'Hải Phòng',
    to: 'Hà Nội',
    date: '15/10/2026',
    departure: '07:00',
    arrival: '09:00',
    vehicles: 3,
    status: 'Đã báo giá',
  },
  {
    id: 'YC-2026-0146',
    customer: 'Công ty Minh Phát',
    service: 'Tour du lịch',
    source: 'Zalo',
    from: 'Hà Nội',
    to: 'Sapa',
    date: '20/10/2026',
    departure: '06:00',
    arrival: '12:00',
    vehicles: 1,
    status: 'Đã chấp nhận',
  },
  {
    id: 'YC-2026-0145',
    customer: 'Công ty Thành Đạt',
    service: 'Thuê xe theo hợp đồng',
    source: 'Khách quen',
    from: 'Hải Phòng',
    to: 'Ninh Bình',
    date: '18/10/2026',
    departure: '08:00',
    arrival: '10:30',
    vehicles: 2,
    status: 'Từ chối',
  },
  {
    id: 'YC-2026-0144',
    customer: 'Trường THCS Lê Lợi',
    service: 'Đưa đón học sinh',
    source: 'Website',
    from: 'Hải Phòng',
    to: 'Cát Bà',
    date: '22/10/2026',
    departure: '07:00',
    arrival: '09:30',
    vehicles: 3,
    status: 'Mới',
  },
  {
    id: 'YC-2026-0143',
    customer: 'Công ty Du lịch An Bình',
    service: 'Tour du lịch',
    source: 'Hotline',
    from: 'Hải Phòng',
    to: 'Mộc Châu',
    date: '25/10/2026',
    departure: '06:30',
    arrival: '13:30',
    vehicles: 2,
    status: 'Đã báo giá',
  },
  {
    id: 'YC-2026-0142',
    customer: 'Công ty Hòa Phát',
    service: 'Đưa đón công nhân',
    source: 'Zalo',
    from: 'Hải Phòng',
    to: 'KCN Tràng Duệ',
    date: '16/10/2026',
    departure: '06:00',
    arrival: '06:45',
    vehicles: 1,
    status: 'Đã chấp nhận',
  },
  {
    id: 'YC-2026-0141',
    customer: 'Trường Tiểu học Đằng Hải',
    service: 'Đưa đón học sinh',
    source: 'Khách quen',
    from: 'Hải Phòng',
    to: 'Đồ Sơn',
    date: '19/10/2026',
    departure: '08:00',
    arrival: '10:00',
    vehicles: 2,
    status: 'Mới',
  },
  {
    id: 'YC-2026-0140',
    customer: 'Công ty Vạn Lợi',
    service: 'Tour du lịch',
    source: 'Website',
    from: 'Hải Phòng',
    to: 'Tam Đảo',
    date: '24/10/2026',
    departure: '06:00',
    arrival: '11:00',
    vehicles: 2,
    status: 'Đã báo giá',
  },
  {
    id: 'YC-2026-0139',
    customer: 'Câu lạc bộ Doanh nhân HP',
    service: 'Thuê xe theo hợp đồng',
    source: 'Hotline',
    from: 'Hải Phòng',
    to: 'Hạ Long',
    date: '28/10/2026',
    departure: '08:00',
    arrival: '11:00',
    vehicles: 3,
    status: 'Đã chấp nhận',
  },
]

const statusOptions: RentalStatus[] = ['Mới', 'Đã báo giá', 'Đã chấp nhận', 'Từ chối']
const serviceOptions: RentalService[] = [
  'Tour du lịch',
  'Đưa đón học sinh',
  'Thuê xe theo hợp đồng',
  'Đưa đón công nhân',
]
const sourceOptions: RentalSource[] = ['Website', 'Hotline', 'Zalo', 'Khách quen']

const filteredRequests = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  return rentalRequests.filter((request) => {
    const matchesKeyword =
      !keyword ||
      request.customer.toLowerCase().includes(keyword) ||
      request.id.toLowerCase().includes(keyword)
    const matchesStatus = filters.status === 'all' || request.status === filters.status
    const matchesService = filters.service === 'all' || request.service === filters.service
    const matchesSource = filters.source === 'all' || request.source === filters.source

    return matchesKeyword && matchesStatus && matchesService && matchesSource
  })
})

function goToCreateRequest() {
  void router.push({ name: 'rental-requests-create' })
}

function goToRequestDetail(id: string) {
  void router.push({ name: 'rental-requests-detail', params: { id } })
}

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

  return `inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes[status]}`
}

function serviceBadgeClass(service: RentalService): string {
  const classes: Record<RentalService, string> = {
    'Tour du lịch':
      'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-50 dark:ring-sky-400/35',
    'Đưa đón học sinh':
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-50 dark:ring-emerald-400/35',
    'Thuê xe theo hợp đồng':
      'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-50 dark:ring-violet-400/35',
    'Đưa đón công nhân':
      'bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/20 dark:text-green-50 dark:ring-green-400/35',
  }

  return `inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes[service]}`
}
</script>
