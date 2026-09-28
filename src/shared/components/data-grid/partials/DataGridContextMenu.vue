<script setup lang="ts" generic="TData extends RowData">
import type { RowData } from '@tanstack/vue-table'
import type { DataGridContextMenu as DataGridContextMenuPayload } from '../types'

interface Props {
  contextMenu: DataGridContextMenuPayload<TData> | null
  hasContent: boolean
  close: () => void
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="contextMenu && hasContent"
    class="fixed z-[60] min-w-44 rounded-lg border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
    role="menu"
    :style="{ left: `${contextMenu.clientX}px`, top: `${contextMenu.clientY}px` }"
    @click.stop
  >
    <slot :row="contextMenu.row" :row-id="contextMenu.rowId" :close="close" />
  </div>
</template>
