<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Bảng giá tuyến xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý giá khách hàng và lương tài xế theo tuyến, loại xe và thời gian hiệu lực.
        </p>
      </div>
    </header>

    <RouteRateTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="routeRateToDeactivate = $event"
    />

    <RouteRateModal :is-open="isModalOpen" :row="selectedRouteRate" @close="closeModal" />

    <AccessDialog
      :open="Boolean(routeRateToDeactivate)"
      title="Ngừng hoạt động bảng giá tuyến"
      :description="`Bảng giá «${routeRateToDeactivate?.route_name} — ${routeRateToDeactivate?.vehicle_type_name}» sẽ không còn được áp dụng cho nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="routeRateToDeactivate = null"
      @confirm="deactivateRouteRate"
    />
  </section>
</template>

<script setup lang="ts">
import RouteRateModal from '@/modules/master-data/route-rate/components/RouteRateModal.vue'
import RouteRateTable from '@/modules/master-data/route-rate/components/RouteRateTable.vue'
import { useDeleteRouteRateMutation } from '@/modules/master-data/route-rate/composables/useRouteRateMutation'
import type { RouteRate } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedRouteRate = ref<RouteRate | null>(null)
const routeRateToDeactivate = ref<RouteRate | null>(null)
const deactivateMutation = useDeleteRouteRateMutation()

function openCreate() {
  selectedRouteRate.value = null
  isModalOpen.value = true
}

function openEdit(routeRate: RouteRate) {
  selectedRouteRate.value = routeRate
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedRouteRate.value = null
}

async function deactivateRouteRate() {
  if (!routeRateToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(routeRateToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động bảng giá tuyến')
    routeRateToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động bảng giá tuyến')
  }
}
</script>
