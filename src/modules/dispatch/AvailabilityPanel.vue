<template>
  <section class="rounded-lg border bg-card p-4">
    <div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-semibold">Năng lực tại thời điểm phân công</h2><p class="text-xs text-muted-foreground">Snapshot chỉ để tham khảo, không giữ xe hoặc tài xế.</p></div><Button size="sm" variant="outline" :disabled="check.isPending.value" @click="run">{{ check.isPending.value ? 'Đang kiểm tra...' : 'Kiểm tra availability' }}</Button></div>
    <div v-if="result" class="mt-3 rounded-md bg-muted/50 p-3 text-sm"><p :class="result.can_fulfill ? 'text-emerald-700' : 'text-destructive'">{{ result.can_fulfill ? 'Đủ năng lực tại thời điểm kiểm tra.' : 'Chưa đủ năng lực — hãy chọn lại tài nguyên.' }}</p><p class="mt-1 text-muted-foreground">Đã kiểm tra: {{ formatDispatchDate(result.checked_at) }} · Xe rảnh {{ result.vehicle_capacities[0]?.available_count ?? 0 }} · Tài xế rảnh {{ result.driver_capacity.available_count }}</p></div>
  </section>
</template>
<script setup lang="ts">
import { useAvailabilityCheckMutation } from '@/modules/rental/rental.composables'; import type { AvailabilityResult } from '@/modules/rental/rental.types'; import { formatDispatchDate } from '@/modules/dispatch/dispatch.format'; import { Button } from '@/shared/components/ui/button'; import { ref } from 'vue'; import { toast } from 'vue-sonner'
const props = defineProps<{ startAt: string; endAt: string; vehicleTypeId: number }>(); const check = useAvailabilityCheckMutation(); const result = ref<AvailabilityResult | null>(null)
async function run() { try { result.value = await check.mutateAsync({ start_at: props.startAt, end_at: props.endAt, items: [{ vehicle_type_id: props.vehicleTypeId, quantity: 1 }] }) } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể kiểm tra năng lực.') } }
</script>
