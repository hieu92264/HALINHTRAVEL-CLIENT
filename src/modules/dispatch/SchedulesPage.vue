<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Lịch chuyến</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Theo dõi tuyến, giờ chạy, xe và tài xế theo ngày.
        </p>
      </div>
      <Button v-if="canManage" @click="formOpen = true"
        ><Plus class="size-4" />Tạo lịch chuyến</Button
      >
    </header>
    <div class="rounded-lg border bg-card p-4">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <article
          v-for="schedule in routeStrip"
          :key="schedule.id"
          class="min-w-68 rounded-md border-l-4 border-l-primary bg-muted/50 p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <b class="text-sm">{{ schedule.schedule_no }}</b
            ><span :class="['rounded-full px-2 py-0.5 text-xs', statusClass(schedule.status)]">{{
              scheduleStatusLabel(schedule.status)
            }}</span>
          </div>
          <p class="mt-2 text-sm font-medium">
            {{ schedule.route_name || schedule.journey || 'Chưa có tuyến' }}
          </p>
          <p class="mt-1 text-xs text-muted-foreground tabular-nums">
            {{ formatDispatchDate(schedule.scheduled_start_at) }} ·
            {{ schedule.assignments.find((a) => a.is_current)?.license_plate || 'Chưa có xe' }}
          </p>
        </article>
        <p v-if="!routeStrip.length" class="py-4 text-sm text-muted-foreground">
          Không có chuyến trong ngày đã chọn.
        </p>
      </div>
    </div>
    <DataGrid
      :data-source="source"
      :columns="columns"
      :pagination="{ mode: 'client', pageSize: 15, pageSizeOptions: [15, 25, 50] }"
      filter-row
      global-filter
      show-actions
      :get-row-id="(row) => String(row.id)"
      :persist="{ key: 'dispatch-schedules', url: true }"
      empty-title="Chưa có lịch chuyến"
      empty-description="Sinh lịch từ hợp đồng hoặc tạo lịch điều hành mới."
      @retry="query.refetch()"
      ><template #toolbar-start
        ><label class="flex items-center gap-2 text-sm"
          >Ngày <Input v-model="day" type="date" class="w-40" /></label></template
      ><template #actions="{ row }"
        ><Button
          size="icon-xs"
          variant="ghost"
          title="Xem chi tiết"
          @click="router.push({ name: 'dispatch-schedule-detail', params: { id: row.id } })"
          ><Eye class="size-4" /></Button></template
    ></DataGrid>
  </section>
  <Dialog v-model:open="formOpen"
    ><DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-xl"
      ><DialogHeader
        ><DialogTitle>Tạo lịch chuyến</DialogTitle
        ><DialogDescription
          >Dữ liệu được kiểm tra lại theo hợp đồng còn hiệu lực.</DialogDescription
        ></DialogHeader
      >
      <form class="grid gap-3 sm:grid-cols-2" @submit.prevent="create">
        <label class="grid gap-1 text-sm"
          >Mã hợp đồng<Input
            v-model.number="form.contract_id"
            type="number"
            min="1"
            required /></label
        ><label class="grid gap-1 text-sm"
          >Mã hạng mục<Input v-model.number="form.contract_item_id" type="number" min="1" /></label
        ><label class="grid gap-1 text-sm"
          >Loại dịch vụ<select
            v-model="form.service_type"
            class="h-10 rounded-md border bg-background px-3"
          >
            <option value="fixed">Cố định</option>
            <option value="tourism">Du lịch</option>
            <option value="school">Đưa đón học sinh</option>
            <option value="business">Công tác</option>
          </select></label
        ><label class="grid gap-1 text-sm"
          >Mã loại xe<Input
            v-model.number="form.required_vehicle_type_id"
            type="number"
            min="1"
            required /></label
        ><label class="grid gap-1 text-sm sm:col-span-2"
          >Bắt đầu<Input v-model="form.scheduled_start_at" type="datetime-local" required /></label
        ><label class="grid gap-1 text-sm sm:col-span-2"
          >Kết thúc<Input v-model="form.scheduled_end_at" type="datetime-local" required /></label
        ><label class="grid gap-1 text-sm">Điểm đón<Input v-model="form.pickup_location" /></label
        ><label class="grid gap-1 text-sm">Điểm trả<Input v-model="form.dropoff_location" /></label
        ><DialogFooter class="sm:col-span-2"
          ><Button type="button" variant="outline" @click="formOpen = false">Hủy</Button
          ><Button type="submit" :disabled="mutations.createSchedule.isPending.value"
            >Tạo lịch</Button
          ></DialogFooter
        >
      </form></DialogContent
    ></Dialog
  >
