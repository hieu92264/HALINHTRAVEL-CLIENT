<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Theo dõi chuyến chạy, biển số, tài xế và cước đã chốt.
      </p>
    </header>
    <div class="overflow-hidden rounded-lg border border-border bg-card">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th class="p-3">Mã chạy</th>
            <th class="p-3">Ngày giờ</th>
            <th class="p-3">Xe / lái xe</th>
            <th class="p-3">Hành trình</th>
            <th class="p-3 text-right">Cước</th>
            <th class="p-3">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="run in runs" :key="run.id" class="border-t border-border">
            <td class="p-3 font-medium">{{ run.run_no }}</td>
            <td class="p-3">{{ run.run_date }} · {{ run.pickup_time }}</td>
            <td class="p-3">
              <div class="font-medium">{{ run.license_plate }}</div>
              <div class="text-muted-foreground">{{ run.driver_name || 'Chưa có lái xe' }}</div>
            </td>
            <td class="p-3">{{ run.route_name || run.journey || '—' }}</td>
            <td class="p-3 text-right tabular-nums">{{ currency(run.freight_amount) }}</td>
            <td class="p-3">{{ label(run.status) }}</td>
          </tr>
          <tr v-if="!runs.length">
            <td class="p-8 text-center text-muted-foreground" colspan="6">Chưa có xe chạy.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<script setup lang="ts">
import { VehicleOperationsService, type VehicleRun } from '@/services/vehicle-operations.service'
import { computed, onMounted, ref } from 'vue'
const props = defineProps<{ kind: 'worker' | 'tourist' }>()
const runs = ref<VehicleRun[]>([])
const title = computed(() => (props.kind === 'worker' ? 'Xe chạy công nhân' : 'Xe chạy du lịch'))
const currency = (amount: string) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(amount))
const label = (status: string) =>
  ({ planned: 'Kế hoạch', in_progress: 'Đang chạy', completed: 'Hoàn tất', cancelled: 'Đã hủy' })[
    status
  ] ?? status
onMounted(async () => {
  runs.value = await VehicleOperationsService.runs(props.kind)
})
</script>
