export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

export function emitSessionExpired(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
}
