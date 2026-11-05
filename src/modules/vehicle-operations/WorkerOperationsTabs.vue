<template>
  <nav aria-label="Điều hành xe công nhân" class="overflow-x-auto pb-1">
    <div class="inline-flex min-w-max rounded-lg bg-muted p-1 text-sm">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="{ name: item.name }"
        class="rounded-md px-3 py-2 font-medium transition-colors"
        :class="
          route.name === item.name
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
      >
        {{ item.label }}
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const items = [
  { name: 'worker-vehicles', label: 'Chuyến chạy' },
]
</script>
