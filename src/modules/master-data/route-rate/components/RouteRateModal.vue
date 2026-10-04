<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật bảng giá tuyến' : 'Thêm bảng giá tuyến' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật giá và thời gian hiệu lực.' : 'Nhập giá khách hàng và lương tài xế theo tuyến.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <FormField v-slot="{ value, handleChange }" name="route_id">
          <FormItem>
            <FormLabel>Tuyến xe</FormLabel>
            <Select
              :model-value="value == null ? undefined : String(value)"
              :disabled="routesQuery.isLoading.value"
              @update:model-value="handleChange(Number($event))"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn tuyến xe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem v-for="route in routesQuery.data.value ?? []" :key="route.id" :value="String(route.id)">
                  {{ route.name }}
                </SelectItem>
              </SelectContent>
            </Select>
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

        <FormField v-slot="{ componentField }" name="customer_price">
          <FormItem>
            <FormLabel>Giá khách hàng</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="0" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="driver_wage">
          <FormItem>
            <FormLabel>Lương tài xế</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="0" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="effective_from">
          <FormItem>
            <FormLabel>Ngày bắt đầu hiệu lực</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="effective_to">
          <FormItem>
            <FormLabel>Ngày kết thúc hiệu lực</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
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
              <FormLabel>Kích hoạt lại bảng giá tuyến</FormLabel>
              <p class="text-sm text-muted-foreground">Bảng giá sẽ có thể được áp dụng cho nghiệp vụ mới.</p>
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
import type { RouteRate } from '@/modules/master-data/master-data.type'
import { useRouteQuery } from '@/modules/master-data/route/composables/useRouteQueries'
import {
  useStoreRouteRateMutation,
  useUpdateRouteRateMutation,
} from '@/modules/master-data/route-rate/composables/useRouteRateMutation'
import { createRouteRateSchema } from '@/modules/master-data/route-rate/schemas/create-route-rate.schema'
import { updateRouteRateSchema } from '@/modules/master-data/route-rate/schemas/update-route-rate.schema'
import { useVehicleTypeOptionsQuery } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
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
  row?: RouteRate | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreRouteRateMutation()
const updateMutation = useUpdateRouteRateMutation()
const routesQuery = useRouteQuery()
const vehicleTypeOptionsQuery = useVehicleTypeOptionsQuery()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const routeRateFieldKeys = [
  'route_id',
  'vehicle_type_id',
  'customer_price',
  'driver_wage',
  'effective_from',
  'effective_to',
] as const

function getFormValues(routeRate?: RouteRate | null) {
  return {
    route_id: routeRate?.route_id ?? undefined,
    vehicle_type_id: routeRate?.vehicle_type_id ?? undefined,
    customer_price: routeRate?.customer_price ?? undefined,
    driver_wage: routeRate?.driver_wage ?? 0,
    effective_from: routeRate?.effective_from ?? '',
    effective_to: routeRate?.effective_to ?? null,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createRouteRateSchema),
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
    const routeRateValues = createRouteRateSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createRouteRateSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of routeRateFieldKeys) {
        if (!Object.is(routeRateValues[key], currentValues[key])) {
          payload[key] = routeRateValues[key]
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
        data: updateRouteRateSchema.parse(payload),
      })
      toast.success('Đã cập nhật bảng giá tuyến')
    } else {
      await createMutation.mutateAsync(routeRateValues)
      toast.success('Đã thêm bảng giá tuyến')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu bảng giá tuyến')
  }
})
</script>
