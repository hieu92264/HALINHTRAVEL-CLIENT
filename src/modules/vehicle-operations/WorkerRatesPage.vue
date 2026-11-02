<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold">Bảng giá xe công nhân</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Cước và lương được chốt theo tuyến, biển số và thời hạn hiệu lực.
      </p>
    </header>
    <div class="overflow-hidden rounded-lg border border-border bg-card">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th class="p-3">Tuyến</th>
            <th class="p-3">Biển số</th>
            <th class="p-3 text-right">Cước</th>
            <th class="p-3 text-right">Lương lái</th>
            <th class="p-3">Hiệu lực</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rate in rates" :key="rate.id" class="border-t border-border">
            <td class="p-3">{{ rate.route_name }}</td>
            <td class="p-3 font-medium">{{ rate.license_plate }}</td>
            <td class="p-3 text-right tabular-nums">{{ rate.freight_amount }}</td>
            <td class="p-3 text-right tabular-nums">{{ rate.driver_wage }}</td>
            <td class="p-3">
              {{ rate.effective_from }} — {{ rate.effective_to || 'Không thời hạn' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<script setup lang="ts">
import { VehicleOperationsService, type WorkerRate } from '@/services/vehicle-operations.service'
import { onMounted, ref } from 'vue'
const rates = ref<WorkerRate[]>([])
onMounted(async () => {
  rates.value = await VehicleOperationsService.rates()
})
</script>
