<template>
  <DataGrid
    :data-source="dataSource"
    :columns="routeColumns"
    width="100%"
    height="calc(100svh - 250px)"
    :pagination="{ mode: 'client', pageSize: 25 }"
    filtering-mode="client"
    sorting-mode="client"
    :filter-row="isFilterRowVisible"
    show-actions
    :get-row-id="(route) => String(route.id)"
    v-model:expanded-row-id="expandedRowId"
    :persist="{ key: 'master-data-routes', url: true }"
    empty-title="Chưa có tuyến xe"
    empty-description="Danh sách tuyến xe sẽ hiển thị tại đây khi có dữ liệu."
    @retry="routesQuery.refetch()"
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
        Thêm tuyến xe
      </Button>
    </template>

    <template #actions="{ row }">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="h-full min-h-11.5 w-full rounded-none p-0" @click.stop>
            <span class="sr-only">Mở thao tác tuyến xe</span>
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

    <template #row-detail="{ row }">
      <RouteRateSubtable
        :rates="routeRatesByRouteId.get(row.id) ?? []"
        :is-loading="routeRatesQuery.isLoading.value"
        :error="routeRatesQuery.error.value"
        :can-manage="canManageRates"
        @create="emit('create-rate', row)"
        @edit="emit('edit-rate', $event)"
        @deactivate="emit('deactivate-rate', $event)"
      />
    </template>
  </DataGrid>
</template>

<script setup lang="ts">
import { routeColumns } from '@/modules/master-data/route/components/route-column'
import { useRouteQuery } from '@/modules/master-data/route/composables/useRouteQueries'
import RouteRateSubtable from '@/modules/master-data/route/components/RouteRateSubtable.vue'
import { useRouteRateQuery } from '@/modules/master-data/route-rate/composables/useRouteRateQueries'
import type { Route, RouteRate } from '@/modules/master-data/master-data.type'
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

const props = defineProps<{ canManageRates: boolean }>()

const emit = defineEmits<{
  create: []
  edit: [route: Route]
  deactivate: [route: Route]
  'create-rate': [route: Route]
  'edit-rate': [rate: RouteRate]
  'deactivate-rate': [rate: RouteRate]
}>()

const routesQuery = useRouteQuery()
const routeRatesQuery = useRouteRateQuery()
const isFilterRowVisible = ref(true)
const expandedRowId = ref<string | null>(null)

const dataSource = computed<DataGridDataSource<Route>>(() => ({
  data: routesQuery.data.value ?? [],
  isLoading: routesQuery.isLoading.value,
  isFetching: routesQuery.isFetching.value,
  error: routesQuery.error.value,
}))

const routeRatesByRouteId = computed(() => {
  const groups = new Map<number, RouteRate[]>()

  for (const rate of routeRatesQuery.data.value ?? []) {
    const rates = groups.get(rate.route_id) ?? []
    rates.push(rate)
    groups.set(rate.route_id, rates)
  }

  return groups
})

const canManageRates = computed(() => props.canManageRates)
</script>
