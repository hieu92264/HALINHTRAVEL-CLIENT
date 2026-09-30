<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from '@lucide/vue'
import type { PermissionRow } from '@/services/permission.service'

export interface PermissionGroup {
  prefix: string
  permissions: PermissionRow[]
}

const props = defineProps<{
  groups: PermissionGroup[]
  checkedIds: number[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number]
}>()

/* Mặc định expand group đầu tiên */
const expanded = ref<Record<string, boolean>>({})

function toggleGroup(prefix: string) {
  expanded.value[prefix] = !expanded.value[prefix]
}

function checkedCount(group: PermissionGroup): number {
  return group.permissions.filter((p) => props.checkedIds.includes(p.id)).length
}
</script>

<template>
  <div class="divide-y rounded-lg border">
    <div
      v-for="group in groups"
      :key="group.prefix"
      class="overflow-hidden"
    >
      <!-- Group header -->
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :aria-expanded="!!expanded[group.prefix]"
        @click="toggleGroup(group.prefix)"
      >
        <span class="font-medium font-mono text-foreground">{{ group.prefix }}.*</span>

        <span class="flex items-center gap-2 shrink-0">
          <!-- Badge đếm số quyền đã chọn -->
          <span
            v-if="checkedCount(group) > 0"
            class="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
            :class="disabled ? 'bg-muted text-muted-foreground' : 'bg-[#1769C2]/10 text-[#1769C2]'"
          >
            {{ checkedCount(group) }}/{{ group.permissions.length }}
          </span>
          <span
            v-else
            class="rounded-full px-2 py-0.5 text-xs text-muted-foreground tabular-nums"
          >
            0/{{ group.permissions.length }}
          </span>

          <ChevronDown
            :size="15"
            class="text-muted-foreground transition-transform duration-200"
            :class="expanded[group.prefix] ? 'rotate-180' : ''"
            aria-hidden="true"
          />
        </span>
      </button>

      <!-- Permission list (collapse) -->
      <div
        v-show="expanded[group.prefix]"
        class="border-t bg-muted/20"
        :style="{ '--tw-divide-opacity': 1 }"
      >
        <label
          v-for="permission in group.permissions"
          :key="permission.id"
          class="flex cursor-pointer items-center gap-3 px-5 py-2 text-sm transition-colors last:pb-3"
          :class="disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/40'"
        >
          <input
            type="checkbox"
            :checked="checkedIds.includes(permission.id)"
            :disabled="disabled"
            class="h-4 w-4 shrink-0 accent-[#1769C2] disabled:cursor-not-allowed"
            @change="emit('toggle', permission.id)"
          />
          <span class="font-mono text-xs text-muted-foreground">{{ permission.name }}</span>
        </label>
      </div>
    </div>

    <!-- Empty state -->
    <p v-if="groups.length === 0" class="px-4 py-6 text-center text-sm text-muted-foreground">
      Không tìm thấy quyền phù hợp.
    </p>
  </div>
</template>
