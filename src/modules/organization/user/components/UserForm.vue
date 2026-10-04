<script setup lang="ts">
import { ref, watch } from 'vue'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { useUserMutations } from '../composables/useUserMutations'
import type { UserRow } from '@/services/user.service'
import { createUserSchema, updateUserSchema } from '../schemas/user.schema'

const props = defineProps<{
  open: boolean
  /** null / undefined = tạo mới; có giá trị = sửa */
  user?: UserRow | null
}>()

const emit = defineEmits<{ close: [] }>()

const { create, update } = useUserMutations()

const isEdit = () => !!props.user

const form = ref({
  user_name: '',
  email: '',
  password: '',
})

const errors = ref<Record<string, string>>({})

/** Điền form khi mở để sửa */
watch(
  () => [props.open, props.user] as const,
  ([open, user]) => {
    if (!open) return
    errors.value = {}
    if (user) {
      form.value = { user_name: user.user_name ?? '', email: user.email ?? '', password: '' }
    } else {
      form.value = { user_name: '', email: '', password: '' }
    }
  },
)

function validate(): boolean {
  const schema = isEdit() ? updateUserSchema : createUserSchema
  const payload = isEdit()
    ? { email: form.value.email }
    : form.value
  const result = schema.safeParse(payload)

  errors.value = {}

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !errors.value[field]) {
        errors.value[field] = issue.message
      }
    }
  }

  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return

  if (isEdit()) {
    const payload = updateUserSchema.parse({ email: form.value.email })
    update.mutate(
      { id: props.user!.id, payload },
      { onSuccess: () => emit('close') },
    )
  } else {
    const payload = createUserSchema.parse(form.value)
    create.mutate(
      payload,
      { onSuccess: () => emit('close') },
    )
  }
}

const isPending = () => create.isPending.value || update.isPending.value
</script>

<template>
  <AccessDialog
    :open="open"
    :title="isEdit() ? 'Sửa tài khoản' : 'Thêm tài khoản'"
    :pending="isPending()"
    @close="emit('close')"
    @confirm="submit"
  >
    <div class="space-y-4">
      <!-- Tên đăng nhập — chỉ hiện khi tạo mới -->
      <label v-if="!isEdit()" class="block text-sm font-medium">
        Tên đăng nhập
        <input
          v-model="form.user_name"
          autocomplete="username"
          class="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="dispatcher01"
        />
        <p v-if="errors.user_name" class="mt-1 text-xs text-destructive">{{ errors.user_name }}</p>
      </label>

      <!-- Email -->
      <label class="block text-sm font-medium">
        Email
        <input
          v-model="form.email"
          type="email"
          autocomplete="email"
          class="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="user@halinhtravel.vn"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-destructive">{{ errors.email }}</p>
      </label>

      <!-- Mật khẩu — chỉ hiện khi tạo mới -->
      <label v-if="!isEdit()" class="block text-sm font-medium">
        Mật khẩu
        <input
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          class="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tối thiểu 8 ký tự"
        />
        <p v-if="errors.password" class="mt-1 text-xs text-destructive">{{ errors.password }}</p>
      </label>
    </div>
  </AccessDialog>
</template>
