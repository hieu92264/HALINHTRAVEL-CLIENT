import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AppLocale = 'vi' | 'en'

export const useLocaleStore = defineStore(
  'locale',
  () => {
    const locale = ref<AppLocale>('vi')

    function setLocale(value: AppLocale): void {
      locale.value = value
    }

    return {
      locale,
      setLocale,
    }
  },
  {
    persist: {
      pick: ['locale'],
    },
  },
)
