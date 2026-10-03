<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Thông tin khách hàng</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Tra cứu, lọc và sắp xếp danh sách khách hàng.
        </p>
      </div>
      <!-- <Button @click="">Thêm tài khoản</Button> -->
    </header>

    <CustomerTable />

    <!-- Dialog thêm tài khoản (không có user = tạo mới) -->
    <!-- <UserForm :open="formOpen" :user="null" @close="formOpen = false" /> -->
  </section>
</template>

<script setup lang="ts">
import CustomerTable from '@/modules/master-data/customer/components/CustomerTable.vue'
</script>
