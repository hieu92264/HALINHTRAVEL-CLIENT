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
    class="min-h-svh bg-muted/35"
    :style="{ '--layout-sidebar-width': sidebarStore.isCollapsed ? '60px' : '180px' }"
  >
    <!-- Sidebar (includes mobile overlay) -->
    <LayoutSidebar />

    <!-- Content area -->
    <div
      class="flex min-h-svh flex-col transition-[padding-left] duration-300 ease-in-out lg:pl-[var(--layout-sidebar-width)]"
    >
      <!-- Top header -->
      <LayoutHeader />

      <!-- Tab bar -->
      <LayoutTabBar />

      <!-- Main page content -->
      <main class="flex-1 p-4 sm:p-6">
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
