<script setup lang="ts" generic="TData extends RowData">
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CircleAlertIcon,
  Columns3Icon,
  GripVerticalIcon,
  InboxIcon,
  LoaderCircleIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from '@lucide/vue'
import {
  FlexRender,
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnSizingState,
  type GroupingState,
  type Header,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
  useVueTable,
} from '@tanstack/vue-table'
import { useVirtualizer, type VirtualItem } from '@tanstack/vue-virtual'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@/shared/components/ui/button'
import type {
  DataGridCellUpdate,
  DataGridColumnDef,
  DataGridColumnMeta,
  DataGridContextMenu,
  DataGridDataSource,
  DataGridOperationMode,
  DataGridPaginationOptions,
  DataGridPersistOptions,
  DataGridSelectionOptions,
  DataGridState,
  DataGridVirtualOptions,
} from './types'

const SELECT_COLUMN_ID = '__data_grid_select__'
const EXPAND_COLUMN_ID = '__data_grid_expand__'
const ACTION_COLUMN_ID = '__data_grid_actions__'
const SYSTEM_COLUMN_IDS: string[] = [SELECT_COLUMN_ID, EXPAND_COLUMN_ID, ACTION_COLUMN_ID]

interface Props {
  /** Nhận mảng giả lập hoặc kết quả đã chuẩn hoá từ query/API. */
  dataSource: DataGridDataSource<TData>
  /** Khai báo ở file `column.ts` cạnh module nghiệp vụ. */
  columns: DataGridColumnDef<TData>[]
  /** Bật phân trang và chọn chế độ client/server. */
  pagination?: DataGridPaginationOptions | false
  filteringMode?: DataGridOperationMode
  sortingMode?: DataGridOperationMode
  /** Hiển thị hàng input lọc ngay bên dưới header. */
  filterRow?: boolean
  /** Hiển thị ô tìm nhanh, dùng global filter của TanStack Table. */
  globalFilter?: boolean
  /** Bật nhóm dòng. Các cột cần group/aggregate khai báo tại `column.ts`. */
  enableGrouping?: boolean
  /** Checkbox cố định bên trái. */
  selection?: boolean | DataGridSelectionOptions<TData>
  /** Dùng với v-model:selected-row-ids khi state selection do trang cha kiểm soát. */
  selectedRowIds?: RowSelectionState
  /** Cột thao tác cố định bên phải, nội dung do slot #actions cung cấp. */
  showActions?: boolean
  /** Cấu trúc cây/subrow của dữ liệu. */
  getSubRows?: (row: TData, index: number) => TData[] | undefined
  getRowId?: (row: TData, index: number, parent?: Row<TData>) => string
  enableColumnResizing?: boolean
  enableColumnReordering?: boolean
  /** Chỉ bật khi số dòng mỗi trang lớn; mặc định tắt. */
  virtual?: boolean | DataGridVirtualOptions
  /** Lưu state bảng vào localStorage và/hoặc URL. */
  persist?: DataGridPersistOptions
  loadingMode?: 'skeleton' | 'overlay'
  emptyTitle?: string
  emptyDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  filteringMode: 'client',
  sortingMode: 'client',
  filterRow: false,
  globalFilter: false,
  enableGrouping: false,
  selection: false,
  showActions: false,
  enableColumnResizing: true,
  enableColumnReordering: true,
  virtual: false,
  loadingMode: 'skeleton',
  emptyTitle: 'Chưa có dữ liệu',
  emptyDescription: 'Dữ liệu sẽ xuất hiện ở đây khi có bản ghi phù hợp.',
})

const emit = defineEmits<{
  'update:selectedRowIds': [value: RowSelectionState]
  'selection-change': [value: RowSelectionState, rows: TData[]]
  'pagination-change': [value: PaginationState]
  'sorting-change': [value: SortingState]
  'filters-change': [value: ColumnFiltersState]
  'global-filter-change': [value: string]
  'state-change': [value: DataGridState]
  'row-click': [row: TData, event: MouseEvent | KeyboardEvent]
  'row-double-click': [row: TData, event: MouseEvent]
  'row-context-menu': [value: DataGridContextMenu<TData>, event: MouseEvent]
  'cell-update': [value: DataGridCellUpdate<TData>]
  retry: []
}>()

const gridRoot = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const draggedColumnId = ref<string | null>(null)
const editingCell = ref<{ rowId: string; columnId: string } | null>(null)
const editingValue = ref('')
const contextMenu = ref<DataGridContextMenu<TData> | null>(null)

type PersistedState = Partial<DataGridState>

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function getQueryKey(name: string): string {
  return props.persist?.queryPrefix ? `${props.persist.queryPrefix}_${name}` : name
}

