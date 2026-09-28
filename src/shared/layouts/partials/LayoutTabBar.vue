<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRightToLineIcon,
  RefreshCwIcon,
  XIcon,
  XCircleIcon,
} from '@lucide/vue'
import { useTabsStore } from '@/stores/tabs.store'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// Context menu state
const contextMenu = ref<{ visible: boolean; x: number; y: number; tabPath: string }>({
  visible: false,
  x: 0,
  y: 0,
  tabPath: '',
})

const contextTab = computed(() => tabsStore.tabs.find((t) => t.to === contextMenu.value.tabPath))

function openContextMenu(event: MouseEvent, tabPath: string) {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tabPath,
  }
}

function closeContextMenu() {
  contextMenu.value.visible = false
}

function closeTab(path: string): void {
  const nextPath = tabsStore.close(path)
  if (route.fullPath === path && nextPath) {
    void router.push(nextPath)
  }
}

function reloadTab() {
  // Trigger route reload by navigating to a no-op then back
  const path = contextMenu.value.tabPath
  closeContextMenu()
  if (route.fullPath === path) {
    void router.replace({ path: '/redirect', query: { to: path } }).catch(() => {
      // fallback: force reload via meta
      void router.go(0)
    })
  }
}

function closeOthers() {
  const path = contextMenu.value.tabPath
  closeContextMenu()
  tabsStore.closeOthers(path)
  if (route.fullPath !== path) {
    void router.push(path)
  }
}

function closeToRight() {
  const path = contextMenu.value.tabPath
  closeContextMenu()
  tabsStore.closeToRight(path)
  if (!tabsStore.tabs.some((t) => t.to === route.fullPath)) {
    void router.push(tabsStore.activePath || '/')
  }
}

function closeAll() {
  closeContextMenu()
  tabsStore.closeAll()
  if (tabsStore.activePath) {
    void router.push(tabsStore.activePath)
  }
}

const canCloseOthers = computed(() => {
  const others = tabsStore.tabs.filter(
    (t) => t.to !== contextMenu.value.tabPath && t.closable,
  )
  return others.length > 0
})

const canCloseToRight = computed(() => {
  const idx = tabsStore.tabs.findIndex((t) => t.to === contextMenu.value.tabPath)
  return tabsStore.tabs.slice(idx + 1).some((t) => t.closable)
})

const canCloseAll = computed(() => tabsStore.tabs.some((t) => t.closable))
</script>

<template>
  <div
    v-if="tabsStore.tabs.length"
    class="flex items-center gap-0 overflow-x-auto border-b border-border/80 bg-background/95"
    style="scrollbar-width: none"
  >
    <!-- Tab items -->
    <RouterLink
      v-for="tab in tabsStore.tabs"
      :key="tab.to"
      :to="tab.to"
      class="group relative flex shrink-0 h-9 items-center gap-1.5 px-4 text-xs font-medium transition select-none"
      :class="
        tab.to === route.fullPath
          ? 'border-b-2 border-primary bg-primary/[0.08] text-primary'
          : 'border-b-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
      "
      @contextmenu.prevent="(e) => openContextMenu(e, tab.to)"
    >
      {{ tab.title }}
      <button
        v-if="tab.closable"
        class="ml-0.5 rounded p-0.5 opacity-0 transition-opacity hover:bg-muted-foreground/20 group-hover:opacity-60 hover:!opacity-100"
        :class="tab.to === route.fullPath ? '!opacity-60' : ''"
        :aria-label="`Đóng tab ${tab.title}`"
        type="button"
        @click.prevent.stop="closeTab(tab.to)"
      >
        <XIcon class="size-3" />
      </button>
    </RouterLink>

    <!-- Spacer -->
    <div class="flex-1" />
  </div>

  <!-- Context menu -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="contextMenu.visible"
        class="fixed z-[9999] min-w-[180px] overflow-hidden rounded-lg border bg-card py-1 shadow-xl"
        :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      >
        <!-- Reload -->
        <button
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition hover:bg-muted"
          type="button"
          @click="reloadTab"
        >
          <RefreshCwIcon class="size-3.5 text-muted-foreground" />
          Tải lại trang
        </button>

        <div class="my-1 border-t" />

        <!-- Close others -->
        <button
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition"
          :class="canCloseOthers ? 'hover:bg-muted' : 'cursor-not-allowed opacity-40'"
          :disabled="!canCloseOthers"
          type="button"
          @click="canCloseOthers && closeOthers()"
        >
          <XCircleIcon class="size-3.5 text-muted-foreground" />
          Đóng tab khác
        </button>

        <!-- Close to right -->
        <button
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition"
          :class="canCloseToRight ? 'hover:bg-muted' : 'cursor-not-allowed opacity-40'"
          :disabled="!canCloseToRight"
          type="button"
          @click="canCloseToRight && closeToRight()"
        >
          <ArrowRightToLineIcon class="size-3.5 text-muted-foreground" />
          Đóng tab bên phải
        </button>

        <div class="my-1 border-t" />

        <!-- Close current -->
        <button
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition"
          :class="contextTab?.closable ? 'hover:bg-muted text-destructive' : 'cursor-not-allowed opacity-40'"
          :disabled="!contextTab?.closable"
          type="button"
          @click="contextTab?.closable && closeTab(contextMenu.tabPath)"
        >
          <XIcon class="size-3.5" />
          Đóng tab này
        </button>

        <!-- Close all -->
        <button
          class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition"
          :class="canCloseAll ? 'hover:bg-muted text-destructive' : 'cursor-not-allowed opacity-40'"
          :disabled="!canCloseAll"
          type="button"
          @click="canCloseAll && closeAll()"
        >
          <XCircleIcon class="size-3.5" />
          Đóng tất cả
        </button>
      </div>
    </Transition>

    <!-- Backdrop to close context menu -->
    <div
      v-if="contextMenu.visible"
      class="fixed inset-0 z-[9998]"
      @click="closeContextMenu"
      @contextmenu.prevent="closeContextMenu"
    />
  </Teleport>
</template>
