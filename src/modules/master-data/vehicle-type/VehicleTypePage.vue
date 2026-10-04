<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Thông tin loại xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý số chỗ và tỷ lệ hoa hồng tài xế theo từng loại xe.
        </p>
      </div>
    </header>

    <VehicleTypeTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="vehicleTypeToDeactivate = $event"
    />

    <VehicleTypeModal :is-open="isModalOpen" :row="selectedVehicleType" @close="closeModal" />

    <AccessDialog
      :open="Boolean(vehicleTypeToDeactivate)"
      title="Ngừng hoạt động loại xe"
      :description="`Loại xe «${vehicleTypeToDeactivate?.name}» sẽ không còn được dùng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="vehicleTypeToDeactivate = null"
      @confirm="deactivateVehicleType"
    />
  </section>
</template>

<script setup lang="ts">
import VehicleTypeModal from '@/modules/master-data/vehicle-type/components/VehicleTypeModal.vue'
import VehicleTypeTable from '@/modules/master-data/vehicle-type/components/VehicleTypeTable.vue'
import { useDeleteVehicleTypeMutation } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeMutation'
import type { VehicleType } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedVehicleType = ref<VehicleType | null>(null)
const vehicleTypeToDeactivate = ref<VehicleType | null>(null)
const deactivateMutation = useDeleteVehicleTypeMutation()

function openCreate() {
  selectedVehicleType.value = null
  isModalOpen.value = true
}

function openEdit(vehicleType: VehicleType) {
  selectedVehicleType.value = vehicleType
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedVehicleType.value = null
}

async function deactivateVehicleType() {
  if (!vehicleTypeToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(vehicleTypeToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động loại xe')
    vehicleTypeToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động loại xe')
  }
}
</script>
