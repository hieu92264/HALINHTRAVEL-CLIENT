# DataGrid

`DataGrid` là bảng dữ liệu dùng chung cho các màn hình vận hành. Component dùng TanStack Table cho state và logic bảng, còn giao diện dùng token/shadcn-ui của dự án.

```ts
import { DataGrid } from '@/shared/components/data-grid'
import type {
  DataGridColumnDef,
  DataGridDataSource,
  DataGridSelectionState,
} from '@/shared/components/data-grid'
```

Mỗi module nên đặt khai báo cột trong `components/column.ts` (hoặc `components/user.columns.ts`) và giữ phần gọi API, mutation, toast ở page/container. `DataGrid` chỉ nhận dữ liệu và phát event; nó không tự gọi API hay tự thay đổi dữ liệu nguồn.

## Bắt đầu nhanh

Ví dụ với dữ liệu giả lập. `dataSource` luôn có `data`; các trường còn lại chỉ cần khi có loading/error hoặc phân trang server.

```ts
// src/modules/organization/user/components/column.ts
import type { DataGridColumnDef } from '@/shared/components/data-grid'

export type UserRow = {
  id: number
  user_name: string
  email: string
  is_active: boolean
  last_login_at: string | null
  roles: string[]
}

export const userColumns: DataGridColumnDef<UserRow>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => row.index + 1,
    size: 64,
    fixed: 'left',
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'STT' },
  },
  {
    accessorKey: 'is_active',
    header: 'Trạng thái',
    cell: ({ getValue }) => ((getValue() as boolean) ? 'Đang hoạt động' : 'Đã vô hiệu hóa'),
    meta: { label: 'Trạng thái', filterPlaceholder: 'Lọc trạng thái' },
  },
  {
    accessorKey: 'user_name',
    header: 'Tên đăng nhập',
    meta: { label: 'Tên đăng nhập', editable: true },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { label: 'Email', editable: true },
  },
  {
    accessorKey: 'last_login_at',
    header: 'Đăng nhập gần nhất',
    cell: ({ getValue }) => (getValue() as string | null) || 'Chưa đăng nhập',
    meta: { label: 'Đăng nhập gần nhất' },
  },
  {
    accessorKey: 'roles',
    header: 'Vai trò',
    cell: ({ getValue }) => (getValue() as string[]).join(', '),
    fixed: 'right',
    meta: { label: 'Vai trò' },
  },
]
```

```vue
<!-- src/modules/organization/user/components/UserTable.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/shared/components/ui/button'
import { DataGrid } from '@/shared/components/data-grid'
import { userColumns, type UserRow } from './column'

const users = ref<UserRow[]>([
  {
    id: 1,
    user_name: 'admin',
    email: 'admin@halinhtravel.com',
    is_active: true,
    last_login_at: '2026-09-28 08:00',
    roles: ['admin'],
  },
])

const dataSource = computed(() => ({ data: users.value }))

function openDetail(user: UserRow): void {
  // router.push({ name: 'user-detail', params: { id: user.id } })
  console.info(user)
}
</script>

<template>
  <DataGrid
    :columns="userColumns"
    :data-source="dataSource"
    :pagination="{ mode: 'client', pageSize: 25 }"
    :selection="{ canSelect: (user) => user.is_active }"
    filter-row
    global-filter
    show-actions
    :get-row-id="(user) => String(user.id)"
    @row-double-click="openDetail"
  >
    <template #toolbar-start="{ selectedRows }">
      <span class="text-sm text-muted-foreground">Đã chọn: {{ selectedRows.length }}</span>
    </template>

    <template #actions="{ row }">
      <Button size="icon-xs" variant="ghost" :aria-label="`Xem ${row.user_name}`" @click="openDetail(row)">
        Xem
      </Button>
    </template>
  </DataGrid>
</template>
```

## Data source và phân trang server

Khi API phân trang, `data` chỉ chứa bản ghi của trang hiện tại. Truyền `total` hoặc `pageCount` để DataGrid tính số trang. Các event `pagination-change`, `sorting-change`, `filters-change` và `global-filter-change` là đầu vào để cập nhật query API.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { DataGrid } from '@/shared/components/data-grid'
import { userColumns, type UserRow } from './column'
import { usersApi } from '../api'