</template>
<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { useDispatchMutations, useSchedulesQuery } from '@/modules/dispatch/dispatch.composables'
import {
  formatDispatchDate,
  scheduleStatusLabel,
  statusClass,
} from '@/modules/dispatch/dispatch.format'
import type { TripSchedule } from '@/modules/dispatch/dispatch.types'
import {
  DataGrid,
  type DataGridColumnDef,
  type DataGridDataSource,
} from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Eye, Plus } from '@lucide/vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
const query = useSchedulesQuery()
const mutations = useDispatchMutations()
const router = useRouter()
const auth = useAuthStore()
const day = ref(new Date().toISOString().slice(0, 10))
const formOpen = ref(false)
const canManage = computed(() => auth.user?.permissions.includes('trip-schedules.manage') ?? false)
const form = reactive({
  contract_id: 0,
  contract_item_id: undefined as number | undefined,
  service_type: 'fixed',
  required_vehicle_type_id: 0,
  scheduled_start_at: '',
  scheduled_end_at: '',
  pickup_location: '',
  dropoff_location: '',
})
const columns: DataGridColumnDef<TripSchedule>[] = [
  { accessorKey: 'schedule_no', header: 'Mã lịch', fixed: 'left', meta: { label: 'Mã lịch' } },
  {
    accessorKey: 'scheduled_start_at',
    header: 'Khởi hành',
    cell: ({ getValue }) => formatDispatchDate(String(getValue())),
    meta: { label: 'Khởi hành' },
  },
  {
    accessorKey: 'route_name',
    header: 'Tuyến / hành trình',
    cell: ({ row }) => row.original.route_name || row.original.journey || '—',
    meta: { label: 'Tuyến' },
  },
  { accessorKey: 'customer_name', header: 'Khách hàng', meta: { label: 'Khách hàng' } },
  {
    id: 'assignment',
    header: 'Xe / tài xế',
    cell: ({ row }) => {
      const assignment = row.original.assignments.find((item) => item.is_current)
      return assignment
        ? `${assignment.license_plate ?? '—'} · ${assignment.driver_name ?? '—'}`
        : 'Chờ phân công'
    },
    meta: { label: 'Xe / tài xế' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ getValue }) => scheduleStatusLabel(String(getValue())),
    meta: { label: 'Trạng thái' },
  },
]
const source = computed<DataGridDataSource<TripSchedule>>(() => ({
  data: query.data.value ?? [],
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))
const routeStrip = computed(() =>
  (query.data.value ?? []).filter((item) => item.scheduled_start_at.slice(0, 10) === day.value),
)
async function create() {
  try {
    await mutations.createSchedule.mutateAsync({
      ...form,
      contract_item_id: form.contract_item_id || null,
      pickup_location: form.pickup_location || null,
      dropoff_location: form.dropoff_location || null,
      scheduled_start_at: new Date(form.scheduled_start_at).toISOString(),
      scheduled_end_at: new Date(form.scheduled_end_at).toISOString(),
    })
    formOpen.value = false
    toast.success('Đã tạo lịch chuyến.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể tạo lịch chuyến.')
  }
}
</script>
