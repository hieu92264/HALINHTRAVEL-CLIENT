import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { AuthPayload, AuthUser } from './auth.type'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const accessToken = ref<string | null>(null)
    const user = ref<AuthUser | null>(null)
    const hasLoadedUser = ref(false)

    function setSession(payload: AuthPayload): void {
      accessToken.value = payload.access_token
    }

    function setUser(payload: AuthUser): void {
      user.value = payload
      hasLoadedUser.value = true
    }

    function markUserLoaded(): void {
      hasLoadedUser.value = true
    }

    function clearSession(): void {
      accessToken.value = null
      user.value = null
      hasLoadedUser.value = false
    }

    return {
      accessToken,
      user,
      hasLoadedUser,
      setSession,
      setUser,
      markUserLoaded,
      clearSession,
    }
  },
  {
    persist: {
      pick: ['accessToken'],
    },
  },
)
