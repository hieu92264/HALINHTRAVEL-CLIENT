<template>
  <h1>User Account</h1>
  <span>Manage user account and view their detail</span>
</template>

<script setup lang="ts">
import { useUserQuery } from '@/modules/organization/user/composables/useUserMutations'
// import { computed } from 'vue'

const usersQuery = useUserQuery()

console.log('usersQuery', usersQuery)
</script>
