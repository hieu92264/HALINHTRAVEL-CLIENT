<template>hello</template>
<script setup lang="ts">
import type { Customer } from '@/modules/master-data/master-data.type'

const props = defineProps<{
  isOpen: boolean
  row?: Customer | null
}>()

const emit = defineEmits<{ close: [] }>()
</script>
