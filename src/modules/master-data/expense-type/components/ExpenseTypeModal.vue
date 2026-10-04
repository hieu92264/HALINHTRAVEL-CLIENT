<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Cập nhật loại chi phí' : 'Thêm loại chi phí' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Cập nhật thông tin loại chi phí.' : 'Nhập thông tin loại chi phí mới.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="code">
          <FormItem>
            <FormLabel>Mã loại chi phí</FormLabel>
            <FormControl>
              <Input placeholder="CHI-PHI-XE" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Tên loại chi phí</FormLabel>
            <FormControl>
              <Input placeholder="Chi phí bảo dưỡng xe" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="scope">
          <FormItem>
            <FormLabel>Phạm vi áp dụng</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Chọn phạm vi áp dụng" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem :value="ExpenseTypeEnum.VEHICLE">Xe</SelectItem>
                <SelectItem :value="ExpenseTypeEnum.TRIP">Chuyến xe</SelectItem>
                <SelectItem :value="ExpenseTypeEnum.GENERAL">Chung</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-if="isEdit && !row?.is_active"
          v-slot="{ value, handleChange }"
          name="is_active"
        >
          <FormItem class="flex flex-row items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div class="space-y-0.5">
              <FormLabel>Kích hoạt lại loại chi phí</FormLabel>
              <p class="text-sm text-muted-foreground">Loại chi phí sẽ có thể được dùng cho nghiệp vụ mới.</p>
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
  useStoreExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
} from '@/modules/master-data/expense-type/composables/useExpenseTypeMutation'
import { createExpenseTypeSchema } from '@/modules/master-data/expense-type/schemas/create-expense-type.schema'
import { updateExpenseTypeSchema } from '@/modules/master-data/expense-type/schemas/update-expense-type.schema'
import { ExpenseTypeEnum } from '@/modules/master-data/master-data.enum'
import type { ExpenseType } from '@/modules/master-data/master-data.type'
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
  row?: ExpenseType | null
}>()

const emit = defineEmits<{ close: [] }>()

const createMutation = useStoreExpenseTypeMutation()
const updateMutation = useUpdateExpenseTypeMutation()
const isEdit = computed(() => Boolean(props.row))
const isPending = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

const expenseTypeFieldKeys = ['code', 'name', 'scope'] as const

function getFormValues(expenseType?: ExpenseType | null) {
  return {
    code: expenseType?.code ?? '',
    name: expenseType?.name ?? '',
    scope: expenseType?.scope ?? undefined,
    is_active: false,
  }
}

const form = useForm({
  validationSchema: toTypedSchema(createExpenseTypeSchema),
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
    const expenseTypeValues = createExpenseTypeSchema.parse(values)

    if (isEdit.value) {
      const currentValues = createExpenseTypeSchema.parse(props.row)
      const payload: Record<string, unknown> = {}

      for (const key of expenseTypeFieldKeys) {
        if (!Object.is(expenseTypeValues[key], currentValues[key])) {
          payload[key] = expenseTypeValues[key]
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
        data: updateExpenseTypeSchema.parse(payload),
      })
      toast.success('Đã cập nhật loại chi phí')
    } else {
      await createMutation.mutateAsync(expenseTypeValues)
      toast.success('Đã thêm loại chi phí')
    }

    open.value = false
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu loại chi phí')
  }
})
</script>
