<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật đối tác' : 'Thêm đối tác' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật thông tin đối tác.' : 'Nhập thông tin đối tác mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4 sm:grid-cols-2" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="type">
          <FormItem>
            <FormLabel>Loại đối tác</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn loại đối tác" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="PartnerTypeEnum.TRANSPORT_COMPANY">Công ty vận tải</SelectItem>
                <SelectItem :value="PartnerTypeEnum.VEHICLE_OWNER">Chủ xe</SelectItem>
                <SelectItem :value="PartnerTypeEnum.GARAGE">Gara sửa chữa</SelectItem>
                <SelectItem :value="PartnerTypeEnum.FUEL_SUPPLIER">Nhà cung cấp nhiên liệu</SelectItem>
                <SelectItem :value="PartnerTypeEnum.OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Tên đối tác</FormLabel>
            <FormControl>
              <Input placeholder="Công ty TNHH Vận tải Hải Phòng" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-if="isEdit && !row?.is_active" v-slot="{ value, handleChange }" name="is_active">
          <FormItem class="flex flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
            <div class="space-y-0.5">
              <FormLabel>Kích hoạt lại đối tác</FormLabel>
              <p class="text-sm text-muted-foreground">Đối tác sẽ có thể được sử dụng cho nghiệp vụ mới.</p>
            </div>
            <input
              type="checkbox"
              class="size-4 rounded border-input text-primary focus:ring-ring"
              :checked="Boolean(value)"
              @change="handleChange(($event.target as HTMLInputElement).checked)"
            />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel>Số điện thoại</FormLabel>
            <FormControl>
              <Input placeholder="0987654321" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="contact@example.com" v-bind="componentField" />
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

        <FormField v-slot="{ componentField }" name="tax_code">
          <FormItem>
            <FormLabel>Mã số thuế</FormLabel>
            <FormControl>
              <Input placeholder="0202xxxxxx" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="address">
          <FormItem class="sm:col-span-2">
            <FormLabel>Địa chỉ</FormLabel>
            <FormControl>
              <Input placeholder="Hải Phòng" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="bank_name">
          <FormItem>
            <FormLabel>Tên ngân hàng</FormLabel>
            <FormControl>
              <Input placeholder="Vietcombank" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="bank_account">
          <FormItem>
            <FormLabel>Số tài khoản</FormLabel>
            <FormControl>
              <Input placeholder="0123456789" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="opening_balance">
          <FormItem>
            <FormLabel>Công nợ đầu kỳ</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" placeholder="0.00" v-bind="componentField" />
            </FormControl>
            <FormMessage />
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
import {
  useStorePartnerMutation,
  useUpdatePartnerMutation,
} from '@/modules/master-data/partner/composables/usePartnerMutation'
import {
  createPartnerSchema,
} from '@/modules/master-data/partner/schemas/create-partner.schema'
import { updatePartnerSchema } from '@/modules/master-data/partner/schemas/update-partner.schema'
import { PartnerTypeEnum } from '@/modules/master-data/master-data.enum'
import type { Partner } from '@/modules/master-data/master-data.type'
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
  row?: Partner | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStorePartnerMutation()
const updateMutation = useUpdatePartnerMutation()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const partnerFieldKeys = [
  'type',
  'name',
  'phone',
  'email',
  'cccd',
  'tax_code',
  'address',
  'bank_name',
  'bank_account',
  'opening_balance',
] as const

function getFormValues(partner?: Partner | null) {
  return {
    type: partner?.type ?? PartnerTypeEnum.OTHER,
    name: partner?.name ?? '',
    phone: partner?.phone ?? null,
    email: partner?.email ?? null,
    cccd: partner?.cccd ?? null,
    tax_code: partner?.tax_code ?? null,
    address: partner?.address ?? null,
    bank_name: partner?.bank_name ?? null,
    bank_account: partner?.bank_account ?? null,
    opening_balance: partner?.opening_balance ?? 0,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createPartnerSchema),
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
    const partnerValues = createPartnerSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createPartnerSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of partnerFieldKeys) {
        if (!Object.is(partnerValues[key], currentValues[key])) {
          payload[key] = partnerValues[key]
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
        data: updatePartnerSchema.parse(payload),
      })
      toast.success('Đã cập nhật đối tác')
    } else {
      await createMutation.mutateAsync(partnerValues)
      toast.success('Đã thêm đối tác')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu đối tác')
  }
})
</script>
