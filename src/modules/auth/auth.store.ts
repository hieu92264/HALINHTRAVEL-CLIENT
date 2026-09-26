import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { AuthPayload, AuthUser } from './auth.type'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string | null>(null)
    const user = ref<AuthUser | null>(null)

    function setSession(payload: AuthPayload): void {
      accessToken.value = payload.access_token
    }

    function setUser(payload: AuthUser): void {
      user.value = payload
    }

    function clearSession(): void {
      accessToken.value = null
      user.value = null
    }

    return {
      accessToken,
      user,
      setSession,
      setUser,
      clearSession,
    }
  },
  {
    persist: {
      pick: ['accessToken'],
    },
  },
)
