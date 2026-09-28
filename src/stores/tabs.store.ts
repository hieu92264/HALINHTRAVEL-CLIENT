import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type AppTab = {
  title: string
  to: string
  closable: boolean
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
    reset,
  }
})
