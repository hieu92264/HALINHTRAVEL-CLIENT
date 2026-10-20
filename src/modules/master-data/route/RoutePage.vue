<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Tuyến xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý điểm đón, điểm trả, ca vận hành và giờ chạy tiêu chuẩn.
        </p>
      </div>
    </header>

    <RouteTable
      :can-manage-rates="canManageRates"
      @create="openCreate"
      @edit="openEdit"
      @deactivate="routeToDeactivate = $event"
      @create-rate="openCreateRate"
      @edit-rate="openEditRate"
      @deactivate-rate="routeRateToDeactivate = $event"
    />

    <RouteModal :is-open="isModalOpen" :row="selectedRoute" @close="closeModal" />
    <RouteRateModal
      :is-open="isRouteRateModalOpen"
      :row="selectedRouteRate"
      :preset-route-id="routeForNewRate?.id"
      @close="closeRouteRateModal"
    />

    <AccessDialog
      :open="Boolean(routeToDeactivate)"
      title="Ngừng hoạt động tuyến xe"
      :description="`Tuyến «${routeToDeactivate?.name}» sẽ không còn được dùng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="routeToDeactivate = null"
      @confirm="deactivateRoute"
    />

    <AccessDialog
      :open="Boolean(routeRateToDeactivate)"
      title="Ngừng áp dụng giá tuyến"
      :description="`Giá ${routeRateToDeactivate?.vehicle_type_name} của tuyến «${routeRateToDeactivate?.route_name}» sẽ không còn áp dụng cho nghiệp vụ mới.`"
      confirm-label="Ngừng áp dụng"
      destructive
      :pending="deactivateRouteRateMutation.isPending.value"
      @close="routeRateToDeactivate = null"
      @confirm="deactivateRouteRate"
    />
  </section>
</template>

<script setup lang="ts">
import RouteModal from '@/modules/master-data/route/components/RouteModal.vue'
import RouteTable from '@/modules/master-data/route/components/RouteTable.vue'
import { useDeleteRouteMutation } from '@/modules/master-data/route/composables/useRouteMutation'
import RouteRateModal from '@/modules/master-data/route-rate/components/RouteRateModal.vue'
import { useDeleteRouteRateMutation } from '@/modules/master-data/route-rate/composables/useRouteRateMutation'
import { useAuthStore } from '@/modules/auth/auth.store'
import type { Route, RouteRate } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedRoute = ref<Route | null>(null)
const routeToDeactivate = ref<Route | null>(null)
const deactivateMutation = useDeleteRouteMutation()
const auth = useAuthStore()
const isRouteRateModalOpen = ref(false)
const selectedRouteRate = ref<RouteRate | null>(null)
const routeForNewRate = ref<Route | null>(null)
const routeRateToDeactivate = ref<RouteRate | null>(null)
const deactivateRouteRateMutation = useDeleteRouteRateMutation()
const canManageRates = computed(() => auth.user?.permissions.includes('route-rates.manage') ?? false)

function openCreate() {
  selectedRoute.value = null
  isModalOpen.value = true
}

function openEdit(route: Route) {
  selectedRoute.value = route
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedRoute.value = null
}

function openCreateRate(route: Route) {
  selectedRouteRate.value = null
  routeForNewRate.value = route
  isRouteRateModalOpen.value = true
}

function openEditRate(routeRate: RouteRate) {
  selectedRouteRate.value = routeRate
  routeForNewRate.value = null
  isRouteRateModalOpen.value = true
}

function closeRouteRateModal() {
  isRouteRateModalOpen.value = false
  selectedRouteRate.value = null
  routeForNewRate.value = null
}

async function deactivateRoute() {
  if (!routeToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(routeToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động tuyến xe')
    routeToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động tuyến xe')
  }
}

async function deactivateRouteRate() {
  if (!routeRateToDeactivate.value) return

  try {
    await deactivateRouteRateMutation.mutateAsync(routeRateToDeactivate.value.id)
    toast.success('Đã ngừng áp dụng giá tuyến')
    routeRateToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng áp dụng giá tuyến')
  }
}
</script>
