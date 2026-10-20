<template>
  <section class="bg-card">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div>
        <h3 class="text-sm font-semibold">Giá tuyến</h3>
        <p class="mt-0.5 text-xs text-muted-foreground">
          {{ rates.length ? `${rates.length} mức giá theo loại xe` : 'Chưa có mức giá cho tuyến này.' }}
        </p>
      </div>
      <Button v-if="canManage" size="sm" @click="emit('create')">
        <Plus class="size-4" /> Thêm giá tuyến
      </Button>
    </header>

    <p v-if="isLoading" class="px-4 py-6 text-sm text-muted-foreground">Đang tải giá tuyến...</p>
    <p v-else-if="error" class="px-4 py-6 text-sm text-destructive">Không thể tải giá tuyến.</p>
    <p v-else-if="!rates.length" class="px-4 py-6 text-sm text-muted-foreground">
      Thêm mức giá theo loại xe để áp dụng cho tuyến này.
    </p>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-170 text-left text-sm">
        <thead class="bg-muted/35 text-xs text-muted-foreground">
          <tr>
            <th class="px-4 py-2.5 font-medium">Loại xe</th>
            <th class="px-4 py-2.5 text-right font-medium">Giá khách</th>
            <th class="px-4 py-2.5 text-right font-medium">Lương tài xế</th>
            <th class="px-4 py-2.5 font-medium">Hiệu lực từ</th>
            <th class="px-4 py-2.5 font-medium">Hiệu lực đến</th>
            <th class="px-4 py-2.5 font-medium">Trạng thái</th>
            <th v-if="canManage" class="w-24 px-4 py-2.5 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rate in rates" :key="rate.id" class="border-t border-border">
            <td class="px-4 py-3 font-medium">{{ rate.vehicle_type_name }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ formatMoney(rate.customer_price) }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ formatMoney(rate.driver_wage) }}</td>
            <td class="px-4 py-3 tabular-nums">{{ formatDate(rate.effective_from) }}</td>
            <td class="px-4 py-3 tabular-nums">{{ formatDate(rate.effective_to) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                :class="rate.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'"
              >
                {{ rate.is_active ? 'Đang áp dụng' : 'Ngừng áp dụng' }}
              </span>
            </td>
            <td v-if="canManage" class="px-4 py-2 text-right">
              <div class="inline-flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" :aria-label="`Sửa giá ${rate.vehicle_type_name}`" @click="emit('edit', rate)">
                  <PencilLine class="size-4" />
                </Button>
                <Button
                  v-if="rate.is_active"
                  variant="ghost"
                  size="icon-sm"
                  class="text-destructive hover:text-destructive"
                  :aria-label="`Ngừng áp dụng giá ${rate.vehicle_type_name}`"
                  @click="emit('deactivate', rate)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RouteRate } from '@/modules/master-data/master-data.type'
import { formatDate, formatMoney } from '@/modules/finance/finance.format'
import { Button } from '@/shared/components/ui/button'
import { PencilLine, Plus, Trash2 } from '@lucide/vue'

defineProps<{
  rates: RouteRate[]
  isLoading: boolean
  error?: unknown
  canManage: boolean
}>()

const emit = defineEmits<{
  create: []
  edit: [rate: RouteRate]
  deactivate: [rate: RouteRate]
}>()
</script>
