<script setup lang="ts" generic="TData extends RowData">
import { ChevronDownIcon, Columns3Icon, SearchIcon, SlidersHorizontalIcon } from '@lucide/vue'
import type { Column, GroupingState, RowData, Table } from '@tanstack/vue-table'

interface Props {
  table: Table<TData>
  globalFilter: boolean
  enableGrouping: boolean
  grouping: GroupingState
  hasToolbarStart: boolean
  hasToolbarEnd: boolean
  getColumnLabel: (column: Column<TData, unknown>) => string
  setGlobalFilter: (event: Event) => void
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="globalFilter || enableGrouping || hasToolbarStart || hasToolbarEnd"
    class="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <slot name="toolbar-start" :table="table" :selected-rows="table.getSelectedRowModel().flatRows" />

      <label v-if="globalFilter" class="relative min-w-52 max-w-sm flex-1 sm:flex-none">
        <SearchIcon class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <span class="sr-only">Tìm nhanh</span>
        <input
          :value="String(table.getState().globalFilter || '')"
          class="h-8 w-full rounded-lg border border-input bg-background py-1 pl-8 pr-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          placeholder="Tìm nhanh"
          type="search"
          @input="setGlobalFilter"
        />
      </label>

      <label v-if="enableGrouping" class="flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-2 text-sm text-muted-foreground">
        <SlidersHorizontalIcon class="size-3.5" />
        <span class="sr-only">Nhóm theo</span>
        <select
          :value="grouping[0] || ''"
          class="max-w-40 bg-transparent text-sm text-foreground outline-none"
          @change="table.setGrouping(($event.target as HTMLSelectElement).value ? [($event.target as HTMLSelectElement).value] : [])"
        >
          <option value="">Không nhóm</option>
          <option v-for="column in table.getAllLeafColumns().filter((item) => item.getCanGroup())" :key="column.id" :value="column.id">
            {{ getColumnLabel(column) }}
          </option>
        </select>
      </label>
    </div>

    <div class="flex items-center gap-2 self-end sm:self-auto">
      <details class="group relative">
        <summary
          class="flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-details-marker]:hidden"
        >
          <Columns3Icon class="size-4 text-muted-foreground" />
          Cột
          <ChevronDownIcon class="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div class="absolute right-0 z-50 mt-1.5 w-56 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
          <p class="px-2 py-1.5 text-xs font-medium text-muted-foreground">Hiển thị cột</p>
          <label
            v-for="column in table.getAllLeafColumns().filter((item) => item.getCanHide())"
            :key="column.id"
            class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            <input
              :checked="column.getIsVisible()"
              class="size-3.5 rounded border-input text-primary focus:ring-ring"
              type="checkbox"
              @change="column.toggleVisibility(($event.target as HTMLInputElement).checked)"
            />
            <span class="truncate">{{ getColumnLabel(column) }}</span>
          </label>
        </div>
      </details>
      <slot name="toolbar-end" :table="table" :selected-rows="table.getSelectedRowModel().flatRows" />
    </div>
  </div>
</template>
