import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    layout?: string
    requireProject?: boolean
    permission?: string
  }
}
