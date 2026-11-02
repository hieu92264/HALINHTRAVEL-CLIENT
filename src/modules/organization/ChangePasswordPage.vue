<template>
  <section class="mx-auto max-w-2xl space-y-5">
    <header class="border-b border-border pb-5">
      <p class="text-sm font-medium text-primary">Tài khoản của bạn</p>
      <h1 class="mt-1 text-2xl font-semibold tracking-tight">Đổi mật khẩu</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Để bảo vệ tài khoản {{ auth.user?.user_name ?? '' }}, hãy xác nhận mật khẩu hiện tại trước
        khi tạo mật khẩu mới.
      </p>
    </header>

    <form class="rounded-xl border bg-card" @submit.prevent="submit">
      <div class="space-y-5 p-5 sm:p-6">
        <div
          v-if="error"
          class="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {{ error }}
        </div>
        <label class="grid gap-1.5 text-sm font-medium"
          >Mật khẩu hiện tại
          <Input
            v-model="form.current_password"
            type="password"
            autocomplete="current-password"
            required
            :disabled="isSaving"
          />
        </label>
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="grid gap-1.5 text-sm font-medium"
            >Mật khẩu mới
            <Input
              v-model="form.new_password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :disabled="isSaving"
            />
            <span class="text-xs font-normal text-muted-foreground"
              >Ít nhất 8 ký tự và khác mật khẩu hiện tại.</span
            >
          </label>
          <label class="grid gap-1.5 text-sm font-medium"
            >Xác nhận mật khẩu mới
            <Input
              v-model="form.new_password_confirmation"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :disabled="isSaving"
            />
          </label>
        </div>
        <p
          v-if="
            form.new_password_confirmation && form.new_password !== form.new_password_confirmation
          "
          class="text-sm text-destructive"
        >
          Xác nhận mật khẩu mới chưa khớp.
        </p>
      </div>
      <footer
        class="flex flex-col items-stretch gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <p class="text-xs text-muted-foreground">
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
import { KeyRound } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { AuthService } from '@/services/auth.service'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

const auth = useAuthStore()
const router = useRouter()
const isSaving = ref(false)
const error = ref('')
const form = reactive({ current_password: '', new_password: '', new_password_confirmation: '' })
const canSubmit = computed(
  () =>
    form.current_password.length > 0 &&
    form.new_password.length >= 8 &&
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
