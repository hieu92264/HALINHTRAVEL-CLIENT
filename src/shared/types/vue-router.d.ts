import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    layout?: string
    requireProject?: boolean
    permission?: string
  }
}
