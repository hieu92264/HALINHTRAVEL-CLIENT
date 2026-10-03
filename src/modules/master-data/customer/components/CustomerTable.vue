<template>
  <DataGrid
    :data-source="dataSource"
    :columns="customerColumns"
    width="100%"
    height="calc(100svh - 250px)"
    :pagination="{ mode: 'client', pageSize: 25 }"
    filtering-mode="client"
    sorting-mode="client"
    :filter-row="isFilterRowVisible"
    show-actions
    :get-row-id="(customer) => String(customer.id)"
    :persist="{ key: 'master-data-customers', url: true }"
    empty-title="Chưa có khách hàng"
    empty-description="Danh sách khách hàng sẽ hiển thị tại đây khi có dữ liệu."
    @retry="customersQuery.refetch()"
  >
    <template #toolbar-start>
      <Button
        variant="outline"
        :class="isFilterRowVisible ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15' : ''"
        @click="isFilterRowVisible = !isFilterRowVisible"
      >
        <Filter class="size-4" />
        Lọc
      </Button>
    </template>

    <template #toolbar-end>
      <Button @click="emit('create')">
        <Plus class="size-4" />
        Thêm khách hàng
      </Button>
    </template>

    <template #actions="{ row }">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop>
            <span class="sr-only">Mở thao tác khách hàng</span>
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="min-w-40 gap-2" @click="emit('edit', row)">
            <PencilLine class="size-4" />
            Cập nhật
          </DropdownMenuItem>

          <DropdownMenuItem
            v-if="row.is_active"
            variant="destructive"
            class="min-w-40 gap-2"
            @click="emit('deactivate', row)"
          >
            <Trash2 class="size-4" />
            Ngừng hoạt động
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
import { customerColumns } from '@/modules/master-data/customer/components/customer-column'
import { useCustomerQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import type { Customer } from '@/modules/master-data/master-data.type'
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
import { Filter, MoreHorizontal, PencilLine, Plus, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'

const emit = defineEmits<{
  create: []
  edit: [customer: Customer]
  deactivate: [customer: Customer]
}>()

const customersQuery = useCustomerQuery()

const isFilterRowVisible = ref(true)

const dataSource = computed<DataGridDataSource<Customer>>(() => ({
  data: customersQuery.data.value ?? [],
  isLoading: customersQuery.isLoading.value,
  isFetching: customersQuery.isFetching.value,
  error: customersQuery.error.value,
}))
</script>
