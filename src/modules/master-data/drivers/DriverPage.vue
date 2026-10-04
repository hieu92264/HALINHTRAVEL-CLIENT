<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Tài xế</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý hồ sơ, bằng lái, lương và loại sở hữu của tài xế.
        </p>
      </div>
    </header>

    <DriverTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="driverToDeactivate = $event"
    />

    <DriverModal :is-open="isModalOpen" :row="selectedDriver" @close="closeModal" />

    <AccessDialog
      :open="Boolean(driverToDeactivate)"
      title="Ngừng hoạt động tài xế"
      :description="`Tài xế «${driverToDeactivate?.full_name}» sẽ không còn được dùng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="driverToDeactivate = null"
      @confirm="deactivateDriver"
    />
  </section>
</template>

<script setup lang="ts">
import DriverModal from '@/modules/master-data/drivers/components/DriverModal.vue'
import DriverTable from '@/modules/master-data/drivers/components/DriverTable.vue'
import { useDeleteDriverMutation } from '@/modules/master-data/drivers/composables/useDriverMutation'
import type { Driver } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedDriver = ref<Driver | null>(null)
const driverToDeactivate = ref<Driver | null>(null)
const deactivateMutation = useDeleteDriverMutation()

function openCreate() {
  selectedDriver.value = null
  isModalOpen.value = true
}

function openEdit(driver: Driver) {
  selectedDriver.value = driver
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedDriver.value = null
}

async function deactivateDriver() {
  if (!driverToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(driverToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động tài xế')
    driverToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động tài xế')
  }
}
</script>
