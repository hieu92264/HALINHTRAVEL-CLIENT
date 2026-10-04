<script setup lang="ts">
import {
  BusFrontIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
} from '@lucide/vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { AuthService } from '@/services/auth.service'
import {
  sidebarNavigation,
  type SidebarGroup,
  type SidebarLeaf,
  type SidebarNavigationNode,
} from '@/shared/layouts/sidebar-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useTabsStore } from '@/stores/tabs.store'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const tabsStore = useTabsStore()
const openGroupIds = ref<string[]>([])
const isCompact = computed(() => sidebarStore.isCollapsed && !sidebarStore.isMobileOpen)

function canShowItem(item: SidebarLeaf): boolean {
  return (
    router.hasRoute(item.routeName) &&
    (!item.permission || authStore.user?.permissions.includes(item.permission) === true)
  )
}

const visibleNavigation = computed<SidebarNavigationNode[]>(() => {
  return sidebarNavigation.reduce<SidebarNavigationNode[]>((nodes, node) => {
    if (node.kind === 'item') {
      if (canShowItem(node)) nodes.push(node)
      return nodes
    }

    const items = node.items.filter(canShowItem)
    if (items.length) nodes.push({ ...node, items })
    return nodes
  }, [])
})

function hasActiveItem(group: SidebarGroup): boolean {
  return group.items.some((item) => item.routeName === route.name)
}

function isGroupOpen(groupId: string): boolean {
  return openGroupIds.value.includes(groupId)
}

function toggleGroup(groupId: string): void {
  openGroupIds.value = isGroupOpen(groupId)
    ? openGroupIds.value.filter((id) => id !== groupId)
    : [...openGroupIds.value, groupId]
}

watch(
  [() => route.name, visibleNavigation],
  () => {
    const activeGroup = visibleNavigation.value.find(
      (node): node is SidebarGroup => node.kind === 'group' && hasActiveItem(node),
    )

    if (activeGroup && !isGroupOpen(activeGroup.id)) {
      openGroupIds.value = [...openGroupIds.value, activeGroup.id]
    }
  },
  { immediate: true },
)

