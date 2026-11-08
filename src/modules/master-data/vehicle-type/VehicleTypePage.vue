<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">Loại xe</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Sáu loại xe chuẩn dùng để cấu hình bảng giá tuyến và lương xe du lịch.
      </p>
    </header>

    <div
      v-if="typesQuery.isLoading.value"
      class="rounded-lg border border-border p-5 text-sm text-muted-foreground"
    >
      Đang tải danh mục loại xe…
    </div>
    <div
      v-else-if="typesQuery.error.value"
      class="rounded-lg border border-destructive/40 p-5 text-sm text-destructive"
    >
      Không tải được danh mục.
      <Button variant="link" class="h-auto p-0" @click="typesQuery.refetch()">Thử lại</Button>
    </div>
    <div v-else class="overflow-hidden rounded-lg border border-border">
      <table class="w-full text-sm">
        <thead class="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th class="px-4 py-3 font-medium">Mã</th>
            <th class="px-4 py-3 font-medium">Tên hiển thị</th>
            <th class="px-4 py-3 font-medium">Tỷ lệ lương du lịch (%)</th>
            <th class="px-4 py-3 font-medium">Trạng thái</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="type in typesQuery.data.value ?? []"
            :key="type.id"
            class="border-t border-border"
          >
            <td class="px-4 py-3 font-medium">{{ type.code }}</td>
            <td class="px-4 py-3">
              <Input v-model="draftFor(type).name" :disabled="!canManage" />
            </td>
            <td class="px-4 py-3">
              <div class="relative">
                <Input
                  v-model.number="draftFor(type).tourism_wage_percent"
                  class="pr-8"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  :disabled="!canManage"
                /><span
                  class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground"
                  >%</span
                >
              </div>
            </td>
            <td class="px-4 py-3">{{ type.is_active ? 'Đang dùng' : 'Ngừng dùng' }}</td>
            <td class="px-4 py-3 text-right">
              <Button
                v-if="canManage"
                size="sm"
                :disabled="saveMutation.isPending.value"
                @click="save(type)"
                >Lưu</Button
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-muted-foreground">
      Nhập 10 tương ứng 10%. Mã loại xe là cố định để không làm sai dữ liệu tuyến và chuyến.
    </p>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import type { VehicleType } from '@/modules/master-data/master-data.type'
import { VehicleTypeService } from '@/services/vehicle-type.service'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  decimalRateToPercent,
  isValidTourismWagePercent,
  percentToDecimalRate,
} from './tourism-wage-rate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, watch } from 'vue'
import { toast } from 'vue-sonner'

const auth = useAuthStore()
const canManage = computed(() => auth.user?.permissions.includes('vehicles.manage') ?? false)
const typesQuery = useQuery({ queryKey: ['vehicle-types'], queryFn: VehicleTypeService.getList })
const queryClient = useQueryClient()
const drafts = reactive<Record<number, { name: string; tourism_wage_percent: number }>>({})
const saveMutation = useMutation({
  mutationFn: ({
    id,
    data,
  }: {
    id: number
    data: Pick<VehicleType, 'name' | 'tourism_wage_rate' | 'is_active'>
  }) => VehicleTypeService.update(id, data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicle-types'] }),
})

watch(
  () => typesQuery.data.value,
  (types) => {
    for (const type of types ?? [])
      drafts[type.id] = {
        name: type.name,
        tourism_wage_percent: decimalRateToPercent(type.tourism_wage_rate),
      }
  },
  { immediate: true },
)

async function save(type: VehicleType) {
  const draft = draftFor(type)
  if (!draft || !draft.name.trim() || !isValidTourismWagePercent(draft.tourism_wage_percent))
    return toast.error('Tên và tỷ lệ lương phải hợp lệ (0–100%).')
  try {
    await saveMutation.mutateAsync({
      id: type.id,
      data: {
        name: draft.name.trim(),
        tourism_wage_rate: percentToDecimalRate(draft.tourism_wage_percent),
        is_active: type.is_active ?? true,
      },
    })
    toast.success(`Đã lưu ${type.code}`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu loại xe')
  }
}

function draftFor(type: VehicleType) {
  return (
    drafts[type.id] ??
    (drafts[type.id] = {
      name: type.name,
      tourism_wage_percent: decimalRateToPercent(type.tourism_wage_rate),
    })
  )
}
</script>
