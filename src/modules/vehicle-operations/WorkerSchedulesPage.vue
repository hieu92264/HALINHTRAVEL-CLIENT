<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold">Lịch xe công nhân</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Quy tắc chạy dài hạn; hệ thống sinh sẵn xe chạy trong cửa sổ 90 ngày.
      </p>
    </header>
    <div class="overflow-hidden rounded-lg border border-border bg-card">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th class="p-3">Khách hàng / tuyến</th>
            <th class="p-3">Ca</th>
            <th class="p-3">Biển số</th>
            <th class="p-3">Ngày chạy</th>
            <th class="p-3 text-right">Đã sinh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in schedules" :key="schedule.id" class="border-t border-border">
            <td class="p-3">
              <div>{{ schedule.customer_name }}</div>
              <div class="text-muted-foreground">{{ schedule.route_name }}</div>
            </td>
            <td class="p-3">{{ schedule.shift_name }}</td>
            <td class="p-3 font-medium">{{ schedule.license_plate }}</td>
            <td class="p-3">
              {{ schedule.days.map((day) => `${day.weekday} · ${day.pickup_time}`).join(', ') }}
            </td>
            <td class="p-3 text-right tabular-nums">{{ schedule.runs_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<script setup lang="ts">
import {
  VehicleOperationsService,
  type WorkerSchedule,
} from '@/services/vehicle-operations.service'
import { onMounted, ref } from 'vue'
const schedules = ref<WorkerSchedule[]>([])
onMounted(async () => {
  schedules.value = await VehicleOperationsService.schedules()
})
</script>