const request = ref({
  page: 1,
  perPage: 25,
  sorting: [] as Array<{ id: string; desc: boolean }>,
  filters: [] as Array<{ id: string; value: unknown }>,
  query: '',
})

const usersQuery = useQuery({
  queryKey: computed(() => ['users', request.value]),
  queryFn: () => usersApi.list(request.value),
})

const dataSource = computed(() => ({
  data: (usersQuery.data.value?.metadata.data || []) as UserRow[],
  total: usersQuery.data.value?.metadata.total,
  isLoading: usersQuery.isLoading.value,
  isFetching: usersQuery.isFetching.value,
  error: usersQuery.error.value,
}))
</script>

<template>
  <DataGrid
    :columns="userColumns"
    :data-source="dataSource"
    :pagination="{ mode: 'server', pageSize: request.perPage }"
    filtering-mode="server"
    sorting-mode="server"
    filter-row
    global-filter
    :get-row-id="(user) => String(user.id)"
    @pagination-change="({ pageIndex, pageSize }) => {
      request.page = pageIndex + 1
      request.perPage = pageSize
    }"
    @sorting-change="(sorting) => (request.sorting = sorting)"
    @filters-change="(filters) => (request.filters = filters)"
    @global-filter-change="(query) => (request.query = query)"
    @retry="usersQuery.refetch()"
  />
