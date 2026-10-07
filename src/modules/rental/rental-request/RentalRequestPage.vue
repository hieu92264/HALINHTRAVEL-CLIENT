<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Yêu cầu thuê xe</h1>
        <p class="mt-1 text-sm text-muted-foreground">Theo dõi và xử lý yêu cầu thuê xe.</p>
      </div>
      <Button v-if="canManage" @click="router.push({ name: 'rental-requests-create' })">
        <Plus class="size-4" />
        Tạo yêu cầu
      </Button>
    </header>

    <DataGrid
      :data-source="dataSource"
      :columns="rentalRequestColumns"
      width="100%"
      height="calc(100svh - 250px)"
      :pagination="{ mode: 'client', pageSize: 10, pageSizeOptions: [10, 25, 50] }"
      filtering-mode="client"
      sorting-mode="client"
      :filter-row="isFilterRowVisible"
      global-filter
      show-actions
      :get-row-id="(request) => String(request.id)"
      :persist="{ key: 'rental-requests', url: true, queryPrefix: 'rentalRequest' }"
      empty-title="Chưa có yêu cầu thuê xe"
      empty-description="Các yêu cầu thuê xe sẽ hiển thị tại đây khi có dữ liệu."
      @retry="query.refetch()"
    >
      <template #toolbar-start>
        <Button
          variant="outline"
          :class="
            isFilterRowVisible
              ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
              : ''
          "
          @click="isFilterRowVisible = !isFilterRowVisible"
        >
          <Filter class="size-4" />
          Lọc
        </Button>
        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="whitespace-nowrap">Từ ngày tiếp nhận</span>
          <Input v-model="dateRange.from" type="date" class="w-40" aria-label="Từ ngày tiếp nhận" />
        </label>
        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="whitespace-nowrap">Đến ngày tiếp nhận</span>
          <Input v-model="dateRange.to" type="date" class="w-40" aria-label="Đến ngày tiếp nhận" />
        </label>
      </template>

      <template #actions="{ row }">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop>
              <span class="sr-only">Mở thao tác yêu cầu thuê xe</span>
              <MoreHorizontal class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="min-w-40 gap-2"
              @click="router.push({ name: 'rental-requests-detail', params: { id: row.id } })"
            >
              <Eye class="size-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && isRentalRequestMutable(row.status)"
              class="min-w-40 gap-2"
              @click="router.push({ name: 'rental-requests-edit', params: { id: row.id } })"
            >
              <PencilLine class="size-4" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && isRentalRequestMutable(row.status)"
              variant="destructive"
              class="min-w-40 gap-2"
              @click="remove(row.id)"
            >
              <Trash2 class="size-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </template>
    </DataGrid>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import {
  filterByDateRange,
  isRentalRequestMutable,
  type DateRange,
} from '@/modules/rental/rental-table'
import { useRentalMutations, useRentalRequestsQuery } from '@/modules/rental/rental.composables'
import { rentalRequestColumns } from '@/modules/rental/rental-request/components/rental-request-column'
import type { RentalRequest } from '@/modules/rental/rental.types'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import { Eye, Filter, MoreHorizontal, PencilLine, Plus, Trash2 } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const auth = useAuthStore()
const query = useRentalRequestsQuery()
const mutations = useRentalMutations()
const canManage = computed(() => auth.user?.permissions.includes('rental-requests.manage') ?? false)
const isFilterRowVisible = ref(true)
const dateRange = reactive<DateRange>({ from: '', to: '' })

const dataSource = computed<DataGridDataSource<RentalRequest>>(() => ({
  data: filterByDateRange(query.data.value ?? [], (request) => request.requested_at, dateRange),
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))

async function remove(id: number) {
  if (!window.confirm('Xóa yêu cầu thuê xe này?')) return

  try {
    await mutations.deleteRequest.mutateAsync(id)
    toast.success('Đã xóa yêu cầu thuê.')
  } catch {
    toast.error('Không thể xóa yêu cầu thuê.')
  }
}
</script>
