<template><section class="space-y-5"><header><h1 class="text-2xl font-semibold tracking-tight text-foreground">Xe</h1><p class="mt-1 text-sm text-muted-foreground">Quản lý danh mục xe dùng chung cho điều hành chuyến.</p></header><VehicleTable @create="openCreate" @edit="openEdit" @deactivate="vehicleToDeactivate = $event" /><VehicleModal :is-open="modalOpen" :row="selectedVehicle" @close="closeModal" /><AccessDialog :open="Boolean(vehicleToDeactivate)" title="Ngừng hoạt động xe" :description="`Xe «${vehicleToDeactivate?.license_plate}» sẽ không còn được dùng cho nghiệp vụ mới.`" confirm-label="Ngừng hoạt động" destructive :pending="deleteMutation.isPending.value" @close="vehicleToDeactivate = null" @confirm="deactivate" /></section></template>

<script setup lang="ts">
import VehicleTable from './components/VehicleTable.vue'
import VehicleModal from './components/VehicleModal.vue'
import { useDeleteVehicleMutation } from './composables/useVehicleMutation'
import type { Vehicle } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const modalOpen = ref(false)
const selectedVehicle = ref<Vehicle | null>(null)
const vehicleToDeactivate = ref<Vehicle | null>(null)
const deleteMutation = useDeleteVehicleMutation()
function openCreate() { selectedVehicle.value = null; modalOpen.value = true }
function openEdit(vehicle: Vehicle) { selectedVehicle.value = vehicle; modalOpen.value = true }
function closeModal() { modalOpen.value = false; selectedVehicle.value = null }
async function deactivate() { if (!vehicleToDeactivate.value) return; try { await deleteMutation.mutateAsync(vehicleToDeactivate.value.id); toast.success('Đã ngừng hoạt động xe'); vehicleToDeactivate.value = null } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động xe') } }
</script>
