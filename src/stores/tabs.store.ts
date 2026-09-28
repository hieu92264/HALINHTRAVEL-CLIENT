import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type AppTab = {
  title: string
  to: string
  closable: boolean
  icon?: string
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<AppTab[]>([])
  const activePath = ref('')

  const activeTab = computed(() => tabs.value.find((tab) => tab.to === activePath.value))

  function visit(tab: AppTab): void {
    if (!tabs.value.some((item) => item.to === tab.to)) {
      tabs.value.push(tab)
    }
    activePath.value = tab.to
  }

  function close(path: string): string | undefined {
    const index = tabs.value.findIndex((tab) => tab.to === path)
    if (index < 0 || !tabs.value[index]?.closable) return undefined

    tabs.value.splice(index, 1)
    if (activePath.value === path) {
      activePath.value = tabs.value[index - 1]?.to ?? tabs.value[0]?.to ?? ''
    }

    return activePath.value || undefined
  }

  function closeOthers(path: string): void {
    tabs.value = tabs.value.filter((tab) => !tab.closable || tab.to === path)
    if (!tabs.value.some((tab) => tab.to === activePath.value)) {
      activePath.value = path
    }
  }

  function closeToRight(path: string): void {
    const index = tabs.value.findIndex((tab) => tab.to === path)
    if (index < 0) return
    const removed = tabs.value.splice(index + 1)
    if (removed.some((tab) => tab.to === activePath.value)) {
      activePath.value = path
    }
  }

  function closeAll(): void {
    const pinned = tabs.value.filter((tab) => !tab.closable)
    tabs.value = pinned
    activePath.value = pinned[0]?.to ?? ''
  }

  function reset(): void {
    tabs.value = []
    activePath.value = ''
  }

  return {
    tabs,
    activePath,
    activeTab,
    visit,
    close,
    closeOthers,
    closeToRight,
    closeAll,
    reset,
  }
})
