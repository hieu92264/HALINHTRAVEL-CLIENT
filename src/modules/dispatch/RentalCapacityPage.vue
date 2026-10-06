<script setup lang="ts">
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleAlertIcon,
  MinusIcon,
  PlusIcon,
  SearchCheckIcon,
  UserRoundIcon,
  XIcon,
} from '@lucide/vue'
import { computed, ref } from 'vue'

type CapacityItem = { id: number; vehicleType: string; quantity: number }

const startDate = ref('2026-10-20')
const startTime = ref('06:00')
const endDate = ref('2026-10-20')
const endTime = ref('18:00')
const ownership = ref('Tất cả nguồn xe')
const partner = ref('Tất cả đối tác')
const isChecked = ref(false)
const items = ref<CapacityItem[]>([
  { id: 1, vehicleType: '29 chỗ', quantity: 2 },
  { id: 2, vehicleType: '45 chỗ', quantity: 1 },
])
const nextId = ref(3)

const totalNeeded = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))
const canFulfill = computed(() => totalNeeded.value <= 4)

function addItem(): void {
  items.value.push({ id: nextId.value++, vehicleType: '16 chỗ', quantity: 1 })
}

function removeItem(id: number): void {
  if (items.value.length > 1) items.value = items.value.filter((item) => item.id !== id)
}

function checkCapacity(): void {
  isChecked.value = true
}
</script>

