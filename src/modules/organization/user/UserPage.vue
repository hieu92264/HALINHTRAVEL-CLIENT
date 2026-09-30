<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/shared/components/ui/button'
import UserTable from './components/UserTable.vue'
import UserForm from './components/UserForm.vue'

const formOpen = ref(false)
</script>

<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Tài khoản người dùng</h1>
        <p class="mt-1 text-sm text-muted-foreground">Tra cứu, lọc và sắp xếp danh sách tài khoản.</p>
      </div>
      <Button @click="formOpen = true">Thêm tài khoản</Button>
    </header>

    <UserTable />

    <!-- Dialog thêm tài khoản (không có user = tạo mới) -->
    <UserForm :open="formOpen" :user="null" @close="formOpen = false" />
  </section>
</template>
