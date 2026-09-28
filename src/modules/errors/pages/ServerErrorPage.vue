<script setup lang="ts">
import ErrorState from '@/shared/components/feedback/ErrorState.vue'
</script>

<template>
  <ErrorState
    code="500"
    title="Hệ thống đang gặp sự cố"
    description="Vui lòng thử lại sau ít phút. Nếu lỗi tiếp diễn, hãy liên hệ quản trị viên."
  />
</template>
