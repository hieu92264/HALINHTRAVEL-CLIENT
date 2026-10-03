<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-150">
      <DialogHeader>
        <DialogTitle>
          {{ isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng' }}
        </DialogTitle>

        <DialogDescription>
          {{ isEdit ? 'Cập nhật thông tin khách hàng.' : 'Nhập thông tin khách hàng mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <!-- Type -->
        <FormField v-slot="{ componentField }" name="type">
          <FormItem>
            <FormLabel> Loại khách hàng </FormLabel>

            <Select v-bind="componentField" :disabled="isEdit">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn loại khách hàng" />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                <SelectItem :value="CustomerTypeEnum.INDIVIDUAL">Cá nhân</SelectItem>
                <SelectItem :value="CustomerTypeEnum.COMPANY">Công ty</SelectItem>
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Name -->
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel> Tên khách hàng </FormLabel>

            <FormControl>
              <Input placeholder="Nguyễn Văn A" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Phone -->
        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel> Số điện thoại </FormLabel>

            <FormControl>
              <Input placeholder="0987654321" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Email -->
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel> Email </FormLabel>

            <FormControl>
              <Input type="email" placeholder="example@gmail.com" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- cccd -->
        <FormField v-slot="{ componentField }" name="cccd">
          <FormItem>
            <FormLabel> Căn cước công dân (Cá nhân) </FormLabel>

            <FormControl>
              <Input placeholder="03720300xxxx" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- tax code -->
        <FormField v-slot="{ componentField }" name="tax_code">
          <FormItem>
            <FormLabel> Mã số thuế (Công ty) </FormLabel>

            <FormControl>
              <Input placeholder="03720300xxxx" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Address -->
        <FormField v-slot="{ componentField }" name="address">
          <FormItem>
            <FormLabel> Địa chỉ </FormLabel>

            <FormControl>
              <Input placeholder="Hải Phòng" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Contact name -->
        <FormField v-slot="{ componentField }" name="contact_name">
          <FormItem>
            <FormLabel> Tên người liên hệ </FormLabel>

            <FormControl>
              <Input placeholder="Nguyễn Văn A" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <!-- opening balance -->
        <FormField v-slot="{ componentField }" name="opening_balance">
          <FormItem>
            <FormLabel> Số dư đầu kỳ </FormLabel>

            <FormControl>
              <Input type="number" step="0.01" placeholder="0.00" v-bind="componentField" />
            </FormControl>

            <FormMessage />
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
  useStoreCustomerMutation,
  useUpdateCustomerMutation,
} from '@/modules/master-data/customer/composables/useCustomerMutation'
import type { Customer } from '@/modules/master-data/master-data.type'
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { updateCustomerSchema } from '@/modules/master-data/customer/schemas/update-customer.schema'
import { createCustomerSchema } from '@/modules/master-data/customer/schemas/create-customer.schema'
import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
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
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'vue-sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
// import { convertEnumToArray } from '@/shared/helpers/enum.helper'

const props = defineProps<{
  isOpen: boolean
  row?: Customer | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreCustomerMutation()

const updateMutation = useUpdateCustomerMutation()

const isEdit = computed(() => !!props.row)

const isPending = computed(() => {
  return createMutation.isPending.value || updateMutation.isPending.value
})

const form = useForm({
  validationSchema: toTypedSchema(isEdit.value ? updateCustomerSchema : createCustomerSchema),
  initialValues: {
    type: CustomerTypeEnum.INDIVIDUAL,
    name: '',
    phone: null,
    email: null,
    cccd: null,
    tax_code: null,
    address: null,
    contact_name: null,
    opening_balance: 0,
  },
})

// const typeOptions = convertEnumToArray(CustomerTypeEnum)

const open = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) emit('close')
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    if (isEdit.value) {
      await updateMutation.mutateAsync({
        id: props.row!.id,
        data: updateCustomerSchema.parse(values),
      })
      toast.success('Đã cập nhật khách hàng')
    } else {
      await createMutation.mutateAsync(createCustomerSchema.parse(values))
      toast.success('Đã thêm khách hàng')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu khách hàng')
  }
})
</script>