</template>
```

Với API server, nên debounce `filters-change` và `global-filter-change` ở page/composable trước khi gọi query. API cần nhận `page` theo chỉ số bắt đầu từ 1, trong khi DataGrid dùng `pageIndex` bắt đầu từ 0.

## Props và types

| Prop | Kiểu | Mặc định | Mục đích |
| --- | --- | --- | --- |
| `data-source` | `DataGridDataSource<T>` | bắt buộc | `{ data, total?, pageCount?, isLoading?, isFetching?, error? }`. Dùng cho fake data hoặc query/API. |
| `columns` | `DataGridColumnDef<T>[]` | bắt buộc | Các cột nghiệp vụ, nên khai báo ở `column.ts`. |
| `pagination` | `false \| DataGridPaginationOptions` | tắt | Bật phân trang với `mode: 'client' \| 'server'`, `pageSize`, `pageSizeOptions`, `pageCount`. |
| `filtering-mode` | `'client' \| 'server'` | `'client'` | Lọc bằng TanStack tại client hoặc phát event để API lọc. |
| `sorting-mode` | `'client' \| 'server'` | `'client'` | Sắp xếp tại client hoặc phát event để API sắp xếp. |
| `filter-row` | `boolean` | `false` | Hiện input lọc từng cột dưới header. |
| `global-filter` | `boolean` | `false` | Hiện ô tìm nhanh trên toolbar. |
| `selection` | `boolean \| DataGridSelectionOptions<T>` | `false` | Checkbox cố định bên trái. Dùng `mode: 'single'` hoặc `canSelect(row)`. |
| `selected-row-ids` | `RowSelectionState` | nội bộ | Dùng cùng `v-model:selected-row-ids` khi trang cha kiểm soát selection. |
| `show-actions` | `boolean` | `false` | Hiện cột thao tác cố định bên phải; nội dung từ slot `actions`. |
| `get-sub-rows` | `(row, index) => T[] \| undefined` | — | Bật dữ liệu cây/subrow và cột mở rộng cố định bên trái. |
| `expanded-row-id` | `string \| null` | — | Dùng cùng `v-model:expanded-row-id` để chọn main row đang hiện nội dung từ slot `row-detail`. DataGrid hiện cột mũi tên cố định bên trái và không lưu state này vào `persist`. |
| `get-row-id` | `(row, index, parent?) => string` | index | Cung cấp khoá ổn định cho selection, virtual và cập nhật dòng. |
| `enable-grouping` | `boolean` | `false` | Hiện chọn nhóm. Cột có thể khai báo `aggregationFn`/`aggregatedCell` của TanStack. |
| `enable-column-resizing` | `boolean` | `true` | Kéo cạnh header để thay đổi chiều rộng. Double-click để reset. |
| `enable-column-reordering` | `boolean` | `true` | Kéo header để đổi thứ tự các cột nghiệp vụ. |
| `virtual` | `boolean \| DataGridVirtualOptions` | `false` | Virtual rows: `height`, `estimateRowHeight`, `overscan`. |
| `persist` | `DataGridPersistOptions` | — | Lưu state vào localStorage và/hoặc URL. |
| `loading-mode` | `'skeleton' \| 'overlay'` | `'skeleton'` | Skeleton khi tải trang đầu hoặc overlay khi refetch. |
| `empty-title`, `empty-description` | `string` | thông điệp mặc định | Nội dung empty state mặc định. |

`DataGridColumnDef` mở rộng `ColumnDef` của TanStack với các trường hiển thị, `fixed` và `meta` sau:

| Trường | Mục đích |
| --- | --- |
| `width` | Chiều rộng ban đầu theo px. Ưu tiên hơn `size` của TanStack, nhưng vẫn kéo resize được. |
| `minWidth` | Chiều rộng tối thiểu khi resize (px). Ưu tiên hơn `minSize` của TanStack. |
| `maxWidth` | Chiều rộng tối đa khi resize (px). Ưu tiên hơn `maxSize` của TanStack. |
| `height` | Chiều cao tối thiểu theo px cho nội dung ô dữ liệu. Hàng sẽ lấy chiều cao lớn nhất giữa các cột. |
| `align` | Căn nội dung ô: `left`, `center` hoặc `right`; mặc định `left`. |

Nội dung ô dữ liệu mặc định hiển thị một dòng, phần vượt quá được rút gọn bằng `…`. Rê chuột hoặc focus vào nội dung để xem giá trị đầy đủ qua tooltip native. Các ô hệ thống như checkbox, mở rộng dòng và thao tác không bị rút gọn.

Khai báo `fixed: 'left'` hoặc `fixed: 'right'` trực tiếp trên cột để cố định cột đó khi cuộn ngang. Các cột fixed giữ nguyên thứ tự khai báo, không thể kéo để đổi thứ tự và không được lưu vào state persist.

| `meta` | Mục đích |
| --- | --- |
| `label` | Tên thân thiện trong bộ chọn cột và filter row. |
| `filterPlaceholder` | Placeholder riêng của bộ lọc cột. |
| `editable` | `true` hoặc hàm `(context) => boolean` để bật inline editing. |
| `inputType` | Input mặc định: `text`, `number` hoặc `date`. |

## Slots và events

| Slot | Slot props | Mục đích |
| --- | --- | --- |
| `toolbar-start` | `table`, `selectedRows` | Phần đầu toolbar: tạo mới, bulk action, thống kê selection. |
| `toolbar-end` | `table`, `selectedRows` | Phần cuối toolbar: import/export Excel hoặc công cụ riêng. |
| `actions` | `row`, `rowId`, `table` | Nút xem, sửa, xoá, copy trong cột action cố định. |
| `row-detail` | `row`, `rowId` | Nội dung chi tiết trong một hàng thụt vào ngay sau main row đang có ID khớp `expanded-row-id`. Không hỗ trợ khi bật `virtual`. |
| `edit-cell` | `cell`, `value`, `updateValue`, `save`, `cancel` | Editor riêng cho kiểu dữ liệu phức tạp. Không cung cấp slot thì dùng input theo `meta.inputType`. |
| `empty` | — | Thay hoàn toàn empty state. |
| `empty-action` | — | Nút thao tác thêm trong empty state mặc định. |
| `context-menu` | `row`, `rowId`, `close` | Menu xuất hiện khi click chuột phải lên dòng. |

| Event | Payload | Khi dùng |
| --- | --- | --- |
| `update:selected-row-ids` | `RowSelectionState` | V-model selection. |
| `selection-change` | `state, rows` | Cập nhật bulk action. |
| `pagination-change` | `PaginationState` | Đồng bộ phân trang server. |
| `sorting-change` | `SortingState` | Đồng bộ sort server. |
| `filters-change` | `ColumnFiltersState` | Đồng bộ filter server. |
| `global-filter-change` | `string` | Đồng bộ tìm nhanh server. |
| `state-change` | `DataGridState` | Theo dõi state đã persist. |
| `row-click` | `row, event` | Mở drawer/detail. |
| `row-double-click` | `row, event` | Mở detail bằng double-click. |
| `row-context-menu` | `payload, event` | Bổ sung hành vi ngoài menu slot nếu cần. |
| `cell-update` | `DataGridCellUpdate<T>` | Nhận thay đổi inline edit để mutation/cập nhật data nguồn. |
| `retry` | — | Thử tải lại sau error state. |

## Row detail

`get-sub-rows` dùng cho cấu trúc dữ liệu cây: dòng con phải có cùng kiểu dữ liệu và tham gia sort/filter như một row. Với thông tin nghiệp vụ mở rộng, dùng `row-detail` để render một ô trải hết các cột ngay sau main row. DataGrid tự hiện nút mũi tên mở/đóng; nút này phát `update:expanded-row-id` và không phát `row-click`.

Không kết hợp `get-sub-rows` và `row-detail` trên cùng DataGrid ở v1: cột mũi tên ưu tiên điều khiển cấu trúc cây khi `get-sub-rows` được truyền vào.

```vue
<script setup lang="ts">
const expandedRowId = ref<string | null>(null)

