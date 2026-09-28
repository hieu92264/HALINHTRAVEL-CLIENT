<script setup lang="ts">
import { useAppStore } from '@/stores/app.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import LayoutHeader from './partials/LayoutHeader.vue'
import LayoutSidebar from './partials/LayoutSidebar.vue'
import LayoutTabBar from './partials/LayoutTabBar.vue'

const appStore = useAppStore()
const sidebarStore = useSidebarStore()
</script>

<template>
  <div
    class="h-svh overflow-hidden bg-background"
    :style="{ '--layout-sidebar-width': sidebarStore.isCollapsed ? '64px' : '240px' }"
  >
    <!-- Sidebar (includes mobile overlay) -->
    <LayoutSidebar />

    <!-- Content area -->
    <div
      class="flex h-svh min-h-0 min-w-0 flex-col transition-[padding-left] duration-300 ease-in-out lg:pl-[var(--layout-sidebar-width)]"
    >
      <!-- Top header -->
      <LayoutHeader />

      <!-- Tab bar -->
      <LayoutTabBar />

      <!-- Main page content -->
      <main class="operations-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>

    <!-- Bootstrapping overlay -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="appStore.isBootstrapping"
        class="fixed inset-0 z-50 grid place-items-center bg-background/75 backdrop-blur-sm"
        role="status"
        aria-label="Đang khởi tạo"
      >
        <div class="flex items-center gap-3 rounded-xl border bg-card px-5 py-3.5 text-sm shadow-xl">
          <span class="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Đang khởi tạo phiên làm việc...
        </div>
      </div>
    </Transition>
  </div>
</template>
