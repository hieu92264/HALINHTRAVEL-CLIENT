<script setup lang="ts">
withDefaults(
  defineProps<{
    code: string
    title: string
    description: string
    actionLabel?: string
    actionTo?: string
  }>(),
  {
    actionLabel: 'Về trang tổng quan',
    actionTo: '/',
  },
)
</script>

<template>
  <main class="grid min-h-svh place-items-center bg-muted/35 p-6">
    <section class="max-w-md space-y-5 text-center">
      <p class="text-6xl font-bold tracking-tighter text-blue-600">{{ code }}</p>
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p class="text-sm leading-6 text-muted-foreground">{{ description }}</p>
      </div>
      <RouterLink
        class="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/85"
        :to="actionTo"
      >
        {{ actionLabel }}
      </RouterLink>
    </section>
  </main>
</template>
