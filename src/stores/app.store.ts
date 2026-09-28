import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isBootstrapping = ref(false)

  function setBootstrapping(value: boolean): void {
    isBootstrapping.value = value
  }

  return {
    isBootstrapping,
    setBootstrapping,
  }
})
