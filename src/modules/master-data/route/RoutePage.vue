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

    <RouteTable @create="openCreate" @edit="openEdit" @deactivate="routeToDeactivate = $event" />

    <RouteModal :is-open="isModalOpen" :row="selectedRoute" @close="closeModal" />

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
  </section>
</template>

<script setup lang="ts">
import RouteModal from '@/modules/master-data/route/components/RouteModal.vue'
import RouteTable from '@/modules/master-data/route/components/RouteTable.vue'
import { useDeleteRouteMutation } from '@/modules/master-data/route/composables/useRouteMutation'
import type { Route } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedRoute = ref<Route | null>(null)
const routeToDeactivate = ref<Route | null>(null)
const deactivateMutation = useDeleteRouteMutation()

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
</script>
