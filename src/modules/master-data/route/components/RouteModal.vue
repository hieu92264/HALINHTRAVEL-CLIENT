<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật tuyến xe' : 'Thêm tuyến xe' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật điểm đón, điểm trả và giờ chạy tiêu chuẩn.' : 'Nhập thông tin tuyến xe mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <FormField v-slot="{ value, handleChange }" name="customer_id">
          <FormItem>
            <FormLabel>Khách hàng</FormLabel>
            <Select
              :model-value="value == null ? noCustomerValue : String(value)"
              :disabled="customerOptionsQuery.isLoading.value"
              @update:model-value="handleCustomerChange(handleChange, $event)"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="noCustomerValue">Không gán khách hàng</SelectItem>
                <SelectItem
                  v-for="customer in customerOptionsQuery.data.value ?? []"
                  :key="customer.value"
                  :value="String(customer.value)"
                >
                  {{ customer.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Tên tuyến</FormLabel>
            <FormControl>
              <Input placeholder="KCN VSIP - Trung tâm Hải Phòng" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="shift_name">
          <FormItem>
            <FormLabel>Tên ca</FormLabel>
            <FormControl>
              <Input placeholder="Ca sáng" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="estimated_distance_km">
          <FormItem>
            <FormLabel>Khoảng cách ước tính (km)</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="25.50" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="pickup_location">
          <FormItem class="sm:col-span-2">
            <FormLabel>Điểm đón</FormLabel>
            <FormControl>
              <Input placeholder="Khu công nghiệp VSIP, Thủy Nguyên" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="dropoff_location">
          <FormItem class="sm:col-span-2">
            <FormLabel>Điểm trả</FormLabel>
            <FormControl>
              <Input placeholder="Trung tâm thành phố Hải Phòng" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="default_pickup_time">
          <FormItem>
            <FormLabel>Giờ đón mặc định</FormLabel>
            <FormControl>
              <Input type="time" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="default_return_time">
          <FormItem>
            <FormLabel>Giờ về mặc định</FormLabel>
            <FormControl>
              <Input type="time" v-bind="componentField" />
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
              <FormLabel>Kích hoạt lại tuyến xe</FormLabel>
              <p class="text-sm text-muted-foreground">Tuyến xe sẽ có thể được dùng cho nghiệp vụ mới.</p>
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
import { useCustomerOptionsQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import {
  useStoreRouteMutation,
  useUpdateRouteMutation,
} from '@/modules/master-data/route/composables/useRouteMutation'
import { createRouteSchema } from '@/modules/master-data/route/schemas/create-route.schema'
import { updateRouteSchema } from '@/modules/master-data/route/schemas/update-route.schema'
import type { Route } from '@/modules/master-data/master-data.type'
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

const noCustomerValue = '__no_customer__'

const props = defineProps<{
  isOpen: boolean
  row?: Route | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreRouteMutation()
const updateMutation = useUpdateRouteMutation()
const customerOptionsQuery = useCustomerOptionsQuery()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const routeFieldKeys = [
  'customer_id',
  'name',
  'shift_name',
  'pickup_location',
  'dropoff_location',
  'default_pickup_time',
  'default_return_time',
  'estimated_distance_km',
] as const

function getFormValues(route?: Route | null) {
  return {
    customer_id: route?.customer_id ?? null,
    name: route?.name ?? '',
    shift_name: route?.shift_name ?? null,
    pickup_location: route?.pickup_location ?? '',
    dropoff_location: route?.dropoff_location ?? '',
    default_pickup_time: route?.default_pickup_time ?? null,
    default_return_time: route?.default_return_time ?? null,
    estimated_distance_km: route?.estimated_distance_km ?? null,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createRouteSchema),
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

function handleCustomerChange(handleChange: (value: number | null) => void, value: unknown) {
  handleChange(value === noCustomerValue || value == null ? null : Number(value))
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const routeValues = createRouteSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createRouteSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of routeFieldKeys) {
        if (!Object.is(routeValues[key], currentValues[key])) {
          payload[key] = routeValues[key]
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
        data: updateRouteSchema.parse(payload),
      })
      toast.success('Đã cập nhật tuyến xe')
    } else {
      await createMutation.mutateAsync(routeValues)
      toast.success('Đã thêm tuyến xe')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu tuyến xe')
  }
})
</script>