function closeMobileSidebar(): void {
  sidebarStore.setMobileOpen(false)
}

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
    class="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300 ease-in-out"
    :class="[
      'lg:w-(--layout-sidebar-width)',
      sidebarStore.isMobileOpen ? 'translate-x-0 w-[160px]' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <!-- Logo -->
    <div
      class="flex h-16 shrink-0 items-center border-b border-sidebar-border"
      :class="isCompact ? 'justify-center' : 'gap-2.5 px-4'"
    >
      <RouterLink
        class="group flex items-center gap-2.5 overflow-hidden"
        to="/"
        @click="sidebarStore.setMobileOpen(false)"
      >
        <span
          class="travel-logo-mark relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-950/40 transition-shadow duration-300 group-hover:shadow-blue-500/30"
        >
          <span class="absolute inset-1 rounded-lg border border-white/20" />
          <BusFrontIcon class="travel-logo-vehicle relative size-5" stroke-width="2.25" />
        </span>
        <div v-if="!isCompact" class="min-w-0 overflow-hidden">
          <p class="truncate text-[15px] font-extrabold tracking-tight leading-tight text-white">
            Hà Linh
          </p>
          <p
            class="mt-0.5 truncate text-[10px] font-medium tracking-wide leading-tight text-sky-300"
          >
            Vững bước muôn nơi
          </p>
        </div>
      </RouterLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Điều hướng chính">
      <template
        v-for="node in visibleNavigation"
        :key="node.kind === 'item' ? node.routeName : node.label"
      >
        <RouterLink
          v-if="node.kind === 'item'"
          :to="node.to"
          :title="isCompact ? node.label : undefined"
          :aria-current="route.name === node.routeName ? 'page' : undefined"
          class="group flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-sky-100/70 transition-colors hover:bg-white/[0.08] hover:text-white"
          :class="[
            route.name === node.routeName ? 'bg-white/12 text-white shadow-sm ring-1 ring-white/10' : '',
            isCompact ? 'justify-center px-0' : '',
          ]"
          @click="closeMobileSidebar"
        >
          <component :is="node.icon" class="size-4 shrink-0" />
          <span v-if="!isCompact" class="flex-1 truncate">{{ node.label }}</span>
          <ChevronRightIcon
            v-if="!isCompact"
            class="size-3 opacity-0 transition-opacity group-hover:opacity-40"
          />
        </RouterLink>

        <DropdownMenu v-else-if="isCompact">
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              :title="node.label"
              :aria-label="node.label"
              class="flex h-10 w-full items-center justify-center rounded-lg text-sky-100/70 transition-colors hover:bg-white/[0.08] hover:text-white"
              :class="hasActiveItem(node) ? 'bg-white/12 text-white ring-1 ring-white/10' : ''"
            >
              <component :is="node.icon" class="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" :side-offset="12" class="w-56">
            <DropdownMenuLabel>{{ node.label }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem v-for="item in node.items" :key="item.routeName" as-child>
              <RouterLink
                :to="item.to"
                :aria-current="route.name === item.routeName ? 'page' : undefined"
                class="flex items-center gap-2"
                :class="route.name === item.routeName ? 'bg-accent text-accent-foreground' : ''"
                @click="closeMobileSidebar"
              >
                <component :is="item.icon" class="size-4" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <template v-else>
          <button
            type="button"
            class="group flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium text-sky-100/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            :class="hasActiveItem(node) ? 'bg-white/[0.06] text-white' : ''"
            :aria-expanded="isGroupOpen(node.id)"
            @click="toggleGroup(node.id)"
          >
            <component :is="node.icon" class="size-4 shrink-0" />
            <span class="flex-1 truncate">{{ node.label }}</span>
            <ChevronDownIcon
              class="size-4 shrink-0 transition-transform duration-200"
              :class="isGroupOpen(node.id) ? 'rotate-180' : ''"
            />
          </button>
          <div v-show="isGroupOpen(node.id)" class="space-y-0.5 py-1">
            <RouterLink
              v-for="item in node.items"
              :key="item.routeName"
              :to="item.to"
              :aria-current="route.name === item.routeName ? 'page' : undefined"
              class="group flex h-9 items-center gap-2.5 rounded-lg py-2 pl-8 pr-2.5 text-sm font-medium text-sky-100/70 transition-colors hover:bg-white/[0.08] hover:text-white"
              :class="route.name === item.routeName ? 'bg-white/12 text-white shadow-sm ring-1 ring-white/10' : ''"
              @click="closeMobileSidebar"
            >
              <component :is="item.icon" class="size-4 shrink-0" />
              <span class="flex-1 truncate">{{ item.label }}</span>
            </RouterLink>
          </div>
        </template>
      </template>
    </nav>

    <!-- Version -->
    <div v-if="!isCompact" class="px-4 pb-2">
      <p class="text-xs text-sky-200/45">Phiên bản 1.0.0</p>
    </div>

    <!-- Bottom actions -->
    <div class="space-y-0.5 border-t border-sidebar-border p-3">
      <!-- Collapse toggle (desktop only) -->
      <button
        class="hidden w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-sky-100/70 transition-colors hover:bg-white/[0.08] hover:text-white lg:flex"
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
        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-sky-100/70 transition-colors hover:bg-white/[0.08] hover:text-white"
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

<style scoped>
@keyframes travel-logo-roll {
  0%,
  100% {
    transform: translateX(-0.5px) translateY(0);
  }

  50% {
    transform: translateX(1px) translateY(-1px);
  }
}

.travel-logo-vehicle {
  animation: travel-logo-roll 3.5s ease-in-out infinite;
}

.group:hover .travel-logo-vehicle {
  animation-duration: 1.25s;
}

@media (prefers-reduced-motion: reduce) {
  .travel-logo-vehicle {
    animation: none;
  }
}
</style>
