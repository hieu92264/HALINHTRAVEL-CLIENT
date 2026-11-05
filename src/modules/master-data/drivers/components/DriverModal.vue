<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật tài xế' : 'Thêm tài xế công ty' }}</DialogTitle>
        <DialogDescription>Mã tài xế được tạo tự động. Tài xế thuê được nhập trực tiếp theo từng chuyến.</DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="full_name"><FormItem><FormLabel>Họ và tên</FormLabel><FormControl><Input v-bind="componentField" /></FormControl><FormMessage /></FormItem></FormField>
        <FormField v-slot="{ componentField }" name="phone"><FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><Input v-bind="componentField" /></FormControl><FormMessage /></FormItem></FormField>
        <FormField v-slot="{ componentField }" name="responsibility_allowance"><FormItem><FormLabel>Phụ cấp trách nhiệm</FormLabel><FormControl><Input type="number" min="0" step="0.01" v-bind="componentField" /></FormControl><FormMessage /></FormItem></FormField>
        <FormField v-slot="{ componentField }" name="joined_at"><FormItem><FormLabel>Ngày vào làm</FormLabel><FormControl><Input type="date" v-bind="componentField" /></FormControl><FormMessage /></FormItem></FormField>
        <FormField v-slot="{ componentField }" name="left_at"><FormItem><FormLabel>Ngày nghỉ việc</FormLabel><FormControl><Input type="date" v-bind="componentField" /></FormControl><FormMessage /></FormItem></FormField>
        <FormField v-if="isEdit && !row?.is_active" v-slot="{ value, handleChange }" name="is_active"><FormItem class="flex flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5 sm:col-span-2"><div><FormLabel>Kích hoạt lại tài xế</FormLabel><p class="text-sm text-muted-foreground">Tài xế sẽ có thể được dùng cho chuyến mới.</p></div><input type="checkbox" :checked="Boolean(value)" @change="handleChange(($event.target as HTMLInputElement).checked)" /></FormItem></FormField>
        <DialogFooter class="sm:col-span-2"><Button type="button" variant="outline" :disabled="isPending" @click="open = false">Hủy</Button><Button type="submit" :disabled="isPending">{{ isPending ? 'Đang xử lý...' : 'Lưu' }}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useStoreDriverMutation, useUpdateDriverMutation } from '@/modules/master-data/drivers/composables/useDriverMutation'
import { createDriverSchema } from '@/modules/master-data/drivers/schemas/create-driver.schema'
import { updateDriverSchema } from '@/modules/master-data/drivers/schemas/update-driver.schema'
import type { Driver } from '@/modules/master-data/master-data.type'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'

const props = defineProps<{ isOpen: boolean; row?: Driver | null }>()
const emit = defineEmits<{ close: [] }>()
const createMutation = useStoreDriverMutation()
const updateMutation = useUpdateDriverMutation()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const valuesFor = (driver?: Driver | null) => ({ full_name: driver?.full_name ?? '', phone: driver?.phone ?? null, responsibility_allowance: driver?.responsibility_allowance ?? 0, joined_at: driver?.joined_at ?? null, left_at: driver?.left_at ?? null, is_active: false })
const form = useForm({ validationSchema: toTypedSchema(createDriverSchema), initialValues: valuesFor() })
const open = computed({ get: () => props.isOpen, set: (value: boolean) => { if (!value) emit('close') } })
watch([() => props.isOpen, () => props.row], ([isOpen]) => { if (isOpen) form.resetForm({ values: valuesFor(props.row) }) }, { immediate: true })

const onSubmit = form.handleSubmit(async (values) => {
  try {
    if (!props.row) {
      await createMutation.mutateAsync(createDriverSchema.parse(values))
    } else {
      const current = valuesFor(props.row)
      const payload = Object.fromEntries(Object.entries(values).filter(([key, value]) => !Object.is(value, current[key as keyof typeof current])))
      if (!Object.keys(payload).length) return toast.info('Chưa có thay đổi để cập nhật')
      await updateMutation.mutateAsync({ id: props.row.id, data: updateDriverSchema.parse(payload) })
    }
    toast.success('Đã lưu tài xế')
    open.value = false
  } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể lưu tài xế') }
})
</script>
