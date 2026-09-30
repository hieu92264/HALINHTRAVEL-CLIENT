<template>
  <section class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">Tài khoản người dùng</h1>
      <p class="mt-1 text-sm text-muted-foreground">Tra cứu, lọc và sắp xếp danh sách tài khoản.</p>
    </header>

    <UserTable />
  </section>
</template>

<script setup lang="ts">
import UserTable from './components/UserTable.vue'
</script>
