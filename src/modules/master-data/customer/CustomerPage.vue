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

    <!-- Dialog -->
    <CustomerModal :is-open="true" />
  </section>
</template>

<script setup lang="ts">
import CustomerModal from '@/modules/master-data/customer/components/CustomerModal.vue'
import CustomerTable from '@/modules/master-data/customer/components/CustomerTable.vue'
</script>
