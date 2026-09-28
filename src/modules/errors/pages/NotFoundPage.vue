<script setup lang="ts">
import ErrorState from '@/shared/components/feedback/ErrorState.vue'
</script>

<template>
  <ErrorState
    code="404"
    title="Không tìm thấy trang"
    description="Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi."
  />
</template>