function toggleRow(user: UserRow): void {
  const rowId = String(user.id)
  expandedRowId.value = expandedRowId.value === rowId ? null : rowId
}
</script>

<DataGrid
  v-model:expanded-row-id="expandedRowId"
  :columns="userColumns"
  :data-source="dataSource"
  :get-row-id="(user) => String(user.id)"
  @row-click="toggleRow"
>
  <template #row-detail="{ row }">
    <section class="p-4">Chi tiết {{ row.user_name }}</section>
  </template>
</DataGrid>
```

## Inline edit và context menu

`DataGrid` không mutate `dataSource.data`. Sau `cell-update`, page cha cần validate, gọi API và thay mảng dữ liệu bằng bản sao mới.

```vue
<DataGrid
  :columns="userColumns"
  :data-source="dataSource"
  show-actions
  @cell-update="async ({ rowId, columnId, value }) => {
    await usersApi.update(rowId, { [columnId]: value })
    await usersQuery.refetch()
  }"
>
  <template #context-menu="{ row, close }">
    <button class="block w-full rounded px-2 py-1.5 text-left hover:bg-muted" @click="openDetail(row); close()">
      Xem chi tiết
    </button>
    <button class="block w-full rounded px-2 py-1.5 text-left text-destructive hover:bg-muted" @click="removeUser(row); close()">
      Xóa tài khoản
    </button>
  </template>
</DataGrid>
```

## Lưu state

`persist` lưu pagination, sorting, filters, global filter, visibility, thứ tự cột, kích thước cột và grouping vào localStorage. Khi đặt `url: true`, page, pageSize, sort, filters, cột ẩn và tìm nhanh cũng đồng bộ vào URL để F5 hoặc chia sẻ link vẫn giữ ngữ cảnh.

Khi kéo để đổi độ rộng cột, bảng cập nhật trực tiếp để giữ thao tác mượt; kích thước cuối cùng và event `state-change` chỉ được lưu/phát sau khi thả chuột hoặc kết thúc thao tác cảm ứng.

```vue
<DataGrid
  :columns="userColumns"
  :data-source="dataSource"
  :pagination="{ mode: 'server' }"
  :persist="{
    key: 'organization-users',
    url: true,
    queryPrefix: 'users',
  }"
/>
```

Với `queryPrefix: 'users'`, URL dùng các key như `users_page`, `users_sort`. Nếu trang chỉ có một DataGrid, có thể bỏ `queryPrefix` để dùng `page`, `sort`, `filters` ngắn gọn.

## Lưu ý vận hành

- Luôn truyền `get-row-id` ổn định từ khoá nghiệp vụ, ví dụ `String(user.id)`; không dựa vào index khi có sort, filter hoặc pagination server.
- Bật `virtual` khi mỗi trang có nhiều dòng (thường từ khoảng 200 dòng trở lên). Với dữ liệu ít, không bật để giữ chiều cao dòng tự nhiên và đơn giản hơn.
- `persist.key` phải duy nhất cho từng DataGrid. Dùng `queryPrefix` khi cùng trang có từ hai bảng trở lên.
- Cột selection, expand và action được ghim ở biên bảng; cột nghiệp vụ có `fixed` cũng được ghim và không thể đổi thứ tự.
- Với filter/search server, debounce ở page/composable để tránh gọi API mỗi lần gõ phím.
- Thiết kế action nên ưu tiên thao tác thường dùng; các thao tác ít dùng có thể đặt trong context menu.
