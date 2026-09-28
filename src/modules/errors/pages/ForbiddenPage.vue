<script setup lang="ts">
import ErrorState from '@/shared/components/feedback/ErrorState.vue'
</script>

<template>
  <ErrorState
    code="403"
    title="Bạn không có quyền truy cập"
    description="Tài khoản hiện tại không được cấp quyền để mở trang này."
  />
</template>
