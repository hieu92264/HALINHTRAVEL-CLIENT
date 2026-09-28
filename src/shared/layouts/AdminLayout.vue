<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BellIcon,
  CheckCheckIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  XIcon,
} from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { AuthService } from '@/services/auth.service'
import { useAppStore } from '@/stores/app.store'
import { useNotificationStore } from '@/stores/notification.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const tabsStore = useTabsStore()
const notificationStore = useNotificationStore()
const isNotificationsOpen = ref(false)

const navigation = [
  {
    label: 'Tổng quan',
    to: '/',
    icon: LayoutDashboardIcon,
  },
]

const displayName = computed(() => authStore.user?.user_name || authStore.user?.email || 'Tài khoản')

async function logout(): Promise<void> {
  await AuthService.logout().catch(() => undefined)
  authStore.clearSession()
  tabsStore.reset()
  await router.replace({ name: 'login' })
}

function closeTab(path: string): void {
  const nextPath = tabsStore.close(path)
  if (route.fullPath === path && nextPath) {
    void router.push(nextPath)
  }
}
</script>

<template>
  <div class="min-h-svh bg-muted/35">
    <div
      v-if="sidebarStore.isMobileOpen"
      class="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
      @click="sidebarStore.setMobileOpen(false)"
    />

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-[width,transform] duration-200"
      :class="[
        sidebarStore.isCollapsed ? 'lg:w-20' : 'lg:w-64',
        sidebarStore.isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="flex h-16 items-center border-b px-4" :class="sidebarStore.isCollapsed ? 'justify-center' : 'justify-between'">
        <RouterLink class="flex items-center gap-3 overflow-hidden font-semibold" to="/">
          <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">HL</span>
          <span v-if="!sidebarStore.isCollapsed" class="whitespace-nowrap">Hà Linh Travel</span>
        </RouterLink>
        <button
          v-if="!sidebarStore.isCollapsed"
          class="hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:inline-flex"
          aria-label="Thu gọn thanh điều hướng"
          type="button"
          @click="sidebarStore.toggleCollapsed"
        >
          <PanelLeftCloseIcon class="size-4" />
        </button>
        <button
          class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Đóng thanh điều hướng"
          type="button"
          @click="sidebarStore.setMobileOpen(false)"
        >
          <XIcon class="size-4" />
        </button>
      </div>

      <nav class="flex-1 space-y-1 p-3" aria-label="Điều hướng chính">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          :class="[
            route.path === item.to ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : '',
            sidebarStore.isCollapsed ? 'justify-center px-0' : '',
          ]"
          @click="sidebarStore.setMobileOpen(false)"
        >
          <component :is="item.icon" class="size-4 shrink-0" />
          <span v-if="!sidebarStore.isCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="border-t p-3">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          :class="sidebarStore.isCollapsed ? 'justify-center px-0' : ''"
          type="button"
          @click="logout"
        >
          <LogOutIcon class="size-4 shrink-0" />
          <span v-if="!sidebarStore.isCollapsed">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <div class="min-h-svh transition-[padding] duration-200" :class="sidebarStore.isCollapsed ? 'lg:pl-20' : 'lg:pl-64'">
      <header class="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <button
            class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Mở thanh điều hướng"
            type="button"
            @click="sidebarStore.setMobileOpen(true)"
          >
            <MenuIcon class="size-5" />
          </button>
          <button
            class="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:inline-flex"
            aria-label="Mở rộng thanh điều hướng"
            type="button"
            @click="sidebarStore.toggleCollapsed"
          >
            <PanelLeftOpenIcon class="size-4" />
          </button>
          <div>
            <p class="text-sm font-semibold">{{ route.meta.title || 'Hà Linh Travel' }}</p>
            <p class="text-xs text-muted-foreground">Trung tâm điều hành</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <button
              class="relative rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              :aria-expanded="isNotificationsOpen"
              aria-haspopup="dialog"
              aria-label="Mở thông báo"
              type="button"
              @click="isNotificationsOpen = !isNotificationsOpen"
            >
              <BellIcon class="size-5" />
              <span
                v-if="notificationStore.unreadCount"
                data-testid="notification-badge"
                class="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white"
              >
                {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
              </span>
            </button>

            <section
              v-if="isNotificationsOpen"
              class="absolute top-12 right-0 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-card shadow-xl"
              aria-label="Danh sách thông báo"
              role="dialog"
            >
              <header class="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <h2 class="text-sm font-semibold">Thông báo</h2>
                  <p class="text-xs text-muted-foreground">
                    {{ notificationStore.unreadCount ? `${notificationStore.unreadCount} chưa đọc` : 'Đã đọc tất cả' }}
                  </p>
                </div>
                <button
                  v-if="notificationStore.unreadCount"
                  class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  type="button"
                  @click="notificationStore.markAllAsRead"
                >
                  <CheckCheckIcon class="size-3.5" />
                  Đọc tất cả
                </button>
              </header>

              <div v-if="notificationStore.items.length" class="max-h-96 overflow-y-auto p-1.5">
                <button
                  v-for="notification in notificationStore.items"
                  :key="notification.id"
                  data-testid="notification-item"
                  class="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-muted"
                  :class="notification.isRead ? 'text-muted-foreground' : 'bg-blue-50/70 dark:bg-blue-500/10'"
                  type="button"
                  @click="notificationStore.markAsRead(notification.id)"
                >
                  <div class="flex items-start gap-2">
                    <span
                      class="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600"
                      :class="notification.isRead ? 'invisible' : ''"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-foreground">{{ notification.title }}</p>
                      <p class="mt-0.5 line-clamp-2 text-xs leading-5">{{ notification.body }}</p>
                      <p class="mt-1 text-[11px]">{{ notification.createdAt }}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div v-else data-testid="notification-empty-state" class="px-5 py-10 text-center">
                <BellIcon class="mx-auto size-7 text-muted-foreground/60" />
                <p class="mt-3 text-sm font-medium">Chưa có thông báo</p>
                <p class="mt-1 text-xs leading-5 text-muted-foreground">
                  Các thông báo duyệt xe, chuyến và lương sẽ xuất hiện tại đây.
                </p>
              </div>
            </section>
          </div>
          <div class="max-w-44 truncate text-right text-sm font-medium">{{ displayName }}</div>
        </div>
      </header>

      <div v-if="tabsStore.tabs.length" class="flex items-center gap-1 overflow-x-auto border-b bg-card px-4 py-2 sm:px-6">
        <RouterLink
          v-for="tab in tabsStore.tabs"
          :key="tab.to"
          :to="tab.to"
          class="group flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
          :class="tab.to === route.fullPath ? 'bg-muted text-foreground' : ''"
        >
          {{ tab.title }}
          <button
            v-if="tab.closable"
            class="rounded-sm p-0.5 opacity-60 hover:bg-background hover:opacity-100"
            :aria-label="`Đóng tab ${tab.title}`"
            type="button"
            @click.prevent.stop="closeTab(tab.to)"
          >
            <XIcon class="size-3" />
          </button>
        </RouterLink>
      </div>

      <main class="p-4 sm:p-6">
        <RouterView />
      </main>
    </div>

    <div
      v-if="appStore.isBootstrapping"
      class="fixed inset-0 z-50 grid place-items-center bg-background/75 backdrop-blur-sm"
      role="status"
    >
      <div class="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-lg">
        <span class="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        Đang khởi tạo phiên làm việc...
      </div>
    </div>
  </div>
</template>
