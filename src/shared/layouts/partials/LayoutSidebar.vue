<script setup lang="ts">
import { ChevronRightIcon, LayoutDashboardIcon, LogOutIcon, PanelLeftCloseIcon } from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { AuthService } from '@/services/auth.service'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const tabsStore = useTabsStore()

const navigation = [
  {
    label: 'Tổng quan',
    to: '/',
    icon: LayoutDashboardIcon,
  },
]

async function logout(): Promise<void> {
  await AuthService.logout().catch(() => undefined)
  authStore.clearSession()
  tabsStore.reset()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="sidebarStore.isMobileOpen"
    class="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
    @click="sidebarStore.setMobileOpen(false)"
  />

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#0f1623] text-white transition-[width,transform] duration-300 ease-in-out"
    :class="[
      'lg:w-[var(--layout-sidebar-width)]',
      sidebarStore.isMobileOpen ? 'translate-x-0 w-[160px]' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div
      class="flex h-14 shrink-0 items-center border-b border-white/10 px-3"
      :class="sidebarStore.isCollapsed ? 'justify-center' : 'gap-2.5'"
    >
      <RouterLink
        class="flex items-center gap-2.5 overflow-hidden"
        to="/"
        @click="sidebarStore.setMobileOpen(false)"
      >
        <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-500 text-white">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 7l9-5 9 5v10l-9 5-9-5V7z" />
            <path d="M12 2v20" />
            <path d="M3 7l9 5 9-5" />
          </svg>
        </span>
        <div v-if="!sidebarStore.isCollapsed" class="min-w-0 overflow-hidden">
          <p class="truncate text-sm font-bold leading-tight text-white">Hà Linh</p>
          <p class="truncate text-[10px] leading-tight text-blue-300">Vững bước muôn nơi</p>
        </div>
      </RouterLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Điều hướng chính">
      <RouterLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium text-slate-400 transition-all hover:bg-white/10 hover:text-white"
        :class="[
          route.path === item.to
            ? 'border-l-2 border-blue-400 bg-blue-600/20 text-blue-300'
            : 'border-l-2 border-transparent',
          sidebarStore.isCollapsed ? 'justify-center px-0' : '',
        ]"
        @click="sidebarStore.setMobileOpen(false)"
      >
        <component :is="item.icon" class="size-4 shrink-0" />
        <span v-if="!sidebarStore.isCollapsed" class="flex-1 truncate">{{ item.label }}</span>
        <ChevronRightIcon
          v-if="!sidebarStore.isCollapsed"
          class="size-3 opacity-0 transition-opacity group-hover:opacity-40"
        />
      </RouterLink>
    </nav>

    <!-- Version -->
    <div v-if="!sidebarStore.isCollapsed" class="px-3 pb-1">
      <p class="text-[10px] text-slate-600">Phiên bản 1.0.0</p>
    </div>

    <!-- Bottom actions -->
    <div class="border-t border-white/10 p-2 space-y-0.5">
      <!-- Collapse toggle (desktop only) -->
      <button
        class="hidden w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-slate-400 transition-all hover:bg-white/10 hover:text-white lg:flex"
        :class="sidebarStore.isCollapsed ? 'justify-center px-0' : ''"
        type="button"
        :aria-label="sidebarStore.isCollapsed ? 'Mở rộng' : 'Thu gọn'"
        @click="sidebarStore.toggleCollapsed"
      >
        <PanelLeftCloseIcon
          class="size-4 shrink-0 transition-transform duration-300"
          :class="sidebarStore.isCollapsed ? 'rotate-180' : ''"
        />
        <span v-if="!sidebarStore.isCollapsed">Thu gọn</span>
      </button>
      <!-- Logout -->
      <button
        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-slate-400 transition-all hover:bg-white/10 hover:text-white"
        :class="sidebarStore.isCollapsed ? 'justify-center px-0' : ''"
        type="button"
        @click="logout"
      >
        <LogOutIcon class="size-4 shrink-0" />
        <span v-if="!sidebarStore.isCollapsed">Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>
