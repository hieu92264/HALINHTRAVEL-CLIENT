<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Danh sách xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý xe, loại sở hữu, tình trạng và chỉ số công tơ mét.
        </p>
      </div>
    </header>

    <VehicleTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="vehicleToDeactivate = $event"
    />

    <VehicleModal :is-open="isModalOpen" :row="selectedVehicle" @close="closeModal" />

    <AccessDialog
      :open="Boolean(vehicleToDeactivate)"
      title="Ngừng hoạt động xe"
      :description="`Xe «${vehicleToDeactivate?.license_plate}» sẽ không còn được sử dụng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="vehicleToDeactivate = null"
      @confirm="deactivateVehicle"
    />
  </section>
</template>

<script setup lang="ts">
import VehicleModal from '@/modules/master-data/vehicles/components/VehicleModal.vue'
import VehicleTable from '@/modules/master-data/vehicles/components/VehicleTable.vue'
import { useDeleteVehicleMutation } from '@/modules/master-data/vehicles/composables/useVehicleMutation'
import type { Vehicle } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedVehicle = ref<Vehicle | null>(null)
const vehicleToDeactivate = ref<Vehicle | null>(null)
const deactivateMutation = useDeleteVehicleMutation()

function openCreate() {
  selectedVehicle.value = null
  isModalOpen.value = true
}

function openEdit(vehicle: Vehicle) {
  selectedVehicle.value = vehicle
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedVehicle.value = null
}

async function deactivateVehicle() {
  if (!vehicleToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(vehicleToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động xe')
    vehicleToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động xe')
  }
}
</script>
