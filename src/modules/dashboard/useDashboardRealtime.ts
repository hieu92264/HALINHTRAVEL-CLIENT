import { apiBaseUrl } from '@/configs/env.config'
import { useAuthStore } from '@/modules/auth/auth.store'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { DashboardUpdatedEvent } from './dashboard.types'

type RealtimeStatus = 'disabled' | 'unavailable' | 'connecting' | 'connected' | 'disconnected'
const reverbKey = import.meta.env.VITE_REVERB_APP_KEY as string | undefined
const reverbHost = (import.meta.env.VITE_REVERB_HOST as string | undefined) ?? window.location.hostname
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT ?? 8080)
const reverbScheme = (import.meta.env.VITE_REVERB_SCHEME as string | undefined) ?? 'http'

export function useDashboardRealtime(onUpdated: (event: DashboardUpdatedEvent) => void) {
  const status = ref<RealtimeStatus>(reverbKey ? 'disconnected' : 'disabled')
  let echo: Echo<'reverb'> | null = null
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null

  const disconnect = () => {
    if (!echo) return
    echo.leave('dashboard')
    echo.disconnect()
    echo = null
    status.value = reverbKey ? 'disconnected' : 'disabled'
  }
  const connect = () => {
    const authStore = useAuthStore()
    const canSubscribe = authStore.user?.permissions.some((permission) => [
      'trip-schedules.view',
      'trip-assignments.view',
      'dispatch-orders.view',
      'vehicles.view',
      'drivers.view',
      'receipts.view',
      'expenses.view',
      'partner-payments.view',
    ].includes(permission))
    if (!reverbKey || !authStore.accessToken || echo || !canSubscribe) {
      if (!canSubscribe && reverbKey) status.value = 'unavailable'
      return
    }
    status.value = 'connecting'
    window.Pusher = Pusher
    echo = new Echo({ broadcaster: 'reverb', key: reverbKey, wsHost: reverbHost, wsPort: reverbPort, wssPort: reverbPort, forceTLS: reverbScheme === 'https', enabledTransports: ['ws', 'wss'], authEndpoint: `${apiBaseUrl}/broadcasting/auth`, auth: { headers: { Authorization: `Bearer ${authStore.accessToken}` } } })
    echo.connector.pusher.connection.bind('connected', () => { status.value = 'connected' })
    echo.connector.pusher.connection.bind('disconnected', () => { status.value = 'disconnected' })
    echo.connector.pusher.connection.bind('unavailable', () => { status.value = 'disconnected' })
    echo.private('dashboard').listen('.dashboard.updated', onUpdated)
  }
  const onVisibilityChange = () => {
    if (document.hidden) {
      disconnectTimer = setTimeout(disconnect, 60_000)
    } else {
      if (disconnectTimer) clearTimeout(disconnectTimer)
      disconnectTimer = null
      if (!echo) connect()
    }
  }
  onMounted(() => { connect(); document.addEventListener('visibilitychange', onVisibilityChange) })
  onBeforeUnmount(() => { if (disconnectTimer) clearTimeout(disconnectTimer); document.removeEventListener('visibilitychange', onVisibilityChange); disconnect() })
  return { status }
}
