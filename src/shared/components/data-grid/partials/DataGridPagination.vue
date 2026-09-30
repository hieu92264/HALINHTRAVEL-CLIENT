<script setup lang="ts" generic="TData extends RowData">
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from '@lucide/vue'
import type { PaginationState, RowData, Table } from '@tanstack/vue-table'
import { Button } from '@/shared/components/ui/button'

interface Props {
  table: Table<TData>
  pagination: PaginationState
  pageSizeOptions: number[]
  pageCount: number
  visibleFrom: number
  visibleTo: number
  totalRows: number
}

defineProps<Props>()
</script>

<template>
  <footer class="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
    <p class="tabular-nums text-muted-foreground">{{ visibleFrom }}–{{ visibleTo }} trong {{ totalRows }} bản ghi</p>
    <div class="flex flex-wrap items-center gap-2">
      <label class="flex items-center gap-2 text-muted-foreground">
        <span class="whitespace-nowrap">Mỗi trang</span>
        <select
          :value="pagination.pageSize"
          class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          @change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
      <span class="hidden tabular-nums text-muted-foreground sm:inline">Trang {{ pagination.pageIndex + 1 }} / {{ pageCount }}</span>
      <div class="flex items-center gap-1">
        <Button size="icon-xs" variant="outline" :disabled="!table.getCanPreviousPage()" aria-label="Trang đầu" @click="table.setPageIndex(0)">
          <ChevronsLeftIcon />
        </Button>
        <Button size="icon-xs" variant="outline" :disabled="!table.getCanPreviousPage()" aria-label="Trang trước" @click="table.previousPage()">
          <ChevronLeftIcon />
        </Button>
        <Button size="icon-xs" variant="outline" :disabled="!table.getCanNextPage()" aria-label="Trang sau" @click="table.nextPage()">
          <ChevronRightIcon />
        </Button>
        <Button size="icon-xs" variant="outline" :disabled="!table.getCanNextPage()" aria-label="Trang cuối" @click="table.setPageIndex(pageCount - 1)">
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  </footer>
</template>