<template>
  <section class="mx-auto max-w-[1320px] space-y-5">
    <header
      class="flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <div class="flex items-center gap-2 text-sm font-medium text-primary">
          <SearchCheckIcon class="size-4" /> Điều hành / Kiểm tra năng lực
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-foreground">Kiểm tra năng lực</h1>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Kiểm tra nhanh xe và tài xế có thể phục vụ trước khi gửi báo giá hoặc lập hợp đồng.
        </p>
      </div>
      <span
        class="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300"
        ><AlertTriangleIcon class="size-3.5" />Snapshot không giữ tài nguyên</span
      >
    </header>

    <article class="rounded-xl border border-border bg-card">
      <div class="border-b border-border px-5 py-4">
        <h2 class="font-bold text-foreground">Thời gian và nhu cầu xe</h2>
        <p class="mt-1 text-xs text-muted-foreground">
          Chỉ bật kiểm tra khi có thời điểm bắt đầu, kết thúc và ít nhất một loại xe.
        </p>
      </div>
      <div class="space-y-5 p-5">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="space-y-1.5 text-sm font-medium"
            >Bắt đầu <span class="text-destructive">*</span
            ><span class="flex gap-2"
              ><input
                v-model="startDate"
                class="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                type="date" /><input
                v-model="startTime"
                class="h-10 w-24 rounded-lg border border-input bg-background px-3 text-sm"
                type="time" /></span
          ></label>
          <label class="space-y-1.5 text-sm font-medium"
            >Kết thúc <span class="text-destructive">*</span
            ><span class="flex gap-2"
              ><input
                v-model="endDate"
                class="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                type="date" /><input
                v-model="endTime"
                class="h-10 w-24 rounded-lg border border-input bg-background px-3 text-sm"
                type="time" /></span
          ></label>
          <label class="space-y-1.5 text-sm font-medium"
            >Nguồn xe<button
              class="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm font-normal"
              type="button"
            >
              {{ ownership }}<ChevronDownIcon class="size-4 text-muted-foreground" /></button
          ></label>
          <label class="space-y-1.5 text-sm font-medium"
            >Đối tác<button
              class="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm font-normal"
              type="button"
            >
              {{ partner }}<ChevronDownIcon class="size-4 text-muted-foreground" /></button
          ></label>
        </div>
        <div>
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-sm font-bold">Loại xe yêu cầu</h3>
            <button
              class="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              type="button"
              @click="addItem"
            >
              <PlusIcon class="size-4" />Thêm loại xe
            </button>
          </div>
          <div class="overflow-hidden rounded-lg border border-border">
            <div
              v-for="item in items"
              :key="item.id"
              class="grid items-center gap-3 border-b border-border p-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_132px_40px]"
            >
              <button
                class="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm"
                type="button"
              >
                {{ item.vehicleType
                }}<ChevronDownIcon class="size-4 text-muted-foreground" /></button
              ><span class="flex h-9 items-center overflow-hidden rounded-md border border-input"
                ><button
                  class="px-2 text-muted-foreground hover:bg-muted"
                  type="button"
                  @click="item.quantity = Math.max(1, item.quantity - 1)"
                >
                  <MinusIcon class="size-3.5" /></button
                ><input
                  v-model.number="item.quantity"
                  class="min-w-0 flex-1 text-center text-sm font-semibold tabular-nums outline-none"
                  min="1"
                  type="number" /><button
                  class="px-2 text-muted-foreground hover:bg-muted"
                  type="button"
                  @click="item.quantity++"
                >
                  <PlusIcon class="size-3.5" /></button></span
              ><button
                class="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                :disabled="items.length === 1"
                type="button"
                @click="removeItem(item.id)"
              >
                <XIcon class="size-4" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-end border-t border-border pt-4">
          <button
            class="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            type="button"
            @click="checkCapacity"
          >
            <SearchCheckIcon class="size-4" />Kiểm tra năng lực
          </button>
        </div>
      </div>
    </article>

    <section v-if="isChecked" class="space-y-4" aria-live="polite">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">Kết quả năng lực</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Snapshot lúc 09:15 · {{ startDate }} {{ startTime }} đến {{ endDate }} {{ endTime }}
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
          :class="canFulfill ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'"
          ><CheckCircle2Icon v-if="canFulfill" class="size-4" /><CircleAlertIcon
            v-else
            class="size-4"
          />{{ canFulfill ? 'Có thể đáp ứng' : 'Chưa đủ nguồn lực' }}</span
        >
      </div>
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article class="overflow-hidden rounded-xl border border-border bg-card">
          <table class="w-full text-left text-sm">
            <thead class="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th class="px-4 py-3">Loại xe</th>
                <th class="px-4 py-3 text-center">Cần</th>
                <th class="px-4 py-3 text-center">Công ty</th>
                <th class="px-4 py-3 text-center">Đối tác</th>
                <th class="px-4 py-3 text-center">Khả dụng</th>
                <th class="px-4 py-3">Kết quả</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" class="border-t border-border">
                <td class="px-4 py-3 font-semibold">{{ item.vehicleType }}</td>
                <td class="px-4 py-3 text-center font-semibold tabular-nums">
                  {{ item.quantity }}
                </td>
                <td class="px-4 py-3 text-center tabular-nums">
                  {{ item.vehicleType === '45 chỗ' ? 1 : 3 }}
                </td>
                <td class="px-4 py-3 text-center tabular-nums">1</td>
                <td class="px-4 py-3 text-center font-semibold tabular-nums">
                  {{ item.vehicleType === '45 chỗ' ? 2 : 4 }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success"
                    >Đủ xe</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </article>
        <aside class="rounded-xl border border-border bg-card p-5">
          <div class="flex items-center gap-2">
            <span class="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"
              ><UserRoundIcon class="size-5"
            /></span>
            <div>
              <h3 class="font-bold">Năng lực tài xế</h3>
              <p class="text-xs text-muted-foreground">Theo tổng số xe cần</p>
            </div>
          </div>
          <dl class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between">
              <dt class="text-muted-foreground">Tài xế cần</dt>
              <dd class="font-bold tabular-nums">{{ totalNeeded }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-muted-foreground">Tài xế công ty</dt>
              <dd class="font-bold tabular-nums">4</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-muted-foreground">Tài xế đối tác</dt>
              <dd class="font-bold tabular-nums">1</dd>
            </div>
            <div class="flex justify-between border-t border-border pt-3">
              <dt class="font-medium">Có thể phân công</dt>
              <dd class="font-bold text-success">Có</dd>
            </div>
          </dl>
        </aside>
      </div>
      <div
        class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-200"
      >
        <CalendarClockIcon class="mt-0.5 size-4 shrink-0" />Kết quả này chỉ là snapshot. Hãy kiểm
        tra lại ngay trước khi gửi báo giá, tạo hợp đồng hoặc phân công chuyến.
      </div>
    </section>
  </section>
</template>
