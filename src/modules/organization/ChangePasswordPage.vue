<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <header class="border-b border-border pb-5">
      <p class="text-sm font-medium text-primary">Tài khoản của bạn</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">Đổi mật khẩu</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Để bảo vệ tài khoản {{ auth.user?.user_name ?? '' }}, hãy xác nhận mật khẩu hiện tại trước
        khi tạo mật khẩu mới.
      </p>
    </header>

    <form class="overflow-hidden rounded-xl border border-border bg-card" @submit.prevent="submit">
      <div class="border-b border-border bg-muted/30 px-5 py-4 sm:px-6">
        <div class="flex items-start gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck class="size-4" />
          </span>
          <div>
            <p class="text-sm font-semibold text-foreground">Bảo mật tài khoản</p>
            <p class="mt-0.5 text-sm text-muted-foreground">
              Xác nhận mật khẩu hiện tại trước khi đặt mật khẩu mới.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-7 p-5 sm:p-6">
        <div
          v-if="error"
          class="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {{ error }}
        </div>

        <fieldset class="space-y-3">
          <legend class="text-sm font-semibold text-foreground">Xác thực bạn</legend>
          <p class="text-sm text-muted-foreground">Nhập mật khẩu đang dùng cho tài khoản này.</p>
          <label class="grid gap-1.5 text-sm font-medium"
            >Mật khẩu hiện tại
            <span class="relative block">
              <Input
                v-model="form.current_password"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="h-10 pr-10"
                autocomplete="current-password"
                required
                :disabled="isSaving"
              />
              <button
                class="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="button"
                :aria-label="showCurrentPassword ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <EyeOff v-if="showCurrentPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </span>
          </label>
        </fieldset>

        <fieldset class="space-y-4 border-t border-border pt-6">
          <legend class="text-sm font-semibold text-foreground">Mật khẩu mới</legend>
          <p class="text-sm text-muted-foreground">
            Dùng mật khẩu riêng cho tài khoản điều hành và không chia sẻ với người khác.
          </p>
          <label class="grid gap-1.5 text-sm font-medium"
            >Mật khẩu mới
            <span class="relative block">
              <Input
                v-model="form.new_password"
                :type="showNewPassword ? 'text' : 'password'"
                class="h-10 pr-10"
                autocomplete="new-password"
                required
                minlength="8"
                :disabled="isSaving"
              />
              <button
                class="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="button"
                :aria-label="showNewPassword ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'"
                @click="showNewPassword = !showNewPassword"
              >
                <EyeOff v-if="showNewPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </span>
          </label>
          <label class="grid gap-1.5 text-sm font-medium"
            >Xác nhận mật khẩu mới
            <span class="relative block">
              <Input
                v-model="form.new_password_confirmation"
                :type="showConfirmationPassword ? 'text' : 'password'"
                class="h-10 pr-10"
                autocomplete="new-password"
                required
                minlength="8"
                :disabled="isSaving"
              />
              <button
                class="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type="button"
                :aria-label="showConfirmationPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'"
                @click="showConfirmationPassword = !showConfirmationPassword"
              >
                <EyeOff v-if="showConfirmationPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </span>
          </label>

          <ul class="grid gap-2 rounded-lg bg-muted/45 px-3 py-3 text-sm" aria-live="polite">
            <li
              v-for="check in passwordChecks"
              :key="check.label"
              class="flex items-center gap-2"
              :class="check.met ? 'text-success' : 'text-muted-foreground'"
            >
              <CheckCircle2 v-if="check.met" class="size-4 shrink-0" />
              <Circle v-else class="size-4 shrink-0" />
              {{ check.label }}
            </li>
          </ul>
        </fieldset>
      </div>
      <footer
        class="flex flex-col items-stretch gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p class="text-sm text-muted-foreground">
          Sau khi đổi mật khẩu, bạn sẽ được yêu cầu đăng nhập lại.
        </p>
        <Button type="submit" class="w-full sm:w-auto" :disabled="isSaving || !canSubmit"
          ><KeyRound class="size-4" />{{
            isSaving ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'
          }}</Button
        >
      </footer>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { CheckCircle2, Circle, Eye, EyeOff, KeyRound, ShieldCheck } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { AuthService } from '@/services/auth.service'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

const auth = useAuthStore()
const router = useRouter()
const isSaving = ref(false)
const error = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmationPassword = ref(false)
const form = reactive({ current_password: '', new_password: '', new_password_confirmation: '' })
const passwordChecks = computed(() => [
  { label: 'Có ít nhất 8 ký tự', met: form.new_password.length >= 8 },
  {
    label: 'Khác mật khẩu hiện tại',
    met: Boolean(form.new_password) && form.new_password !== form.current_password,
  },
  {
    label: 'Xác nhận mật khẩu trùng khớp',
    met:
      Boolean(form.new_password_confirmation) &&
      form.new_password === form.new_password_confirmation,
  },
])
const canSubmit = computed(
  () =>
    form.current_password.length > 0 &&
    form.new_password.length >= 8 &&
    form.new_password !== form.current_password &&
    form.new_password === form.new_password_confirmation,
)

async function submit() {
  if (!canSubmit.value) return
  isSaving.value = true
  error.value = ''
  try {
    await AuthService.changePassword(form)
    auth.clearSession()
    toast.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
    await router.replace({ name: 'login' })
  } catch (caught) {
    error.value =
      caught instanceof Error ? caught.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.'
  } finally {
    isSaving.value = false
  }
}
</script>
