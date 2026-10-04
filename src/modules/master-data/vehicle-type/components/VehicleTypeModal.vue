<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật loại xe' : 'Thêm loại xe' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật thông tin loại xe.' : 'Nhập thông tin loại xe mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="code">
          <FormItem>
            <FormLabel>Mã loại xe</FormLabel>
            <FormControl>
              <Input placeholder="LIM-29" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Tên loại xe</FormLabel>
            <FormControl>
              <Input placeholder="Limousine 29 chỗ" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <FormField v-slot="{ componentField }" name="seats">
            <FormItem>
              <FormLabel>Số chỗ</FormLabel>
              <FormControl>
                <Input type="number" min="1" step="1" placeholder="29" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="tour_driver_commission_rate">
            <FormItem>
              <FormLabel>Hoa hồng tài xế tour (%)</FormLabel>
              <FormControl>
                <Input type="number" min="0" max="100" step="0.01" placeholder="0.00" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField
          v-if="isEdit && !row?.is_active"
          v-slot="{ value, handleChange }"
          name="is_active"
        >
          <FormItem class="flex flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div class="space-y-0.5">
              <FormLabel>Kích hoạt lại loại xe</FormLabel>
              <p class="text-sm text-muted-foreground">Loại xe sẽ có thể được dùng cho nghiệp vụ mới.</p>
            </div>
            <input
              type="checkbox"
              class="size-4 rounded border-input text-primary focus:ring-ring"
              :checked="Boolean(value)"
              @change="handleChange(($event.target as HTMLInputElement).checked)"
            />
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="isPending" @click="open = false">
            Hủy
          </Button>
          <Button type="submit" :disabled="isPending">
            {{ isPending ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  useStoreVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
} from '@/modules/master-data/vehicle-type/composables/useVehicleTypeMutation'
import { createVehicleTypeSchema } from '@/modules/master-data/vehicle-type/schemas/create-vehicle-type.schema'
import { updateVehicleTypeSchema } from '@/modules/master-data/vehicle-type/schemas/update-vehicle-type.schema'
import type { VehicleType } from '@/modules/master-data/master-data.type'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'

const props = defineProps<{
  isOpen: boolean
  row?: VehicleType | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreVehicleTypeMutation()
const updateMutation = useUpdateVehicleTypeMutation()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const vehicleTypeFieldKeys = [
  'code',
  'name',
  'seats',
  'tour_driver_commission_rate',
] as const

function getFormValues(vehicleType?: VehicleType | null) {
  return {
    code: vehicleType?.code ?? '',
    name: vehicleType?.name ?? '',
    seats: vehicleType?.seats ?? undefined,
    tour_driver_commission_rate: vehicleType?.tour_driver_commission_rate ?? 0,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createVehicleTypeSchema),
  initialValues: getFormValues(),
})

watch(
  [() => props.isOpen, () => props.row],
  ([isOpen]) => {
    if (isOpen) form.resetForm({ values: getFormValues(props.row) })
  },
  { immediate: true },
)

const open = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const vehicleTypeValues = createVehicleTypeSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createVehicleTypeSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of vehicleTypeFieldKeys) {
        if (!Object.is(vehicleTypeValues[key], currentValues[key])) {
          payload[key] = vehicleTypeValues[key]
        }
      }

      if (!props.row!.is_active && (form.values as { is_active?: boolean }).is_active === true) {
        payload.is_active = true
      }

      if (!Object.keys(payload).length) {
        toast.info('Chưa có thay đổi để cập nhật')
        return
      }

      await updateMutation.mutateAsync({
        id: props.row!.id,
        data: updateVehicleTypeSchema.parse(payload),
      })
      toast.success('Đã cập nhật loại xe')
    } else {
      await createMutation.mutateAsync(vehicleTypeValues)
      toast.success('Đã thêm loại xe')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu loại xe')
  }
})
</script>
