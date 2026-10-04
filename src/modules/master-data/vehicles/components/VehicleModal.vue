<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật xe' : 'Thêm xe' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật thông tin và tình trạng xe.' : 'Nhập thông tin xe mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="license_plate">
          <FormItem>
            <FormLabel>Biển số xe</FormLabel>
            <FormControl>
              <Input placeholder="15B-123.45" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="vehicle_type_id">
          <FormItem>
            <FormLabel>Loại xe</FormLabel>
            <Select
              :model-value="value == null ? undefined : String(value)"
              :disabled="vehicleTypeOptionsQuery.isLoading.value"
              @update:model-value="handleChange(Number($event))"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="vehicleType in vehicleTypeOptionsQuery.data.value ?? []"
                  :key="vehicleType.id"
                  :value="String(vehicleType.id)"
                >
                  {{ vehicleType.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value }" name="ownership_type">
          <FormItem>
            <FormLabel>Loại sở hữu</FormLabel>
            <Select :model-value="value" @update:model-value="handleOwnershipChange">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn loại sở hữu" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="OwnershipTypeEnum.COMPANY">Công ty</SelectItem>
                <SelectItem :value="OwnershipTypeEnum.INDIVIDUAL">Đối tác</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-if="isPartnerOwned" v-slot="{ value, handleChange }" name="partner_id">
          <FormItem>
            <FormLabel>Đối tác</FormLabel>
            <Select
              :model-value="value == null ? undefined : String(value)"
              :disabled="partnerOptionsQuery.isLoading.value"
              @update:model-value="handleChange(Number($event))"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn đối tác" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="partner in partnerOptionsQuery.data.value ?? []"
                  :key="partner.id"
                  :value="String(partner.id)"
                >
                  {{ partner.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="vehicle_status">
          <FormItem :class="isPartnerOwned ? '' : 'sm:col-start-2'">
            <FormLabel>Trạng thái xe</FormLabel>
            <Select :model-value="value" @update:model-value="handleChange">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="VehicleStatusEnum.AVAILABLE">Sẵn sàng</SelectItem>
                <SelectItem :value="VehicleStatusEnum.ASSIGNED">Đã phân công</SelectItem>
                <SelectItem :value="VehicleStatusEnum.MAINTENANCE">Bảo dưỡng</SelectItem>
                <SelectItem :value="VehicleStatusEnum.INACTIVE">Ngừng hoạt động</SelectItem>
                <SelectItem :value="VehicleStatusEnum.OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="brand">
          <FormItem>
            <FormLabel>Hãng xe</FormLabel>
            <FormControl>
              <Input placeholder="Toyota" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="model">
          <FormItem>
            <FormLabel>Mẫu xe</FormLabel>
            <FormControl>
              <Input placeholder="Hiace" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="manufacture_year">
          <FormItem>
            <FormLabel>Năm sản xuất</FormLabel>
            <FormControl>
              <Input type="number" min="1886" max="9999" step="1" placeholder="2024" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="current_odometer">
          <FormItem>
            <FormLabel>Số km hiện tại</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="1" placeholder="0" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="notes">
          <FormItem class="sm:col-span-2">
            <FormLabel>Ghi chú</FormLabel>
            <FormControl>
              <Input placeholder="Ghi chú vận hành, bảo dưỡng hoặc đặc điểm xe" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-if="isEdit && !row?.is_active"
          v-slot="{ value, handleChange }"
          name="is_active"
        >
          <FormItem class="flex flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
            <div class="space-y-0.5">
              <FormLabel>Kích hoạt lại xe</FormLabel>
              <p class="text-sm text-muted-foreground">Xe sẽ có thể được dùng cho nghiệp vụ mới.</p>
            </div>
            <input
              type="checkbox"
              class="size-4 rounded border-input text-primary focus:ring-ring"
              :checked="Boolean(value)"
              @change="handleChange(($event.target as HTMLInputElement).checked)"
            />
          </FormItem>
        </FormField>

        <DialogFooter class="sm:col-span-2">
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
import { OwnershipTypeEnum, VehicleStatusEnum } from '@/modules/master-data/master-data.enum'
import type { Vehicle } from '@/modules/master-data/master-data.type'
import { usePartnerOptionsQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import { useVehicleTypeOptionsQuery } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
import {
  useStoreVehicleMutation,
  useUpdateVehicleMutation,
} from '@/modules/master-data/vehicles/composables/useVehicleMutation'
import { createVehicleSchema } from '@/modules/master-data/vehicles/schemas/create-vehicle.schema'
import { updateVehicleSchema } from '@/modules/master-data/vehicles/schemas/update-vehicle.schema'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'

const props = defineProps<{
  isOpen: boolean
  row?: Vehicle | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreVehicleMutation()
const updateMutation = useUpdateVehicleMutation()
const partnerOptionsQuery = usePartnerOptionsQuery()
const vehicleTypeOptionsQuery = useVehicleTypeOptionsQuery()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isPartnerOwned = computed(
  () => form.values.ownership_type === OwnershipTypeEnum.INDIVIDUAL,
)

const vehicleFieldKeys = [
  'license_plate',
  'vehicle_type_id',
  'ownership_type',
  'partner_id',
  'brand',
  'model',
  'manufacture_year',
  'current_odometer',
  'vehicle_status',
  'notes',
] as const

function getFormValues(vehicle?: Vehicle | null) {
  return {
    license_plate: vehicle?.license_plate ?? '',
    vehicle_type_id: vehicle?.vehicle_type_id ?? undefined,
    ownership_type: vehicle?.ownership_type ?? OwnershipTypeEnum.COMPANY,
    partner_id: vehicle?.partner_id ?? null,
    brand: vehicle?.brand ?? null,
    model: vehicle?.model ?? null,
    manufacture_year: vehicle?.manufacture_year ?? null,
    current_odometer: vehicle?.current_odometer ?? null,
    vehicle_status: vehicle?.vehicle_status ?? VehicleStatusEnum.AVAILABLE,
    notes: vehicle?.notes ?? null,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createVehicleSchema),
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

function handleOwnershipChange(value: unknown) {
  if (value !== OwnershipTypeEnum.COMPANY && value !== OwnershipTypeEnum.INDIVIDUAL) return

  form.setFieldValue('ownership_type', value)

  if (value === OwnershipTypeEnum.COMPANY) {
    form.setFieldValue('partner_id', null)
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const vehicleValues = createVehicleSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createVehicleSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of vehicleFieldKeys) {
        if (!Object.is(vehicleValues[key], currentValues[key])) {
          payload[key] = vehicleValues[key]
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
        data: updateVehicleSchema.parse(payload),
      })
      toast.success('Đã cập nhật xe')
    } else {
      await createMutation.mutateAsync(vehicleValues)
      toast.success('Đã thêm xe')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu xe')
  }
})
</script>
