<template>
  <Dialog v-model:open="open"><DialogContent class="sm:max-w-2xl"><DialogHeader><DialogTitle>{{ isEdit ? 'Cập nhật xe' : 'Thêm xe' }}</DialogTitle><DialogDescription>Quản lý thông tin xe dùng chung cho các chuyến chạy.</DialogDescription></DialogHeader>
    <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
      <label class="field">Biển số <span>*</span><Input v-model.trim="form.license_plate" placeholder="15B-123.45" required /></label>
      <label class="field">Số chỗ <span>*</span><Input v-model.number="form.seat_count" min="1" max="999" type="number" required /></label>
      <label class="field">Nguồn xe <span>*</span><select v-model="form.ownership_type" class="control"><option :value="OwnershipTypeEnum.COMPANY">Xe công ty</option><option :value="OwnershipTypeEnum.INDIVIDUAL">Xe đối tác</option></select></label>
      <label class="field">Hãng/loại xe<Input v-model.trim="form.vehicle_model" placeholder="Ford Transit 16 chỗ" /></label>
      <label v-if="form.ownership_type === OwnershipTypeEnum.INDIVIDUAL" class="field sm:col-span-2">Đối tác chủ xe <span>*</span><select v-model.number="form.partner_id" class="control" required><option :value="null" disabled>Chọn đối tác</option><option v-for="partner in partnerOptionsQuery.data.value ?? []" :key="partner.id" :value="partner.id">{{ partner.name }}</option></select></label>
      <label class="field sm:col-span-2">Ghi chú<textarea v-model.trim="form.note" class="control min-h-24 py-2" /></label>
      <label v-if="isEdit && !row?.is_active" class="sm:col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2.5"><span><span class="font-medium">Kích hoạt lại xe</span><span class="mt-0.5 block text-sm text-muted-foreground">Xe sẽ xuất hiện lại trong danh sách chọn.</span></span><input v-model="form.is_active" type="checkbox" class="size-4 rounded border-input text-primary" /></label>
      <p v-if="errorMessage" class="sm:col-span-2 text-sm text-destructive">{{ errorMessage }}</p>
      <DialogFooter class="sm:col-span-2"><Button type="button" variant="outline" :disabled="pending" @click="open = false">Hủy</Button><Button type="submit" :disabled="pending">{{ pending ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Thêm mới' }}</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>
</template>

<script setup lang="ts">
import { useStoreVehicleMutation, useUpdateVehicleMutation } from '@/modules/master-data/vehicle/composables/useVehicleMutation'
import { usePartnerOptionsQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import { createVehicleSchema } from '@/modules/master-data/vehicle/schemas/create-vehicle.schema'
import { OwnershipTypeEnum, PartnerTypeEnum } from '@/modules/master-data/master-data.enum'
import type { Vehicle } from '@/modules/master-data/master-data.type'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{ isOpen: boolean; row?: Vehicle | null }>()
const emit = defineEmits<{ close: [] }>()
const createMutation = useStoreVehicleMutation()
const updateMutation = useUpdateVehicleMutation()
const partnerOptionsQuery = usePartnerOptionsQuery([PartnerTypeEnum.VEHICLE_OWNER, PartnerTypeEnum.TRANSPORT_COMPANY])
const errorMessage = ref('')
const form = reactive({ license_plate: '', seat_count: 16, vehicle_model: '', ownership_type: OwnershipTypeEnum.COMPANY, partner_id: null as number | null, note: '', is_active: false })
const isEdit = computed(() => Boolean(props.row))
const pending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const open = computed({ get: () => props.isOpen, set: (value: boolean) => { if (!value) emit('close') } })
watch([() => props.isOpen, () => props.row], ([isOpen]) => { if (!isOpen) return; errorMessage.value = ''; Object.assign(form, { license_plate: props.row?.license_plate ?? '', seat_count: props.row?.seat_count ?? 16, vehicle_model: props.row?.vehicle_model ?? '', ownership_type: props.row?.ownership_type ?? OwnershipTypeEnum.COMPANY, partner_id: props.row?.partner_id ?? null, note: props.row?.note ?? '', is_active: false }) }, { immediate: true })
watch(() => form.ownership_type, (type) => { if (type === OwnershipTypeEnum.COMPANY) form.partner_id = null })
async function submit() {
  errorMessage.value = ''
  const parsed = createVehicleSchema.safeParse({ ...form, vehicle_model: form.vehicle_model || null, note: form.note || null })
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
