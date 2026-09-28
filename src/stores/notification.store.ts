import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type AppNotification = {
  id: string
  title: string
  body: string
  createdAt: string
  isRead: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const items = ref<AppNotification[]>([])
  const unreadCount = computed(() => items.value.filter((item) => !item.isRead).length)

  function setItems(notifications: AppNotification[]): void {
    items.value = notifications
  }

  function prepend(notification: AppNotification): void {
    items.value.unshift(notification)
  }

  function markAsRead(id: string): void {
    const notification = items.value.find((item) => item.id === id)
    if (notification) notification.isRead = true
  }

  function markAllAsRead(): void {
    items.value.forEach((item) => {
      item.isRead = true
    })
  }

  function clear(): void {
    items.value = []
  }

  return {
    items,
    unreadCount,
    setItems,
    prepend,
    markAsRead,
    markAllAsRead,
    clear,
  }
})
