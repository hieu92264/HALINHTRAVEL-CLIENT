<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { Button } from '@/shared/components/ui/button'
defineProps<{ open: boolean; title: string; description?: string; confirmLabel?: string; destructive?: boolean; pending?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [] }>()
function keydown(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', keydown)); onBeforeUnmount(() => window.removeEventListener('keydown', keydown))
</script>
<template><Teleport to="body"><div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" @click.self="emit('close')"><section class="w-full max-w-lg rounded-xl border bg-card shadow-xl" role="dialog" aria-modal="true"><header class="border-b px-5 py-4"><h2 class="font-semibold">{{ title }}</h2><p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p></header><div class="p-5"><slot /></div><footer class="flex justify-end gap-2 border-t px-5 py-3"><Button variant="outline" :disabled="pending" @click="emit('close')">Hủy</Button><Button :variant="destructive ? 'destructive' : 'default'" :disabled="pending" @click="emit('confirm')">{{ pending ? 'Đang lưu…' : confirmLabel || 'Lưu' }}</Button></footer></section></div></Teleport></template>
