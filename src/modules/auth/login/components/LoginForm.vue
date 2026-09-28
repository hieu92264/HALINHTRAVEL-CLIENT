<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EyeIcon, EyeOffIcon, LogInIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/modules/auth/auth.store'
import { toApiError } from '@/shared/lib/api-error'
import { Button } from '@/shared/components/ui/button'
import { loginSchema, type LoginCredentials } from '../login.schema'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive<LoginCredentials>({
  user_name: '',
  password: '',
  remember_me: false,
})
const isSubmitting = ref(false)
const isPasswordVisible = ref(false)
const errors = ref<Partial<Record<keyof LoginCredentials, string>>>({})
const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
})

async function submit(): Promise<void> {
  const result = loginSchema.safeParse(form)
  if (!result.success) {
    errors.value = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path[0], issue.message]),
    ) as Partial<Record<keyof LoginCredentials, string>>
    return
  }

  errors.value = {}
  isSubmitting.value = true

  try {
    authStore.setSession(await AuthService.login(result.data))
    authStore.setUser(await AuthService.getMe())
    toast.success('Đăng nhập thành công.')
    await router.replace(redirectPath.value)
  } catch (error) {
    authStore.clearSession()
    toast.error('Không thể đăng nhập.', {
      description: toApiError(error).message,
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="submit">
    <div class="space-y-2">
      <label class="text-sm font-medium" for="user_name">Tên đăng nhập hoặc email</label>
      <input
        id="user_name"
        v-model="form.user_name"
        autocomplete="username"
        class="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15"
        :aria-invalid="Boolean(errors.user_name)"
        placeholder="Tên đăng nhập hoặc ten@halinhtravel.vn"
        type="text"
      >
      <p v-if="errors.user_name" class="text-xs text-destructive">{{ errors.user_name }}</p>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium" for="password">Mật khẩu</label>
      <div class="relative">
        <input
          id="password"
          v-model="form.password"
          autocomplete="current-password"
          class="h-10 w-full rounded-lg border bg-background py-2 pr-10 pl-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15"
          :aria-invalid="Boolean(errors.password)"
          placeholder="Nhập mật khẩu"
          :type="isPasswordVisible ? 'text' : 'password'"
        >
        <button
          class="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :aria-label="isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'"
          type="button"
          @click="isPasswordVisible = !isPasswordVisible"
        >
          <EyeOffIcon v-if="isPasswordVisible" class="size-4" />
          <EyeIcon v-else class="size-4" />
        </button>
      </div>
      <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
    </div>

    <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground" for="remember_me">
      <input
        id="remember_me"
        v-model="form.remember_me"
        class="size-4 rounded border-border accent-blue-600"
        type="checkbox"
      >
      Ghi nhớ đăng nhập
    </label>

    <Button class="w-full" :disabled="isSubmitting" type="submit">
      <LogInIcon data-icon="inline-start" />
      {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
    </Button>
  </form>
</template>
