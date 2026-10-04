<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật tài xế' : 'Thêm tài xế' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật hồ sơ, bằng lái và thông tin lương.' : 'Nhập thông tin tài xế mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="full_name">
          <FormItem>
            <FormLabel>Họ và tên</FormLabel>
            <FormControl>
              <Input placeholder="Nguyễn Văn An" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="user_name">
          <FormItem>
            <FormLabel>Tài khoản người dùng</FormLabel>
            <Select
              :model-value="value ?? noUserValue"
              :disabled="usersQuery.isLoading.value"
              @update:model-value="handleUserNameChange"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chưa liên kết tài khoản" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="noUserValue">Chưa liên kết tài khoản</SelectItem>
                <SelectItem v-for="user in userOptions" :key="user.id" :value="user.user_name">
                  {{ user.user_name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value }" name="type">
          <FormItem>
            <FormLabel>Loại tài xế</FormLabel>
            <Select :model-value="value" @update:model-value="handleTypeChange">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn loại tài xế" />
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

        <FormField v-if="isPartnerDriver" v-slot="{ value, handleChange }" name="partner_id">
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

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem :class="isPartnerDriver ? '' : 'sm:col-start-2'">
            <FormLabel>Số điện thoại</FormLabel>
            <FormControl>
              <Input placeholder="0987654321" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="cccd">
          <FormItem>
            <FormLabel>CCCD</FormLabel>
            <FormControl>
              <Input placeholder="03720300xxxx" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="license_number">
          <FormItem>
            <FormLabel>Số bằng lái</FormLabel>
            <FormControl>
              <Input placeholder="123456789" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="license_class">
          <FormItem>
            <FormLabel>Hạng bằng lái</FormLabel>
            <FormControl>
              <Input placeholder="D, E hoặc FC" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="license_issued_at">
          <FormItem>
            <FormLabel>Ngày cấp bằng lái</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="license_expired_at">
          <FormItem>
            <FormLabel>Ngày hết hạn bằng lái</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="base_salary">
          <FormItem>
            <FormLabel>Lương cơ bản</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="0" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="responsibility_allowance">
          <FormItem>
            <FormLabel>Phụ cấp trách nhiệm</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" placeholder="0" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="joined_at">
          <FormItem>
            <FormLabel>Ngày vào làm</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="left_at">
          <FormItem>
            <FormLabel>Ngày nghỉ việc</FormLabel>
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
              <FormLabel>Kích hoạt lại tài xế</FormLabel>
              <p class="text-sm text-muted-foreground">Tài xế sẽ có thể được dùng cho nghiệp vụ mới.</p>
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
import { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import type { Driver } from '@/modules/master-data/master-data.type'
import { usePartnerOptionsQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import {
  useStoreDriverMutation,
  useUpdateDriverMutation,
} from '@/modules/master-data/drivers/composables/useDriverMutation'
import { createDriverSchema } from '@/modules/master-data/drivers/schemas/create-driver.schema'
import { updateDriverSchema } from '@/modules/master-data/drivers/schemas/update-driver.schema'
import { useUserQuery } from '@/modules/organization/user/composables/useUserQueries'
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

const noUserValue = '__unlinked_user__'

const props = defineProps<{
  isOpen: boolean
  row?: Driver | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreDriverMutation()
const updateMutation = useUpdateDriverMutation()
const partnerOptionsQuery = usePartnerOptionsQuery()
const usersQuery = useUserQuery()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)
const isPartnerDriver = computed(() => form.values.type === OwnershipTypeEnum.INDIVIDUAL)
const userOptions = computed(() =>
  (usersQuery.data.value ?? []).flatMap((user) =>
    user.user_name ? [{ id: user.id, user_name: user.user_name }] : [],
  ),
)

const driverFieldKeys = [
  'user_name',
  'partner_id',
  'type',
  'full_name',
  'phone',
  'cccd',
  'license_number',
  'license_class',
  'license_issued_at',
  'license_expired_at',
  'base_salary',
  'responsibility_allowance',
  'joined_at',
  'left_at',
] as const

function getFormValues(driver?: Driver | null) {
  return {
    user_name: driver?.user_name ?? null,
    partner_id: driver?.partner_id ?? null,
    type: driver?.type ?? OwnershipTypeEnum.COMPANY,
    full_name: driver?.full_name ?? '',
    phone: driver?.phone ?? null,
    cccd: driver?.cccd ?? null,
    license_number: driver?.license_number ?? '',
    license_class: driver?.license_class ?? '',
    license_issued_at: driver?.license_issued_at ?? null,
    license_expired_at: driver?.license_expired_at ?? null,
    base_salary: driver?.base_salary ?? 0,
    responsibility_allowance: driver?.responsibility_allowance ?? 0,
    joined_at: driver?.joined_at ?? null,
    left_at: driver?.left_at ?? null,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createDriverSchema),
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

function handleUserNameChange(value: unknown) {
  form.setFieldValue('user_name', value === noUserValue || value == null ? null : String(value))
}

function handleTypeChange(value: unknown) {
  if (value !== OwnershipTypeEnum.COMPANY && value !== OwnershipTypeEnum.INDIVIDUAL) return

  form.setFieldValue('type', value)

  if (value === OwnershipTypeEnum.COMPANY) {
    form.setFieldValue('partner_id', null)
  }
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const driverValues = createDriverSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createDriverSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of driverFieldKeys) {
        if (!Object.is(driverValues[key], currentValues[key])) {
          payload[key] = driverValues[key]
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
        data: updateDriverSchema.parse(payload),
      })
      toast.success('Đã cập nhật tài xế')
    } else {
      await createMutation.mutateAsync(driverValues)
      toast.success('Đã thêm tài xế')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu tài xế')
  }
})
</script>
