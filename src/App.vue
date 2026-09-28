<script setup lang="ts">
import { Toaster } from '@/shared/components/ui/sonner'
</script>

<template>
  <RouterView />
  <Toaster position="bottom-right" rich-colors close-button />
</template>
