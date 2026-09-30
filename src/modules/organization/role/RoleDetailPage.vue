<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { RoleService } from '@/services/role.service'
import { PermissionService } from '@/services/permission.service'
import { Button } from '@/shared/components/ui/button'
import PermissionGroupAccordion from '@/shared/components/feedback/PermissionGroupAccordion.vue'
import type { PermissionGroup } from '@/shared/components/feedback/PermissionGroupAccordion.vue'

const route = useRoute()
const id = Number(route.params.id)
const client = useQueryClient()

const roleQuery = useQuery({
  queryKey: ['roles', id],
  queryFn: () => RoleService.getRole(id),
})

const permissionsQuery = useQuery({
  queryKey: ['permissions'],
  queryFn: PermissionService.getPermissions,
})

const ids = ref<number[]>([])
const permissionSearch = ref('')

watch(
  [() => roleQuery.data.value, () => permissionsQuery.data.value],
  ([role, permissions]) => {
    if (role && permissions) {
      ids.value = permissions.filter((p) => role.permissions.includes(p.name)).map((p) => p.id)
    }
  },
  { immediate: true },
)

/** Grouped permissions filtered by search */
const groupedPermissions = computed<PermissionGroup[]>(() => {
  const all = (permissionsQuery.data.value ?? []).filter((p) => p.is_active)
  const q = permissionSearch.value.trim().toLowerCase()
  const filtered = q ? all.filter((p) => p.name.toLowerCase().includes(q)) : all

  const map = new Map<string, typeof filtered>()
  for (const p of filtered) {
    const dotIdx = p.name.indexOf('.')
    const prefix = dotIdx > -1 ? p.name.slice(0, dotIdx) : p.name
    if (!map.has(prefix)) map.set(prefix, [])
    map.get(prefix)!.push(p)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([prefix, permissions]) => ({ prefix, permissions }))
})

const totalSelected = computed(
  () => (permissionsQuery.data.value ?? []).filter((p) => ids.value.includes(p.id)).length,
)

const save = useMutation({
  mutationFn: () => RoleService.syncPermissions(id, ids.value),
  onSuccess: async () => {
    toast.success('Đã cập nhật quyền của vai trò.')
    await client.invalidateQueries({ queryKey: ['roles'] })
  },
  onError: (e) => toast.error(e instanceof Error ? e.message : 'Không thể lưu quyền.'),
})

function toggle(permissionId: number) {
  const i = ids.value.indexOf(permissionId)
  if (i < 0) ids.value.push(permissionId)
  else ids.value.splice(i, 1)
}
</script>

<template>
  <section v-if="roleQuery.data.value" class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ roleQuery.data.value.name }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ roleQuery.data.value.is_system ? 'Vai trò hệ thống — chỉ đọc' : 'Vai trò tùy chỉnh' }}
      </p>
    </header>

    <section class="rounded-xl border bg-card">
      <header class="flex items-center justify-between border-b px-5 py-3">
        <h2 class="font-semibold">Quyền của vai trò</h2>
        <span class="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
          {{ totalSelected }} được chọn
        </span>
      </header>

      <div class="p-4 space-y-3">
        <!-- Tìm quyền -->
        <input
          v-model="permissionSearch"
          type="search"
          class="h-8 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tìm quyền…"
        />

        <div class="max-h-[55svh] overflow-auto">
          <PermissionGroupAccordion
            :groups="groupedPermissions"
            :checked-ids="ids"
            :disabled="roleQuery.data.value.is_system"
            @toggle="toggle"
          />
        </div>
      </div>

      <footer v-if="!roleQuery.data.value.is_system" class="flex justify-end border-t px-5 py-3">
        <Button size="sm" :disabled="save.isPending.value" @click="save.mutate()">
          {{ save.isPending.value ? 'Đang lưu…' : 'Lưu thay đổi' }}
        </Button>
      </footer>
    </section>
  </section>

  <p v-else-if="roleQuery.isLoading.value" class="py-16 text-center text-sm text-muted-foreground">
    Đang tải vai trò…
  </p>
</template>
