import type {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnSizingState,
  GroupingState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'

export interface DataGridColumnMeta<TData extends RowData, TValue> {
  /** Nhãn dùng trong trình chọn cột và hàng bộ lọc. */
  label?: string
  /** Cho phép sửa trực tiếp ô, hoặc quyết định theo từng ô. */
  editable?: boolean | ((context: CellContext<TData, TValue>) => boolean)
  /** Kiểu input mặc định khi sửa trực tiếp ô. */
  inputType?: 'text' | 'number' | 'date'
  /** Placeholder cho bộ lọc của cột. */
  filterPlaceholder?: string
}

export type DataGridColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<TData, TValue> & {
  /** Chiều rộng ban đầu của cột (px). Ưu tiên hơn `size` của TanStack và vẫn có thể resize. */
  width?: number
  /** Chiều rộng tối thiểu khi resize (px). Ưu tiên hơn `minSize` của TanStack. */
  minWidth?: number
  /** Chiều rộng tối đa khi resize (px). Ưu tiên hơn `maxSize` của TanStack. */
  maxWidth?: number
  /** Chiều cao tối thiểu của vùng nội dung trong ô dữ liệu (px). */
  height?: number
  /** Căn nội dung các ô dữ liệu trong cột. */
  align?: 'left' | 'center' | 'right'
  /** Cố định cột ở mép bảng khi cuộn ngang. */
  fixed?: 'left' | 'right'
  meta?: DataGridColumnMeta<TData, TValue>
}

export type DataGridOperationMode = 'client' | 'server'

/**
 * Chuẩn hoá dữ liệu cho cả fake data lẫn dữ liệu từ TanStack Query/API.
 * Khi dùng phân trang server, `data` chỉ là các dòng của trang hiện tại.
 */
export interface DataGridDataSource<TData> {
  data: TData[]
  total?: number
  pageCount?: number
  isLoading?: boolean
  isFetching?: boolean
  error?: unknown
}

export interface DataGridPaginationOptions {
  mode?: DataGridOperationMode
  pageSize?: number
  pageSizeOptions?: number[]
  /** Tổng số trang nếu API trả về trực tiếp. */
  pageCount?: number
}

export interface DataGridSelectionOptions<TData> {
  mode?: 'single' | 'multiple'
  /** Trả về false để khoá checkbox của dòng đó. */
  canSelect?: (row: TData) => boolean
}

export interface DataGridVirtualOptions {
  height?: number
  estimateRowHeight?: number
  overscan?: number
}

export interface DataGridPersistOptions {
  /** Khoá localStorage riêng cho từng bảng. */
  key: string
  /** Mặc định true. */
  localStorage?: boolean
  /** Đồng bộ page, sort, filter và cột ẩn vào URL. Mặc định false. */
  url?: boolean
  /** Dùng khi một trang có nhiều data-grid; mặc định không thêm tiền tố. */
  queryPrefix?: string
}

export interface DataGridState {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  columnVisibility: VisibilityState
  columnOrder: ColumnOrderState
  columnSizing: ColumnSizingState
  grouping: GroupingState
}

export interface DataGridCellUpdate<TData> {
  row: TData
  rowId: string
  columnId: string
  value: unknown
  previousValue: unknown
}

export interface DataGridContextMenu<TData> {
  row: TData
  rowId: string
  clientX: number
  clientY: number
}

export type DataGridSelectionState = RowSelectionState
