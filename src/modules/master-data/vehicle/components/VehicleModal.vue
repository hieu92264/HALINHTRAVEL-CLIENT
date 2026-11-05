<template>
  <Dialog v-model:open="open"><DialogContent class="sm:max-w-2xl"><DialogHeader><DialogTitle>{{ isEdit ? 'Cập nhật xe' : 'Thêm xe' }}</DialogTitle><DialogDescription>Quản lý thông tin xe dùng chung cho các chuyến chạy.</DialogDescription></DialogHeader>
    <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <label class="field">Biển số <span>*</span><Input v-model.trim="form.license_plate" placeholder="15B-123.45" required /></label>
      <label class="field">Mã loại xe <span>*</span><select v-model.number="form.vehicle_type_id" class="control" required><option :value="null" disabled>Chọn loại xe</option><option v-for="type in vehicleTypes.data.value ?? []" :key="type.id" :value="type.id">{{ type.code }} · {{ type.name }}</option></select></label>
      <label class="field">Tài xế mặc định <span>*</span><select v-model.number="form.default_driver_id" class="control" required><option :value="null" disabled>Chọn tài xế</option><option v-for="driver in drivers.data.value ?? []" :key="driver.id" :value="driver.id">{{ driver.full_name }}</option></select></label>
      <label class="field sm:col-span-2">Ghi chú<textarea v-model.trim="form.note" class="control min-h-24 py-2" /></label>
      <label v-if="isEdit && !row?.is_active" class="sm:col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2.5"><span><span class="font-medium">Kích hoạt lại xe</span><span class="mt-0.5 block text-sm text-muted-foreground">Xe sẽ xuất hiện lại trong danh sách chọn.</span></span><input v-model="form.is_active" type="checkbox" class="size-4 rounded border-input text-primary" /></label>
      <p v-if="errorMessage" class="sm:col-span-2 text-sm text-destructive">{{ errorMessage }}</p>
      <DialogFooter class="sm:col-span-2"><Button type="button" variant="outline" :disabled="pending" @click="open = false">Hủy</Button><Button type="submit" :disabled="pending">{{ pending ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Thêm mới' }}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>
</template>

<script setup lang="ts">
import { useStoreVehicleMutation, useUpdateVehicleMutation } from '@/modules/master-data/vehicle/composables/useVehicleMutation'
import { createVehicleSchema } from '@/modules/master-data/vehicle/schemas/create-vehicle.schema'
import type { Vehicle } from '@/modules/master-data/master-data.type'
import { VehicleTypeService } from '@/services/vehicle-type.service'
import { DriverService } from '@/services/driver.service'
import { useQuery } from '@tanstack/vue-query'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{ isOpen: boolean; row?: Vehicle | null }>()
const emit = defineEmits<{ close: [] }>()
const createMutation = useStoreVehicleMutation()
const updateMutation = useUpdateVehicleMutation()
const vehicleTypes = useQuery({ queryKey: ['vehicle-types'], queryFn: VehicleTypeService.getList })
const drivers = useQuery({ queryKey: ['company-drivers'], queryFn: DriverService.getDriverList })
const errorMessage = ref('')
const form = reactive({ license_plate: '', vehicle_type_id: null as number | null, default_driver_id: null as number | null, note: '', is_active: false })
const isEdit = computed(() => Boolean(props.row))
const pending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const open = computed({ get: () => props.isOpen, set: (value: boolean) => { if (!value) emit('close') } })
watch([() => props.isOpen, () => props.row], ([isOpen]) => { if (!isOpen) return; errorMessage.value = ''; Object.assign(form, { license_plate: props.row?.license_plate ?? '', vehicle_type_id: props.row?.vehicle_type_id ?? null, default_driver_id: props.row?.default_driver_id ?? null, note: props.row?.note ?? '', is_active: false }) }, { immediate: true })
async function submit() {
  errorMessage.value = ''
  const parsed = createVehicleSchema.safeParse({ ...form, note: form.note || null })
  if (!parsed.success) { errorMessage.value = parsed.error.issues[0]?.message ?? 'Thông tin xe không hợp lệ.'; return }
  try {
    if (props.row) await updateMutation.mutateAsync({ id: props.row.id, data: { ...parsed.data, is_active: form.is_active || undefined } })
    else await createMutation.mutateAsync(parsed.data)
    toast.success(props.row ? 'Đã cập nhật xe' : 'Đã thêm xe')
    open.value = false
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : 'Không thể lưu xe.' }
}
</script>

<style scoped>.field { display:block; font-size:.875rem; font-weight:500 }.field>span{color:var(--destructive)}.field>:is(input,select,textarea){display:block;margin-top:.375rem}.control{width:100%;height:2.5rem;border:1px solid var(--input);border-radius:.375rem;background:var(--background);color:var(--foreground);padding:0 .75rem;font-size:.875rem}textarea.control{height:auto}</style>