function parseJson<T>(value: string | null): T | undefined {
  if (!value) return undefined

  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

function getInitialPersistedState(): PersistedState {
  if (!isBrowser() || !props.persist) return {}

  const saved: PersistedState = {}

  if (props.persist.localStorage !== false) {
    const localState = parseJson<PersistedState>(window.localStorage.getItem(`data-grid:${props.persist.key}`))
    Object.assign(saved, localState)
  }

  if (props.persist.url) {
    const query = new URLSearchParams(window.location.search)
    const page = Number(query.get(getQueryKey('page')))
    const pageSize = Number(query.get(getQueryKey('pageSize')))
    const sorting = parseJson<SortingState>(query.get(getQueryKey('sort')))
    const filters = parseJson<ColumnFiltersState>(query.get(getQueryKey('filters')))
    const visibility = parseJson<VisibilityState>(query.get(getQueryKey('columns')))
    const globalFilter = query.get(getQueryKey('q'))

    if (Number.isInteger(page) && page > 0) {
      saved.pagination = {
        pageIndex: page - 1,
        pageSize: Number.isInteger(pageSize) && pageSize > 0 ? pageSize : saved.pagination?.pageSize || 25,
      }
    }
    if (sorting) saved.sorting = sorting
    if (filters) saved.columnFilters = filters
    if (visibility) saved.columnVisibility = visibility
    if (globalFilter !== null) saved.globalFilter = globalFilter
  }

  return saved
}

const initialState = getInitialPersistedState()

const paginationOptions = computed(() => {
  if (!props.pagination) return null

  return {
    mode: 'client' as DataGridOperationMode,
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    ...props.pagination,
  }
})
const isServerPagination = computed(() => paginationOptions.value?.mode === 'server')
const selectionOptions = computed<DataGridSelectionOptions<TData> | null>(() => {
  if (!props.selection) return null
  return props.selection === true ? {} : props.selection
})
const virtualOptions = computed(() => {
  if (!props.virtual) return null
  return {
    height: 560,
    estimateRowHeight: 46,
    overscan: 8,
    ...(props.virtual === true ? {} : props.virtual),
  }
})
const hasSubRows = computed(() => Boolean(props.getSubRows))

const pagination = ref<PaginationState>(
  initialState.pagination || {
    pageIndex: 0,
    pageSize: paginationOptions.value?.pageSize || 25,
  },
)
const sorting = ref<SortingState>(initialState.sorting || [])
const columnFilters = ref<ColumnFiltersState>(initialState.columnFilters || [])
const globalFilter = ref(initialState.globalFilter || '')
const columnVisibility = ref<VisibilityState>(initialState.columnVisibility || {})
const columnOrder = ref<ColumnOrderState>(initialState.columnOrder || [])
const columnSizing = ref<ColumnSizingState>(initialState.columnSizing || {})
const grouping = ref<GroupingState>(initialState.grouping || [])
const rowSelection = ref<RowSelectionState>(props.selectedRowIds || {})

const tableData = computed(() => props.dataSource.data)

const systemColumns = computed<ColumnDef<TData>[]>(() => {
  const columns: ColumnDef<TData>[] = []

  if (selectionOptions.value) {
    columns.push({
      id: SELECT_COLUMN_ID,
      header: () => null,
      cell: () => null,
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    })
  }

  if (hasSubRows.value) {
    columns.push({
      id: EXPAND_COLUMN_ID,
      header: () => null,
      cell: () => null,
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    })
  }

  return columns
})

const resolvedColumns = computed<ColumnDef<TData>[]>(() => {
  const columns = [...systemColumns.value, ...props.columns]

  if (props.showActions) {
    columns.push({
      id: ACTION_COLUMN_ID,
      header: () => null,
      cell: () => null,
      size: 84,
      minSize: 84,
      maxSize: 140,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
    })
  }

  return columns
})

function applyUpdater<T>(updater: Updater<T>, previous: T): T {
  return functionalUpdate(updater, previous)
}

const table = useVueTable({
  get data() {
    return tableData.value
  },
  get columns() {
    return resolvedColumns.value
  },
  getRowId: props.getRowId,
  getSubRows: props.getSubRows,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  get manualFiltering() {
    return props.filteringMode === 'server'
  },
  get manualSorting() {
    return props.sortingMode === 'server'
  },
  get manualPagination() {
    return isServerPagination.value
  },
  get pageCount() {
    if (!isServerPagination.value) return undefined
    if (props.dataSource.pageCount !== undefined) return props.dataSource.pageCount
    if (paginationOptions.value?.pageCount !== undefined) return paginationOptions.value.pageCount
    const total = props.dataSource.total || 0
    return Math.ceil(total / pagination.value.pageSize)
  },
  enableRowSelection: (row) => {
    if (!selectionOptions.value) return false
    return selectionOptions.value.canSelect?.(row.original) ?? true
  },
  get enableMultiRowSelection() {
    return selectionOptions.value?.mode !== 'single'
  },
  get enableGrouping() {
    return props.enableGrouping
  },
  get enableColumnResizing() {
    return props.enableColumnResizing
  },
  columnResizeMode: 'onEnd',
  initialState: {
    columnPinning: {
      left: [SELECT_COLUMN_ID, EXPAND_COLUMN_ID],
      right: [ACTION_COLUMN_ID],
    },
  },
  state: {
    get pagination() {
      return pagination.value
    },
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get columnOrder() {
      return columnOrder.value
    },
    get columnSizing() {
      return columnSizing.value
    },
    get grouping() {
      return grouping.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
  onPaginationChange: (updater) => {
    pagination.value = applyUpdater(updater, pagination.value)
    emit('pagination-change', pagination.value)
  },
  onSortingChange: (updater) => {
    sorting.value = applyUpdater(updater, sorting.value)
    resetToFirstPage()
    emit('sorting-change', sorting.value)
  },
  onColumnFiltersChange: (updater) => {
    columnFilters.value = applyUpdater(updater, columnFilters.value)
    resetToFirstPage()
    emit('filters-change', columnFilters.value)
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = applyUpdater(updater, globalFilter.value)
    resetToFirstPage()
    emit('global-filter-change', globalFilter.value)
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value = applyUpdater(updater, columnVisibility.value)
  },
  onColumnOrderChange: (updater) => {
    columnOrder.value = applyUpdater(updater, columnOrder.value)
  },
  onColumnSizingChange: (updater) => {
    columnSizing.value = applyUpdater(updater, columnSizing.value)
  },
  onGroupingChange: (updater) => {
    grouping.value = applyUpdater(updater, grouping.value)
    resetToFirstPage()
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = applyUpdater(updater, rowSelection.value)
    emit('update:selectedRowIds', rowSelection.value)
    emit(
      'selection-change',
      rowSelection.value,
      table.getSelectedRowModel().flatRows.map((row) => row.original),
    )
  },
})

function resetToFirstPage(): void {
  if (pagination.value.pageIndex !== 0) {
    pagination.value = { ...pagination.value, pageIndex: 0 }
    emit('pagination-change', pagination.value)
  }
}

watch(
  () => props.selectedRowIds,
  (value) => {
    if (value !== undefined) rowSelection.value = value
  },
  { deep: true },
)

const rows = computed(() => table.getRowModel().rows)
const leafColumns = computed(() => table.getVisibleLeafColumns())
const hasSelectableRows = computed(() => rows.value.some((row) => row.getCanSelect()))
const filterHeaders = computed(() => {
  const groups = table.getHeaderGroups()
  return groups[groups.length - 1]?.headers || []
})
const totalRows = computed(() => {
  if (isServerPagination.value) return props.dataSource.total ?? props.dataSource.data.length
  return table.getFilteredRowModel().rows.length
})
const pageCount = computed(() => Math.max(table.getPageCount(), 1))
const visibleFrom = computed(() => {
  if (!totalRows.value) return 0
  return isServerPagination.value
    ? pagination.value.pageIndex * pagination.value.pageSize + 1
    : pagination.value.pageIndex * pagination.value.pageSize + 1
})
const visibleTo = computed(() => Math.min(visibleFrom.value + rows.value.length - 1, totalRows.value))
const isInitialLoading = computed(() => Boolean(props.dataSource.isLoading) && !props.dataSource.data.length)
const showLoadingOverlay = computed(
  () => Boolean(props.dataSource.isFetching || props.dataSource.isLoading) && props.loadingMode === 'overlay',
)
const errorMessage = computed(() => {
  const error = props.dataSource.error
  if (!error) return ''
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  return 'Không thể tải dữ liệu. Vui lòng thử lại.'
})

const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>(
  computed(() => ({
    count: virtualOptions.value ? rows.value.length : 0,
    getScrollElement: () => scrollContainer.value as HTMLDivElement | null,
    estimateSize: () => virtualOptions.value?.estimateRowHeight || 46,
    overscan: virtualOptions.value?.overscan || 8,
    getItemKey: (index) => rows.value[index]?.id || index,
  })),
)
const virtualRows = computed(() => (virtualOptions.value ? virtualizer.value.getVirtualItems() : []))
const topPadding = computed(() => virtualRows.value[0]?.start || 0)
const bottomPadding = computed(() => {
  const last = virtualRows.value[virtualRows.value.length - 1]
  return last ? virtualizer.value.getTotalSize() - last.end : 0
})

function getRowAt(virtualRow: VirtualItem): Row<TData> | undefined {
  return rows.value[virtualRow.index]
}

function measureRow(element: Element | null): void {
  if (element && virtualOptions.value) virtualizer.value.measureElement(element as HTMLTableRowElement)
}

function getColumnMeta(column: Column<TData, unknown>): DataGridColumnMeta<TData, unknown> | undefined {
  return column.columnDef.meta as DataGridColumnMeta<TData, unknown> | undefined
}

function getColumnStyle(column: Column<TData, unknown>): Record<string, string | number> {
  const pinned = column.getIsPinned()
  const style: Record<string, string | number> = {
    width: `${column.getSize()}px`,
    minWidth: `${column.getSize()}px`,
  }

  if (pinned === 'left') {
    style.left = `${column.getStart('left')}px`
  }
  if (pinned === 'right') {
    style.right = `${column.getAfter('right')}px`
  }

  return style
}

function getColumnClasses(column: Column<TData, unknown>, surface: 'head' | 'body' | 'filter'): string {
  const pinned = column.getIsPinned()
  const base = surface === 'head' ? 'bg-muted/90' : surface === 'filter' ? 'bg-muted/65' : 'bg-card'
  if (!pinned) return base

  return [
    base,
    'sticky z-10',
    pinned === 'left' ? 'border-r border-border/80' : 'border-l border-border/80',
    surface === 'head' ? 'z-30' : surface === 'filter' ? 'z-20' : '',
  ].join(' ')
}

function getHeaderLabel(header: Header<TData, unknown>): string {
  const label = getColumnMeta(header.column)?.label
  return label || header.column.id
}

function setColumnFilter(column: Column<TData, unknown>, event: Event): void {
  const target = event.target as HTMLInputElement
  column.setFilterValue(target.value || undefined)
}

function setGlobalFilter(event: Event): void {
  const target = event.target as HTMLInputElement
  table.setGlobalFilter(target.value)
}

function toggleColumnOrder(targetId: string): void {
  const sourceId = draggedColumnId.value
  draggedColumnId.value = null
  if (!sourceId || sourceId === targetId) return

  const currentOrder = table.getAllLeafColumns().map((column) => column.id)
  const sourceIndex = currentOrder.indexOf(sourceId)
  const targetIndex = currentOrder.indexOf(targetId)
  if (sourceIndex < 0 || targetIndex < 0) return

  currentOrder.splice(sourceIndex, 1)
  currentOrder.splice(targetIndex, 0, sourceId)
  table.setColumnOrder(currentOrder)
}

function canReorder(column: Column<TData, unknown>): boolean {
  return (
    props.enableColumnReordering &&
    ![SELECT_COLUMN_ID, EXPAND_COLUMN_ID, ACTION_COLUMN_ID].includes(column.id)
  )
}

function isEditing(cell: Cell<TData, unknown>): boolean {
  return editingCell.value?.rowId === cell.row.id && editingCell.value.columnId === cell.column.id
}

function canEdit(cell: Cell<TData, unknown>): boolean {
  const editable = getColumnMeta(cell.column)?.editable
  if (typeof editable === 'function') return editable(cell.getContext())
  return Boolean(editable)
}

function startEditing(cell: Cell<TData, unknown>): void {
  if (!canEdit(cell)) return

  editingCell.value = { rowId: cell.row.id, columnId: cell.column.id }
  const currentValue = cell.getValue()
  editingValue.value = currentValue === undefined || currentValue === null ? '' : String(currentValue)
}

function getEditInputType(cell: Cell<TData, unknown>): 'text' | 'number' | 'date' {
  return getColumnMeta(cell.column)?.inputType || 'text'
}

function getEditedValue(cell: Cell<TData, unknown>): unknown {
  if (getEditInputType(cell) === 'number') {
    return editingValue.value === '' ? null : Number(editingValue.value)
  }
  return editingValue.value
}

function saveEditing(cell: Cell<TData, unknown>): void {
  if (!isEditing(cell)) return

  emit('cell-update', {
    row: cell.row.original,
    rowId: cell.row.id,
    columnId: cell.column.id,
    value: getEditedValue(cell),
    previousValue: cell.getValue(),
  })
  editingCell.value = null
}

function cancelEditing(): void {
  editingCell.value = null
  editingValue.value = ''
}

function openContextMenu(event: MouseEvent, row: Row<TData>): void {
  const payload: DataGridContextMenu<TData> = {
    row: row.original,
    rowId: row.id,
    clientX: event.clientX,
    clientY: event.clientY,
  }
  contextMenu.value = payload
  emit('row-context-menu', payload, event)
}

function closeContextMenu(): void {
  contextMenu.value = null
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeContextMenu()
    cancelEditing()
  }
}

function snapshotState(): DataGridState {
  return {
    pagination: pagination.value,
    sorting: sorting.value,
    columnFilters: columnFilters.value,
    globalFilter: globalFilter.value,
    columnVisibility: columnVisibility.value,
    columnOrder: columnOrder.value,
    columnSizing: columnSizing.value,
    grouping: grouping.value,
  }
}

function persistState(): void {
  const persist = props.persist
  const state = snapshotState()
  emit('state-change', state)
  if (!persist || !isBrowser()) return

  if (persist.localStorage !== false) {
    window.localStorage.setItem(`data-grid:${persist.key}`, JSON.stringify(state))
  }

  if (persist.url) {
    const url = new URL(window.location.href)
    const params = url.searchParams
    params.set(getQueryKey('page'), String(pagination.value.pageIndex + 1))
    params.set(getQueryKey('pageSize'), String(pagination.value.pageSize))

    const values: Array<[string, unknown]> = [
      ['sort', sorting.value.length ? sorting.value : undefined],
      ['filters', columnFilters.value.length ? columnFilters.value : undefined],
      ['columns', Object.keys(columnVisibility.value).length ? columnVisibility.value : undefined],
      ['q', globalFilter.value || undefined],
    ]
    values.forEach(([key, value]) => {
      const queryKey = getQueryKey(key)
      if (value === undefined) params.delete(queryKey)
      else params.set(queryKey, typeof value === 'string' ? value : JSON.stringify(value))
    })

    window.history.replaceState(window.history.state, '', url.toString())
  }
}

watch(
  [pagination, sorting, columnFilters, globalFilter, columnVisibility, columnOrder, columnSizing, grouping],
  () => persistState(),
  { deep: true },
)

onMounted(() => {
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  if (!isBrowser()) return
  window.removeEventListener('click', closeContextMenu)
  window.removeEventListener('keydown', onDocumentKeydown)
})

function focusEditInput(): void {
  void nextTick(() => {
    const input = gridRoot.value?.querySelector<HTMLInputElement>('[data-data-grid-editor="true"]')
    input?.focus()
    input?.select()
  })
}
</script>

<template>
  <section ref="gridRoot" class="min-w-0 overflow-hidden rounded-xl border border-border bg-card" aria-label="Bảng dữ liệu">
    <div
      v-if="globalFilter || enableGrouping || $slots['toolbar-start'] || $slots['toolbar-end']"
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
              {{ getColumnMeta(column)?.label || column.id }}
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
              <span class="truncate">{{ getColumnMeta(column)?.label || column.id }}</span>
            </label>
          </div>
        </details>
        <slot name="toolbar-end" :table="table" :selected-rows="table.getSelectedRowModel().flatRows" />
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="operations-scrollbar relative overflow-auto"
      :style="virtualOptions ? { maxHeight: `${virtualOptions.height}px` } : undefined"
    >
      <table
        class="w-full table-fixed border-separate border-spacing-0 text-left text-[13px]"
        :style="{ minWidth: `${Math.max(table.getTotalSize(), 720)}px` }"
      >
        <thead class="sticky top-0 z-20 text-xs text-muted-foreground">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              class="relative h-10 border-b border-border px-3 text-left font-semibold"
              :class="getColumnClasses(header.column, 'head')"
              :style="getColumnStyle(header.column)"
            >
              <template v-if="!header.isPlaceholder">
                <div
                  class="flex min-w-0 items-center gap-1"
                  :class="canReorder(header.column) ? 'cursor-grab active:cursor-grabbing' : ''"
                  :draggable="canReorder(header.column)"
                  @dragstart="draggedColumnId = header.column.id"
                  @dragover.prevent="canReorder(header.column)"
                  @drop.prevent="toggleColumnOrder(header.column.id)"
                  @dragend="draggedColumnId = null"
                >
                  <GripVerticalIcon v-if="canReorder(header.column)" class="size-3 shrink-0 text-muted-foreground/55" />

                  <template v-if="header.column.id === SELECT_COLUMN_ID">
                    <input
                      :checked="table.getIsAllPageRowsSelected()"
                      :indeterminate="table.getIsSomePageRowsSelected()"
                      class="size-3.5 rounded border-input text-primary focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="!hasSelectableRows"
                      type="checkbox"
                      aria-label="Chọn tất cả dòng trong trang"
                      @click.stop
                      @change="table.toggleAllPageRowsSelected(($event.target as HTMLInputElement).checked)"
                    />
                  </template>
                  <template v-else-if="header.column.id === EXPAND_COLUMN_ID">
                    <span class="sr-only">Mở rộng dòng</span>
                  </template>
                  <template v-else-if="header.column.id === ACTION_COLUMN_ID">
                    <span class="sr-only">Thao tác</span>
                  </template>
                  <button
                    v-else-if="header.column.getCanSort()"
                    class="-mx-1 flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                    :title="`Sắp xếp theo ${getHeaderLabel(header)}`"
                    @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')"
                  >
                    <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                    <span class="shrink-0 text-primary" aria-hidden="true">
                      {{ header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '' }}
                    </span>
                  </button>
                  <FlexRender v-else :render="header.column.columnDef.header" :props="header.getContext()" />
                </div>

                <button
                  v-if="header.column.getCanResize()"
                  class="data-grid-resizer"
                  :class="header.column.getIsResizing() ? 'is-resizing' : ''"
                  type="button"
                  tabindex="-1"
                  :aria-label="`Đổi độ rộng cột ${getHeaderLabel(header)}`"
                  @dblclick.stop="header.column.resetSize()"
                  @mousedown.stop="header.getResizeHandler()?.($event)"
                  @touchstart.stop="header.getResizeHandler()?.($event)"
                />
              </template>
            </th>
          </tr>

          <tr v-if="filterRow">
            <th
              v-for="header in filterHeaders"
              :key="`${header.id}-filter`"
              class="h-10 border-b border-border px-2 py-1.5"
              :class="getColumnClasses(header.column, 'filter')"
              :style="getColumnStyle(header.column)"
            >
              <input
                v-if="header.column.getCanFilter() && !SYSTEM_COLUMN_IDS.includes(header.column.id)"
                :value="String(header.column.getFilterValue() || '')"
                class="h-7 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                :placeholder="getColumnMeta(header.column)?.filterPlaceholder || `Lọc ${getHeaderLabel(header).toLocaleLowerCase('vi-VN')}`"
                type="search"
                @input="setColumnFilter(header.column, $event)"
              />
            </th>
          </tr>
        </thead>

        <tbody v-if="errorMessage">
          <tr>
            <td :colspan="leafColumns.length" class="p-0">
              <div class="m-4 flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm">
                <CircleAlertIcon class="mt-0.5 size-5 shrink-0 text-destructive" />
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-foreground">Không thể tải dữ liệu</p>
                  <p class="mt-0.5 text-muted-foreground">{{ errorMessage }}</p>
                </div>
                <Button size="sm" variant="outline" @click="emit('retry')">Thử lại</Button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="isInitialLoading && loadingMode === 'skeleton'" aria-busy="true">
          <tr v-for="index in 6" :key="index">
            <td
              v-for="column in leafColumns"
              :key="`${index}-${column.id}`"
              class="h-[46px] border-b border-border px-3"
              :class="getColumnClasses(column, 'body')"
              :style="getColumnStyle(column)"
            >
              <div class="h-3 animate-pulse rounded bg-muted" :class="column.id === SELECT_COLUMN_ID ? 'w-4' : 'w-3/4'" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="!rows.length">
          <tr>
            <td :colspan="leafColumns.length" class="p-0">
              <slot name="empty">
                <div class="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                  <span class="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <InboxIcon class="size-5" />
                  </span>
                  <p class="mt-3 text-sm font-semibold text-foreground">{{ emptyTitle }}</p>
                  <p class="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">{{ emptyDescription }}</p>
                  <slot name="empty-action" />
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-if="virtualOptions && topPadding" aria-hidden="true">
            <td :colspan="leafColumns.length" :style="{ height: `${topPadding}px` }" />
          </tr>

          <template v-if="virtualOptions">
            <tr
              v-for="virtualRow in virtualRows"
              :key="String(virtualRow.key)"
              ref="measureRow"
              :data-index="virtualRow.index"
              class="group transition-colors hover:bg-muted/55 focus-within:bg-muted/55"
              :class="getRowAt(virtualRow)?.getIsSelected() ? 'bg-primary/[0.045]' : ''"
              tabindex="0"
              :aria-selected="getRowAt(virtualRow)?.getIsSelected()"
              @click="getRowAt(virtualRow) && emit('row-click', getRowAt(virtualRow)!.original, $event)"
              @dblclick="getRowAt(virtualRow) && emit('row-double-click', getRowAt(virtualRow)!.original, $event)"
              @keydown.enter.prevent="getRowAt(virtualRow) && emit('row-click', getRowAt(virtualRow)!.original, $event)"
              @contextmenu.prevent="getRowAt(virtualRow) && openContextMenu($event, getRowAt(virtualRow)!)"
            >
              <td
                v-for="cell in getRowAt(virtualRow)?.getVisibleCells() || []"
                :key="cell.id"
                class="h-[46px] border-b border-border px-3 align-middle text-foreground"
                :class="getColumnClasses(cell.column, 'body')"
                :style="getColumnStyle(cell.column)"
                @dblclick.stop="startEditing(cell); focusEditInput()"
              >
                <template v-if="cell.column.id === SELECT_COLUMN_ID">
                  <input
                    :checked="cell.row.getIsSelected()"
                    :disabled="!cell.row.getCanSelect()"
                    class="size-3.5 rounded border-input text-primary focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    type="checkbox"
                    :aria-label="`Chọn dòng ${cell.row.id}`"
                    @click.stop
                    @change="cell.row.toggleSelected(($event.target as HTMLInputElement).checked)"
                  />
                </template>
                <template v-else-if="cell.column.id === EXPAND_COLUMN_ID">
                  <button
                    v-if="cell.row.getCanExpand()"
                    class="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                    :aria-label="cell.row.getIsExpanded() ? 'Thu gọn dòng' : 'Mở rộng dòng'"
                    @click.stop="cell.row.toggleExpanded()"
                  >
                    <ChevronRightIcon class="size-4 transition-transform" :class="cell.row.getIsExpanded() ? 'rotate-90' : ''" />
                  </button>
                </template>
                <template v-else-if="cell.column.id === ACTION_COLUMN_ID">
                  <slot name="actions" :row="cell.row.original" :row-id="cell.row.id" :table="table" />
                </template>
                <template v-else-if="isEditing(cell)">
                  <slot
                    v-if="$slots['edit-cell']"
                    name="edit-cell"
                    :cell="cell"
                    :value="editingValue"
                    :update-value="(value: string) => (editingValue = value)"
                    :save="() => saveEditing(cell)"
                    :cancel="cancelEditing"
                  />
                  <input
                    v-else
                    v-model="editingValue"
                    data-data-grid-editor="true"
                    class="h-7 w-full rounded-md border border-ring bg-background px-2 text-sm outline-none ring-2 ring-ring/20"
                    :type="getEditInputType(cell)"
                    @blur="saveEditing(cell)"
                    @keydown.enter.prevent="saveEditing(cell)"
                    @keydown.esc.prevent="cancelEditing"
                  />
                </template>
                <template v-else-if="cell.getIsGrouped()">
                  <button
                    class="flex min-w-0 items-center gap-1.5 font-semibold text-foreground"
                    type="button"
                    @click.stop="cell.row.toggleExpanded()"
                  >
                    <ChevronRightIcon class="size-3.5 shrink-0 transition-transform" :class="cell.row.getIsExpanded() ? 'rotate-90' : ''" />
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    <span class="text-xs font-medium text-muted-foreground">({{ cell.row.subRows.length }})</span>
                  </button>
                </template>
                <FlexRender
                  v-else-if="cell.getIsAggregated()"
                  :render="cell.column.columnDef.aggregatedCell || cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
                <FlexRender v-else-if="!cell.getIsPlaceholder()" :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </template>

          <template v-else>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="group transition-colors hover:bg-muted/55 focus-within:bg-muted/55"
              :class="row.getIsSelected() ? 'bg-primary/[0.045]' : ''"
              tabindex="0"
              :aria-selected="row.getIsSelected()"
              @click="emit('row-click', row.original, $event)"
              @dblclick="emit('row-double-click', row.original, $event)"
              @keydown.enter.prevent="emit('row-click', row.original, $event)"
              @contextmenu.prevent="openContextMenu($event, row)"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="h-[46px] border-b border-border px-3 align-middle text-foreground"
                :class="getColumnClasses(cell.column, 'body')"
                :style="getColumnStyle(cell.column)"
                @dblclick.stop="startEditing(cell); focusEditInput()"
              >
                <template v-if="cell.column.id === SELECT_COLUMN_ID">
                  <input
                    :checked="cell.row.getIsSelected()"
                    :disabled="!cell.row.getCanSelect()"
                    class="size-3.5 rounded border-input text-primary focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    type="checkbox"
                    :aria-label="`Chọn dòng ${cell.row.id}`"
                    @click.stop
                    @change="cell.row.toggleSelected(($event.target as HTMLInputElement).checked)"
                  />
                </template>
                <template v-else-if="cell.column.id === EXPAND_COLUMN_ID">
                  <button
                    v-if="cell.row.getCanExpand()"
                    class="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                    :aria-label="cell.row.getIsExpanded() ? 'Thu gọn dòng' : 'Mở rộng dòng'"
                    @click.stop="cell.row.toggleExpanded()"
                  >
                    <ChevronRightIcon class="size-4 transition-transform" :class="cell.row.getIsExpanded() ? 'rotate-90' : ''" />
                  </button>
                </template>
                <template v-else-if="cell.column.id === ACTION_COLUMN_ID">
                  <slot name="actions" :row="cell.row.original" :row-id="cell.row.id" :table="table" />
                </template>
                <template v-else-if="isEditing(cell)">
                  <slot
                    v-if="$slots['edit-cell']"
                    name="edit-cell"
                    :cell="cell"
                    :value="editingValue"
                    :update-value="(value: string) => (editingValue = value)"
                    :save="() => saveEditing(cell)"
                    :cancel="cancelEditing"
                  />
                  <input
                    v-else
                    v-model="editingValue"
                    data-data-grid-editor="true"
                    class="h-7 w-full rounded-md border border-ring bg-background px-2 text-sm outline-none ring-2 ring-ring/20"
                    :type="getEditInputType(cell)"
                    @blur="saveEditing(cell)"
                    @keydown.enter.prevent="saveEditing(cell)"
                    @keydown.esc.prevent="cancelEditing"
                  />
                </template>
                <template v-else-if="cell.getIsGrouped()">
                  <button
                    class="flex min-w-0 items-center gap-1.5 font-semibold text-foreground"
                    type="button"
                    @click.stop="cell.row.toggleExpanded()"
                  >
                    <ChevronRightIcon class="size-3.5 shrink-0 transition-transform" :class="cell.row.getIsExpanded() ? 'rotate-90' : ''" />
                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    <span class="text-xs font-medium text-muted-foreground">({{ cell.row.subRows.length }})</span>
                  </button>
                </template>
                <FlexRender
                  v-else-if="cell.getIsAggregated()"
                  :render="cell.column.columnDef.aggregatedCell || cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
                <FlexRender v-else-if="!cell.getIsPlaceholder()" :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </template>

          <tr v-if="virtualOptions && bottomPadding" aria-hidden="true">
            <td :colspan="leafColumns.length" :style="{ height: `${bottomPadding}px` }" />
          </tr>
        </tbody>
      </table>

      <div
        v-if="showLoadingOverlay"
        class="absolute inset-0 z-40 grid place-items-center bg-card/70 backdrop-blur-[1px]"
        aria-live="polite"
        aria-label="Đang tải dữ liệu"
      >
        <span class="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm">
          <LoaderCircleIcon class="size-4 animate-spin text-primary" />
          Đang tải dữ liệu
        </span>
      </div>
    </div>

    <footer v-if="paginationOptions" class="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p class="tabular-nums text-muted-foreground">
        {{ visibleFrom }}–{{ visibleTo }} trong {{ totalRows }} bản ghi
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex items-center gap-2 text-muted-foreground">
          <span class="whitespace-nowrap">Mỗi trang</span>
          <select
            :value="pagination.pageSize"
            class="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            @change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="size in paginationOptions.pageSizeOptions" :key="size" :value="size">{{ size }}</option>
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

    <div
      v-if="contextMenu && $slots['context-menu']"
      class="fixed z-[60] min-w-44 rounded-lg border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
      role="menu"
      :style="{ left: `${contextMenu.clientX}px`, top: `${contextMenu.clientY}px` }"
      @click.stop
    >
      <slot name="context-menu" :row="contextMenu.row" :row-id="contextMenu.rowId" :close="closeContextMenu" />
    </div>
  </section>
</template>

<style scoped>
.data-grid-resizer {
  background: transparent;
  cursor: col-resize;
  height: 100%;
  position: absolute;
  right: -4px;
  top: 0;
  width: 8px;
  z-index: 40;
}

.data-grid-resizer::after {
  background: transparent;
  bottom: 8px;
  content: '';
  position: absolute;
  right: 3px;
  top: 8px;
  transition: background-color 150ms ease;
  width: 2px;
}

.data-grid-resizer:hover::after,
.data-grid-resizer.is-resizing::after {
  background: var(--primary);
}

@media (prefers-reduced-motion: reduce) {
  .data-grid-resizer::after {
    transition: none;
  }
}
</style>
