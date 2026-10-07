<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Báo giá</h1>
        <p class="mt-1 text-sm text-muted-foreground">Lập, gửi và theo dõi báo giá thuê xe.</p>
      </div>
      <Button v-if="canManage" @click="router.push({ name: 'quotations-create' })">
        <Plus class="size-4" />
        Tạo báo giá
      </Button>
    </header>

    <DataGrid
      :data-source="dataSource"
      :columns="quotationColumns"
      width="100%"
      height="calc(100svh - 250px)"
      :pagination="{ mode: 'client', pageSize: 10, pageSizeOptions: [10, 25, 50] }"
      filtering-mode="client"
      sorting-mode="client"
      :filter-row="isFilterRowVisible"
      global-filter
      show-actions
      :get-row-id="(quotation) => String(quotation.id)"
      :persist="{ key: 'rental-quotations', url: true, queryPrefix: 'quotation' }"
      empty-title="Chưa có báo giá"
      empty-description="Các báo giá thuê xe sẽ hiển thị tại đây khi có dữ liệu."
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
          <span class="whitespace-nowrap">Từ ngày báo giá</span>
          <Input v-model="dateRange.from" type="date" class="w-40" aria-label="Từ ngày báo giá" />
        </label>
        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="whitespace-nowrap">Đến ngày báo giá</span>
          <Input v-model="dateRange.to" type="date" class="w-40" aria-label="Đến ngày báo giá" />
        </label>
      </template>

      <template #actions="{ row }">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop>
              <span class="sr-only">Mở thao tác báo giá</span>
              <MoreHorizontal class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="min-w-40 gap-2"
              @click="router.push({ name: 'quotations-detail', params: { id: row.id } })"
            >
              <Eye class="size-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && isQuotationDraft(row.status)"
              class="min-w-40 gap-2"
              @click="router.push({ name: 'quotations-edit', params: { id: row.id } })"
            >
              <PencilLine class="size-4" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && canSendQuotation(row)"
              class="min-w-40 gap-2"
              @click="send(row.id)"
            >
              <Send class="size-4" />
              Gửi email
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && canRecordQuotationByPhone(row)"
              class="min-w-40 gap-2"
              @click="phoneResponse(row.id)"
            >
              <Phone class="size-4" />
              Ghi nhận gọi điện
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && canExpireQuotation(row.status)"
              class="min-w-40 gap-2"
              @click="expire(row.id)"
            >
              <Clock3 class="size-4" />
              Đánh dấu hết hạn
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canManage && isQuotationDraft(row.status)"
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
  canExpireQuotation,
  canRecordQuotationByPhone,
  canSendQuotation,
  filterByDateRange,
  isQuotationDraft,
  type DateRange,
} from '@/modules/rental/rental-table'
import { useQuotationsQuery, useRentalMutations } from '@/modules/rental/rental.composables'
import { quotationColumns } from '@/modules/rental/quotation/components/quotation-column'
import type { Quotation } from '@/modules/rental/rental.types'
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
import {
  Clock3,
  Eye,
  Filter,
  MoreHorizontal,
  PencilLine,
  Phone,
  Plus,
  Send,
  Trash2,
} from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const auth = useAuthStore()
const query = useQuotationsQuery()
const mutations = useRentalMutations()
const canManage = computed(() => auth.user?.permissions.includes('quotations.manage') ?? false)
const isFilterRowVisible = ref(true)
const dateRange = reactive<DateRange>({ from: '', to: '' })

const dataSource = computed<DataGridDataSource<Quotation>>(() => ({
  data: filterByDateRange(
    query.data.value ?? [],
    (quotation) => quotation.quotation_date,
    dateRange,
  ),
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))

async function send(id: number) {
  try {
    await mutations.sendQuotation.mutateAsync(id)
    toast.success('Đã gửi báo giá qua email.')
  } catch {
    toast.error('Không thể gửi báo giá.')
  }
}

async function expire(id: number) {
  if (!window.confirm('Đánh dấu báo giá hết hạn?')) return

  try {
    await mutations.expireQuotation.mutateAsync(id)
    toast.success('Đã cập nhật trạng thái hết hạn.')
  } catch {
    toast.error('Không thể cập nhật báo giá.')
  }
}

async function remove(id: number) {
  if (!window.confirm('Xóa báo giá nháp này?')) return

  try {
    await mutations.deleteQuotation.mutateAsync(id)
    toast.success('Đã xóa báo giá.')
  } catch {
    toast.error('Không thể xóa báo giá.')
  }
}

async function phoneResponse(id: number) {
  const accepted = window.confirm('Khách hàng đồng ý báo giá? Chọn “Hủy” để ghi nhận từ chối.')
  const note = window.prompt('Ghi chú cuộc gọi (không bắt buộc):') ?? undefined

  try {
    await mutations.recordCustomerResponse.mutateAsync({ id, accepted, note })
    toast.success(accepted ? 'Đã ghi nhận khách đồng ý.' : 'Đã ghi nhận khách từ chối.')
  } catch {
    toast.error('Không thể ghi nhận phản hồi.')
  }
}
</script>
