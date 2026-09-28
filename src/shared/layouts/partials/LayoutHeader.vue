<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  BellIcon,
  CheckCheckIcon,
  ChevronDownIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
} from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTheme } from '@/shared/composables/useTheme'

const route = useRoute()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const notificationStore = useNotificationStore()
const { isDark, toggleTheme } = useTheme()

const isNotificationsOpen = ref(false)

const displayName = computed(() => authStore.user?.user_name || authStore.user?.email || 'Tài khoản')
const userRole = computed(() => (authStore.user?.roles?.[0]) || 'Quản trị viên')
const userInitials = computed(() => displayName.value.slice(0, 2).toUpperCase())
</script>

<template>
  <header class="flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
    <!-- Left: sidebar toggle + breadcrumb -->
    <div class="flex items-center gap-2">
      <!-- Mobile hamburger -->
      <button
        class="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Mở thanh điều hướng"
        type="button"
        @click="sidebarStore.setMobileOpen(true)"
      >
        <MenuIcon class="size-5" />
      </button>

      <!-- Desktop collapse toggle -->
      <button
        class="hidden rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground lg:inline-flex"
        :aria-label="sidebarStore.isCollapsed ? 'Mở rộng' : 'Thu gọn'"
        type="button"
        @click="sidebarStore.toggleCollapsed"
      >
        <PanelLeftOpenIcon v-if="sidebarStore.isCollapsed" class="size-4" />
        <PanelLeftCloseIcon v-else class="size-4" />
      </button>

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <span class="text-muted-foreground">Trang chủ</span>
        <span class="text-muted-foreground/50">/</span>
        <span class="font-medium text-foreground">{{ route.meta.title || 'Hà Linh Travel' }}</span>
      </nav>
    </div>

    <!-- Right: actions -->
    <div class="flex items-center gap-1">
      <!-- Dark / light toggle -->
      <button
        class="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        :aria-label="isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'"
        type="button"
        @click="(e) => toggleTheme(e)"
      >
        <SunIcon v-if="isDark" class="size-4" />
        <MoonIcon v-else class="size-4" />
      </button>

      <!-- Language -->
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        type="button"
      >
        <img src="https://flagcdn.com/w20/vn.png" alt="VI" class="h-3.5 w-5 rounded-sm object-cover" />
        <span class="hidden sm:inline">Tiếng Việt</span>
        <ChevronDownIcon class="size-3" />
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button
          class="relative rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          :aria-expanded="isNotificationsOpen"
          aria-haspopup="dialog"
          aria-label="Thông báo"
          type="button"
          @click="isNotificationsOpen = !isNotificationsOpen"
        >
          <BellIcon class="size-4" />
          <span
            v-if="notificationStore.unreadCount"
            data-testid="notification-badge"
            class="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] leading-4 font-semibold text-white"
          >
            {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
          </span>
        </button>

        <!-- Notification panel -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <section
            v-if="isNotificationsOpen"
            class="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-card shadow-xl origin-top-right"
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
                class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
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
        </Transition>
      </div>

      <!-- User avatar -->
      <div class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-muted">
        <div class="grid size-7 shrink-0 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
          {{ userInitials }}
        </div>
        <div class="hidden text-right sm:block">
          <p class="max-w-[120px] truncate text-xs font-semibold leading-tight">{{ displayName }}</p>
          <p class="text-[10px] leading-tight text-muted-foreground">{{ userRole }}</p>
        </div>
        <ChevronDownIcon class="hidden size-3 text-muted-foreground sm:block" />
      </div>
    </div>
  </header>
</template>
