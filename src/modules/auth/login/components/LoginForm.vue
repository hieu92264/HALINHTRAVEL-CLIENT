<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon, LogInIcon } from '@lucide/vue'
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
    <!-- Username -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium text-slate-700 dark:text-foreground" for="user_name">
        Tên đăng nhập hoặc email
      </label>
      <div class="relative">
        <span
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <input
          id="user_name"
          v-model="form.user_name"
          autocomplete="username"
          class="h-11 w-full rounded-lg border bg-white dark:bg-background pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-border placeholder:text-slate-400"
          :class="
            errors.user_name
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : 'border-slate-200'
          "
          :aria-invalid="Boolean(errors.user_name)"
          placeholder="nguyenvanthanh"
          type="text"
        />
      </div>
      <p v-if="errors.user_name" class="flex items-center gap-1 text-xs text-destructive">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ errors.user_name }}
      </p>
    </div>

    <!-- Password -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium text-slate-700 dark:text-foreground" for="password">
        Mật khẩu
      </label>
      <div class="relative">
        <span
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <input
          id="password"
          v-model="form.password"
          autocomplete="current-password"
          class="h-11 w-full rounded-lg border bg-white dark:bg-background pl-9 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-border placeholder:text-slate-400"
          :class="
            errors.password
              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
              : 'border-slate-200'
          "
          :aria-invalid="Boolean(errors.password)"
          placeholder="Nhập mật khẩu"
          :type="isPasswordVisible ? 'text' : 'password'"
        />
        <button
          class="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-slate-400 transition hover:text-slate-600 dark:hover:text-foreground focus-visible:outline-none"
          :aria-label="isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'"
          type="button"
          @click="isPasswordVisible = !isPasswordVisible"
        >
          <EyeOffIcon v-if="isPasswordVisible" class="size-4" />
          <EyeIcon v-else class="size-4" />
        </button>
      </div>
      <p v-if="errors.password" class="flex items-center gap-1 text-xs text-destructive">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ errors.password }}
      </p>
    </div>

    <!-- Remember me + Forgot password -->
    <div class="flex items-center justify-between">
      <label
        class="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-muted-foreground"
        for="remember_me"
      >
        <input
          id="remember_me"
          v-model="form.remember_me"
          class="size-4 rounded border-slate-300 accent-blue-600 dark:border-border"
          type="checkbox"
        />
        Ghi nhớ đăng nhập
      </label>
      <button
        type="button"
        class="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
      >
        Quên mật khẩu?
      </button>
    </div>

    <!-- Submit -->
    <Button
      class="h-11 w-full gap-2 text-sm font-semibold"
      size="lg"
      :disabled="isSubmitting"
      type="submit"
    >
      <LoaderCircleIcon v-if="isSubmitting" class="size-4 animate-spin" />
      <LogInIcon v-else class="size-4" />
      {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
    </Button>
  </form>
</template>
