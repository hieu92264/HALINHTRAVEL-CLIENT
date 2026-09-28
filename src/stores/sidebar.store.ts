import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore(
  'sidebar',
  () => {
    const isCollapsed = ref(false)
    const isMobileOpen = ref(false)

    function toggleCollapsed(): void {
      isCollapsed.value = !isCollapsed.value
    }

    function setMobileOpen(value: boolean): void {
      isMobileOpen.value = value
    }

    return {
      isCollapsed,
      isMobileOpen,
      toggleCollapsed,
      setMobileOpen,
    }
  },
  {
    persist: {
      pick: ['isCollapsed'],
    },
  },
)
