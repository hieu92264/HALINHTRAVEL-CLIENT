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
          <span class="font-medium text-foreground">Tạo báo giá</span>
        </nav>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <h1 class="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Tạo báo giá
          </h1>
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-500/20 dark:text-slate-50 dark:ring-slate-400/35"
          >
            Dự thảo
          </span>
        </div>
      </div>

      <Button variant="ghost" size="icon" aria-label="Đóng" @click="goBack">
        <X class="size-5" />
      </Button>
    </header>

    <form class="rounded-lg border bg-card shadow-sm" @submit.prevent="saveDraft">
      <div class="space-y-8 p-4 sm:p-6 xl:p-8">
        <section class="space-y-4">
          <h2 class="text-xl font-bold tracking-tight text-foreground">Thông tin chung</h2>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-foreground">
                Khách hàng <span class="text-destructive">*</span>
              </span>
              <Select v-model="form.customer">
                <SelectTrigger class="h-11 w-full bg-background">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Công ty Hải Phòng Xanh">Công ty Hải Phòng Xanh</SelectItem>
                  <SelectItem value="Trường THPT Lê Quý Đôn">Trường THPT Lê Quý Đôn</SelectItem>
                  <SelectItem value="Công ty CP Minh Phát">Công ty CP Minh Phát</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-foreground">
                Yêu cầu thuê <span class="text-destructive">*</span>
              </span>
              <Select v-model="form.requestCode">
                <SelectTrigger class="h-11 w-full bg-background">
                  <SelectValue placeholder="Chọn yêu cầu thuê" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YC-2026-0148">YC-2026-0148</SelectItem>
                  <SelectItem value="YC-2026-0146">YC-2026-0146</SelectItem>
                  <SelectItem value="YC-2026-0145">YC-2026-0145</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-foreground">
                Ngày báo giá <span class="text-destructive">*</span>
              </span>
              <Input v-model="form.quotedAt" class="h-11 bg-background" type="date" />
            </label>

            <label class="space-y-1.5">
              <span class="text-sm font-semibold text-foreground">
                Hiệu lực đến <span class="text-destructive">*</span>
              </span>
              <Input v-model="form.validUntil" class="h-11 bg-background" type="date" />
            </label>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-xl font-bold tracking-tight text-foreground">Hạng mục báo giá</h2>
            <Button type="button" variant="outline" class="h-10 w-full sm:w-auto" @click="addItem">
              <Plus class="size-4" />
              Thêm hạng mục
            </Button>
          </div>

          <div class="hidden overflow-x-auto rounded-lg border lg:block">
            <table class="w-full min-w-[860px] table-fixed border-collapse text-sm">
              <thead class="bg-muted/70 text-left text-xs font-semibold text-muted-foreground">
                <tr>
                  <th class="w-16 border-r px-4 py-3 text-center">STT</th>
                  <th class="border-r px-4 py-3">Nội dung</th>
                  <th class="w-32 border-r px-4 py-3 text-center">Số lượng</th>
                  <th class="w-48 border-r px-4 py-3 text-right">Đơn giá (đ)</th>
                  <th class="w-48 border-r px-4 py-3 text-right">Thành tiền (đ)</th>
                  <th class="w-16 px-4 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in items" :key="item.id" class="border-t bg-card">
                  <td class="border-r px-4 py-3 text-center font-medium">{{ index + 1 }}</td>
                  <td class="border-r px-4 py-3">
                    <Input v-model="item.name" class="h-10 bg-background" />
                  </td>
                  <td class="border-r px-4 py-3">
                    <Input
                      v-model.number="item.quantity"
                      class="h-10 bg-background text-center"
                      min="1"
                      type="number"
                    />
                  </td>
                  <td class="border-r px-4 py-3">
                    <Input
                      v-model.number="item.price"
                      class="h-10 bg-background text-right"
                      min="0"
                      type="number"
                    />
                  </td>
                  <td class="border-r px-4 py-3 text-right font-semibold">
                    {{ formatCurrency(item.quantity * item.price) }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Xóa hạng mục"
                      @click="removeItem(item.id)"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 lg:hidden">
            <article v-for="(item, index) in items" :key="item.id" class="rounded-lg border p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="font-semibold text-foreground">Hạng mục {{ index + 1 }}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Xóa hạng mục"
                  @click="removeItem(item.id)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="space-y-1.5 sm:col-span-2">
                  <span class="text-sm font-semibold text-foreground">Nội dung</span>
                  <Input v-model="item.name" class="h-10 bg-background" />
                </label>
                <label class="space-y-1.5">
                  <span class="text-sm font-semibold text-foreground">Số lượng</span>
                  <Input
                    v-model.number="item.quantity"
                    class="h-10 bg-background"
                    min="1"
                    type="number"
                  />
                </label>
                <label class="space-y-1.5">
                  <span class="text-sm font-semibold text-foreground">Đơn giá (đ)</span>
                  <Input
                    v-model.number="item.price"
                    class="h-10 bg-background"
                    min="0"
                    type="number"
                  />
                </label>
              </div>

              <div class="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span class="text-sm font-medium text-muted-foreground">Thành tiền</span>
                <span class="font-bold text-foreground">
                  {{ formatCurrency(item.quantity * item.price) }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section class="w-full space-y-4">
          <h2 class="text-xl font-bold tracking-tight text-foreground">Tổng tiền</h2>

          <div class="grid gap-3 xl:grid-cols-[minmax(180px,1fr)_minmax(260px,1.15fr)_minmax(280px,1.2fr)]">
            <div class="flex min-h-16 items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm">
              <span class="font-medium text-muted-foreground">Tạm tính</span>
              <span class="font-bold text-foreground">{{ formatCurrency(subtotal) }}</span>
            </div>

            <label
              class="grid min-h-16 items-center gap-2 rounded-lg border px-4 py-3 text-sm sm:grid-cols-[auto_minmax(160px,1fr)]"
            >
              <span class="font-medium text-muted-foreground">Giảm giá</span>
              <div class="relative">
                <Input
                  v-model.number="form.discount"
                  class="h-11 bg-background pr-10 text-right"
                  min="0"
                  type="number"
                />
                <span
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                >
                  đ
                </span>
              </div>
            </label>

            <div
              class="flex min-h-16 items-center justify-between gap-4 rounded-lg bg-sky-50 px-4 py-3 text-primary dark:bg-sky-950/30"
            >
              <span class="text-lg font-extrabold">Tổng tiền</span>
              <span class="text-2xl font-extrabold">{{ formatCurrency(total) }}</span>
            </div>
          </div>
        </section>
      </div>

      <div class="flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:p-6">
        <Button type="button" variant="outline" class="h-11 min-w-32" @click="goBack">Hủy</Button>
        <Button type="submit" class="h-11 min-w-40">Lưu nháp</Button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ChevronRight, Plus, Trash2, X } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

interface QuotationItem {
  id: number
  name: string
  quantity: number
  price: number
}

const router = useRouter()
const nextItemId = ref(2)

const form = reactive({
  customer: 'Công ty Hải Phòng Xanh',
  requestCode: 'YC-2026-0148',
  quotedAt: '2026-10-18',
  validUntil: '2026-10-25',
  discount: 500000,
})

const items = ref<QuotationItem[]>([
  {
    id: 1,
    name: 'Thuê xe 45 chỗ tuyến Hà Nội - Hạ Long',
    quantity: 2,
    price: 13500000,
  },
])

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
)

const total = computed(() => Math.max(subtotal.value - Number(form.discount || 0), 0))

function addItem() {
  items.value.push({
    id: nextItemId.value,
    name: '',
    quantity: 1,
    price: 0,
  })
  nextItemId.value += 1
}

function removeItem(id: number) {
  if (items.value.length === 1) return
  items.value = items.value.filter((item) => item.id !== id)
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function goBack() {
  void router.push({ name: 'quotations' })
}

function saveDraft() {
  void router.push({ name: 'quotations' })
}
</script>
