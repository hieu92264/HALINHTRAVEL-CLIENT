<script setup lang="ts">
import {
  BusFrontIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  SearchCheckIcon,
  Trash2Icon,
  XCircleIcon,
} from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useContractsQuery } from '@/modules/contract/contract.composables'
import { ApiError } from '@/shared/lib/api-error'
import { DispatchService } from '@/services/dispatch.service'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
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
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { useDispatchMutations, useTripSchedules } from './dispatch.composables'
import { scheduleColumns } from './components/schedule-column'
import type { TripSchedule, TripSchedulePayload } from './dispatch.types'
import { scheduleStatusLabels } from './dispatch.format'
import { scheduleCreateSchema, scheduleUpdateSchema } from './schemas/dispatch.schema'

const auth = useAuthStore()
const schedulesQuery = useTripSchedules()
const contractsQuery = useContractsQuery()
const mutations = useDispatchMutations()
const availability = useMutation({ mutationFn: DispatchService.checkAvailability })

const expandedRowId = ref<string | null>(null)
const isFilterRowVisible = ref(false)
const selectedVehicle = ref<number | null>(null)
const selectedDriver = ref<number | null>(null)
const replaceReason = ref('')
const snapshotVisible = ref(false)
const issueDialogOpen = ref(false)
const removeDialogOpen = ref(false)
const substituteDialogOpen = ref(false)
const cancelDialogOpen = ref(false)
const deactivateDialogOpen = ref(false)
const scheduleDialogOpen = ref(false)
const editingSchedule = ref<TripSchedule | null>(null)
const cancelNote = ref('')
const scheduleForm = reactive({
  contract_id: 0,
  contract_item_id: 0,
  scheduled_start_at: '',
  scheduled_end_at: '',
  pickup_location: '',
  dropoff_location: '',
  note: '',
})
const formErrors = ref<Record<string, string>>({})

const canScheduleManage = computed(
  () => auth.user?.permissions.includes('trip-schedules.manage') === true,
)
const canAssignmentManage = computed(
  () => auth.user?.permissions.includes('trip-assignments.manage') === true,
)
const canOrderManage = computed(
  () => auth.user?.permissions.includes('dispatch-orders.manage') === true,
)
const schedules = computed(() => schedulesQuery.data.value ?? [])
const dataSource = computed<DataGridDataSource<TripSchedule>>(() => ({
  data: schedules.value,
  isLoading: schedulesQuery.isLoading.value,
  isFetching: schedulesQuery.isFetching.value,
  error: schedulesQuery.error.value,
}))

const expandedSchedule = computed(() =>
  schedules.value.find((s) => String(s.id) === expandedRowId.value) ?? null,
)
const currentAssignment = computed(
  () => expandedSchedule.value?.assignments?.find((a) => a.is_current) ?? null,
)
const selectedContract = computed(
  () =>
    (contractsQuery.data.value ?? []).find((c) => c.id === scheduleForm.contract_id) ?? null,
)
const vehicles = computed(() =>
  expandedSchedule.value
    ? (availability.data.value?.vehicle_capacities.find(
        (c) => c.vehicle_type_id === expandedSchedule.value?.required_vehicle_type?.id,
      )?.candidates ?? [])
    : [],
)
const drivers = computed(() => availability.data.value?.driver_capacity.candidates ?? [])

function showError(error: unknown, fallback: string): void {
  const msg = error instanceof ApiError ? error.message : fallback
  toast.error(msg)
}

function toggleRow(row: TripSchedule): void {
  const rowId = String(row.id)
  if (expandedRowId.value === rowId) {
    expandedRowId.value = null
  } else {
    expandedRowId.value = rowId
    selectedVehicle.value = null
    selectedDriver.value = null
    replaceReason.value = ''
    snapshotVisible.value = false
  }
}

function resetScheduleForm(): void {
  Object.assign(scheduleForm, {
    contract_id: 0,
    contract_item_id: 0,
    scheduled_start_at: '',
    scheduled_end_at: '',
    pickup_location: '',
    dropoff_location: '',
    note: '',
  })
  editingSchedule.value = null
  formErrors.value = {}
}

function openCreateSchedule(): void {
  resetScheduleForm()
  scheduleDialogOpen.value = true
}

function openEditSchedule(schedule: TripSchedule): void {
  if (schedule.status !== 'PLANNED') return
  editingSchedule.value = schedule
  Object.assign(scheduleForm, {
    contract_id: 0,
    contract_item_id: 0,
    scheduled_start_at: schedule.scheduled_start_at.slice(0, 16),
    scheduled_end_at: schedule.scheduled_end_at.slice(0, 16),
    pickup_location: schedule.pickup_location ?? '',
    dropoff_location: schedule.dropoff_location ?? '',
    note: schedule.note ?? '',
  })
  formErrors.value = {}
  scheduleDialogOpen.value = true
}

function checkAvailability(schedule: TripSchedule): void {
  if (!schedule.required_vehicle_type?.id) {
    toast.error('Lịch chưa có loại xe yêu cầu.')
    return
  }
  availability.mutate(
    {
      start_at: schedule.scheduled_start_at,
      end_at: schedule.scheduled_end_at,
      items: [{ vehicle_type_id: schedule.required_vehicle_type.id, quantity: 1 }],
    },
    {
      onSuccess: () => {
        snapshotVisible.value = true
      },
      onError: (error) => showError(error, 'Không thể kiểm tra năng lực.'),
    },
  )
}

function saveAssignment(): void {
  if (!expandedSchedule.value || !selectedVehicle.value || !selectedDriver.value) {
    toast.error('Chọn xe và tài xế từ snapshot năng lực.')
    return
  }
  if (currentAssignment.value && !replaceReason.value.trim()) {
    toast.error('Nhập lý do thay phân công.')
    return
  }
  const payload = {
    vehicle_id: selectedVehicle.value,
    driver_id: selectedDriver.value,
    replace_reason: currentAssignment.value ? replaceReason.value : undefined,
  }
  const mutation = currentAssignment.value ? mutations.substitute : mutations.assign
  mutation.mutate(
    { id: expandedSchedule.value.id, payload },
    {
      onSuccess: () => {
        substituteDialogOpen.value = false
        toast.success('Đã lưu phân công.')
      },
      onError: (error) => {
        showError(error, 'Không thể lưu phân công.')
        if (error instanceof ApiError && error.statusCode === 409) snapshotVisible.value = false
      },
    },
  )
}

function saveSchedule(): void {
  formErrors.value = {}

  if (editingSchedule.value) {
    const parsed = scheduleUpdateSchema.safeParse({
      scheduled_start_at: scheduleForm.scheduled_start_at,
      scheduled_end_at: scheduleForm.scheduled_end_at,
      pickup_location: scheduleForm.pickup_location,
      dropoff_location: scheduleForm.dropoff_location,
      note: scheduleForm.note,
    })
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? '_'
        errs[key] = issue.message
      }
      formErrors.value = errs
      return
    }
    mutations.updateSchedule.mutate(
      {
        id: editingSchedule.value.id,
        payload: {
          scheduled_start_at: parsed.data.scheduled_start_at,
          scheduled_end_at: parsed.data.scheduled_end_at,
          pickup_location: parsed.data.pickup_location || null,
          dropoff_location: parsed.data.dropoff_location || null,
          note: parsed.data.note || null,
        },
      },
      {
        onSuccess: () => {
          scheduleDialogOpen.value = false
          resetScheduleForm()
          toast.success('Đã cập nhật lịch chuyến.')
        },
        onError: (error) => showError(error, 'Không thể cập nhật lịch chuyến.'),
      },
    )
    return
  }

  const parsed = scheduleCreateSchema.safeParse({
    contract_id: scheduleForm.contract_id,
    contract_item_id: scheduleForm.contract_item_id,
    scheduled_start_at: scheduleForm.scheduled_start_at,
    scheduled_end_at: scheduleForm.scheduled_end_at,
    pickup_location: scheduleForm.pickup_location,
    dropoff_location: scheduleForm.dropoff_location,
    note: scheduleForm.note,
  })
  if (!parsed.success) {
    const errs: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? '_'
      errs[key] = issue.message
    }
    formErrors.value = errs
    return
  }

  const item = selectedContract.value?.items.find(
    (candidate) => candidate.id === parsed.data.contract_item_id,
  )
  if (!selectedContract.value || !item) {
    formErrors.value.contract_item_id = 'Chọn hợp đồng đang hiệu lực và hạng mục dịch vụ.'
    return
  }

  const payload: TripSchedulePayload = {
    contract_id: selectedContract.value.id,
    contract_item_id: item.id,
    service_type: item.service_type,
    route_id: item.route_id,
    scheduled_start_at: parsed.data.scheduled_start_at,
    scheduled_end_at: parsed.data.scheduled_end_at,
    pickup_location: parsed.data.pickup_location || item.pickup_location,
    dropoff_location: parsed.data.dropoff_location || item.dropoff_location,
    required_vehicle_type_id: item.vehicle_type_id,
    note: parsed.data.note || null,
  }
  mutations.createSchedule.mutate(payload, {
    onSuccess: () => {
      scheduleDialogOpen.value = false
      resetScheduleForm()
      toast.success('Đã tạo lịch chuyến.')
    },
    onError: (error) => showError(error, 'Không thể tạo lịch chuyến.'),
  })
}

function issueOrder(): void {
  if (!expandedSchedule.value) return
  mutations.issue.mutate(expandedSchedule.value.id, {
    onSuccess: () => {
      issueDialogOpen.value = false
      toast.success('Đã phát hành lệnh điều xe.')
    },
    onError: (error) => showError(error, 'Không thể phát hành lệnh.'),
  })
}

function removeAssignment(): void {
  if (!currentAssignment.value) return
  mutations.removeAssignment.mutate(currentAssignment.value.id, {
    onSuccess: () => {
      removeDialogOpen.value = false
      toast.success('Đã gỡ phân công.')
    },
    onError: (error) => showError(error, 'Không thể gỡ phân công.'),
  })
}

function cancelSchedule(): void {
  if (!expandedSchedule.value) return
  mutations.cancelSchedule.mutate(
    { id: expandedSchedule.value.id, note: cancelNote.value || null },
    {
      onSuccess: () => {
        cancelDialogOpen.value = false
        cancelNote.value = ''
        toast.success('Đã hủy lịch chuyến.')
      },
      onError: (error) => showError(error, 'Không thể hủy lịch.'),
    },
  )
}

function deactivateSchedule(): void {
  if (!expandedSchedule.value) return
  mutations.deactivateSchedule.mutate(expandedSchedule.value.id, {
    onSuccess: () => {
      deactivateDialogOpen.value = false
      toast.success('Đã ngừng lịch chuyến.')
    },
    onError: (error) => showError(error, 'Không thể ngừng lịch.'),
  })
}

// Reset snapshot when a different row is expanded
watch(expandedRowId, () => {
  snapshotVisible.value = false
  availability.reset()
})
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Lịch chuyến</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Điều phối lịch xe, phân công và phát hành lệnh điều xe.
        </p>
      </div>
      <Button v-if="canScheduleManage" @click="openCreateSchedule">
        <PlusIcon class="size-4" />Tạo lịch chuyến
      </Button>
    </header>

    <DataGrid
      :data-source="dataSource"
      :columns="scheduleColumns"
      width="100%"
      height="calc(100svh - 250px)"
      :pagination="{ mode: 'client', pageSize: 25, pageSizeOptions: [10, 25, 50, 100] }"
      filtering-mode="client"
      sorting-mode="client"
      :filter-row="isFilterRowVisible"
      global-filter
      :get-row-id="(schedule) => String(schedule.id)"
      v-model:expanded-row-id="expandedRowId"
      :persist="{ key: 'trip-schedules', url: true, queryPrefix: 'ts' }"
      empty-title="Chưa có lịch chuyến"
      empty-description="Lịch chuyến sẽ xuất hiện ở đây khi có bản ghi phù hợp."
      @retry="schedulesQuery.refetch()"
      @row-click="(row) => toggleRow(row)"
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
          <FilterIcon class="size-4" />Lọc
        </Button>
      </template>
      <template #row-detail>
      <article
        v-if="expandedSchedule"
        class="bg-card"
      >
        <div class="border-b border-border px-5 py-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold tabular-nums">{{ expandedSchedule.schedule_no }}</h2>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="{
                    'bg-amber-500/10 text-amber-700': expandedSchedule.status === 'PLANNED',
                    'bg-primary/10 text-primary': expandedSchedule.status === 'ASSIGNED',
                    'bg-blue-500/10 text-blue-700': expandedSchedule.status === 'IN_PROGRESS',
                    'bg-success/10 text-success': expandedSchedule.status === 'COMPLETED',
                    'bg-destructive/10 text-destructive': expandedSchedule.status === 'CANCELLED',
                  }"
                >
                  {{ scheduleStatusLabels[expandedSchedule.status] }}
                </span>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ expandedSchedule.contract?.customer?.name ?? expandedSchedule.contract?.contract_no ?? '—' }}
                · {{ expandedSchedule.required_vehicle_type?.name ?? 'Chưa có loại xe' }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button
                v-if="canScheduleManage && expandedSchedule.status === 'PLANNED'"
                variant="outline"
                size="icon"
                @click="openEditSchedule(expandedSchedule)"
              >
                <PencilIcon class="size-4" />
                <span class="sr-only">Sửa lịch chuyến</span>
              </Button>
              <Button variant="outline" size="sm" @click="expandedRowId = null">
                <ChevronDownIcon class="size-4 rotate-180" />Thu gọn
              </Button>
            </div>
          </div>
        </div>

        <div class="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,0.95fr)]">
          <section class="rounded-lg border border-border bg-muted/20 p-4">
            <h3 class="text-sm font-semibold">Thông tin chuyến</h3>
            <dl class="mt-3 grid gap-x-5 gap-y-4 text-sm sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-muted-foreground">Tuyến</dt>
                <dd class="mt-1 font-medium">{{ expandedSchedule.route?.name ?? `${expandedSchedule.pickup_location ?? '—'} → ${expandedSchedule.dropoff_location ?? '—'}` }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Loại xe</dt>
                <dd class="mt-1">{{ expandedSchedule.required_vehicle_type?.name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Khách hàng</dt>
                <dd class="mt-1">{{ expandedSchedule.contract?.customer?.name ?? expandedSchedule.contract?.contract_no ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Bắt đầu</dt>
                <dd class="mt-1 font-medium tabular-nums">{{ new Date(expandedSchedule.scheduled_start_at).toLocaleString('vi-VN') }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted-foreground">Kết thúc</dt>
                <dd class="mt-1 font-medium tabular-nums">{{ new Date(expandedSchedule.scheduled_end_at).toLocaleString('vi-VN') }}</dd>
              </div>
            </dl>

            <div class="mt-4 border-t border-border pt-4">
              <p class="text-xs font-medium text-muted-foreground">Phân công hiện tại</p>
              <div v-if="currentAssignment" class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span class="font-semibold tabular-nums">{{ currentAssignment.vehicle?.license_plate ?? '—' }}</span>
                <span class="text-muted-foreground">{{ currentAssignment.driver?.full_name ?? '—' }}</span>
              </div>
              <p v-else class="mt-2 text-sm text-amber-700 dark:text-amber-400">Chờ phân công xe và tài xế.</p>
            </div>

            <p v-if="expandedSchedule.note" class="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
              {{ expandedSchedule.note }}
            </p>
          </section>

          <section class="rounded-lg border border-border bg-card">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <h3 class="text-sm font-semibold">Phân công</h3>
                <p class="mt-0.5 text-xs text-muted-foreground">Kiểm tra nguồn lực trước khi lưu phân công.</p>
              </div>
              <Button
                v-if="canAssignmentManage && expandedSchedule.status !== 'CANCELLED' && expandedSchedule.status !== 'COMPLETED'"
                variant="outline"
                size="sm"
                class="gap-2"
                :disabled="availability.isPending.value"
                @click="checkAvailability(expandedSchedule)"
              >
                <SearchCheckIcon class="size-4" />Kiểm tra năng lực
              </Button>
            </div>

            <div class="space-y-4 p-4">
              <p v-if="snapshotVisible" class="rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-primary">
                Đã kiểm tra lúc {{ new Date(availability.data.value?.checked_at ?? '').toLocaleString('vi-VN') }}. Kết quả không giữ tài nguyên.
              </p>

              <template v-if="snapshotVisible && canAssignmentManage">
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="grid gap-1.5">
                    <Label for="schedule-vehicle">Xe</Label>
                    <select
                      id="schedule-vehicle"
                      v-model.number="selectedVehicle"
                      class="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                    >
                      <option :value="null">Chọn xe</option>
                      <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                        {{ vehicle.license_plate }} · {{ vehicle.ownership_type === 'partner' ? 'Đối tác' : 'Công ty' }}
                      </option>
                    </select>
                  </div>
                  <div class="grid gap-1.5">
                    <Label for="schedule-driver">Tài xế</Label>
                    <select
                      id="schedule-driver"
                      v-model.number="selectedDriver"
                      class="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                    >
                      <option :value="null">Chọn tài xế</option>
                      <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                        {{ driver.code }} · {{ driver.full_name }}
                      </option>
                    </select>
                  </div>
                </div>
                <Button class="w-full" @click="currentAssignment ? substituteDialogOpen = true : saveAssignment()">
                  {{ currentAssignment ? 'Thay phân công' : 'Phân công' }}
                </Button>
              </template>

              <p v-else-if="canAssignmentManage" class="text-sm text-muted-foreground">
                Chọn “Kiểm tra năng lực” để lấy danh sách xe và tài xế phù hợp.
              </p>

              <Button
                v-if="canOrderManage && expandedSchedule.status === 'ASSIGNED'"
                class="w-full justify-center gap-2 bg-success text-white hover:bg-success/90"
                :disabled="mutations.issue.isPending.value"
                @click="issueDialogOpen = true"
              >
                <CheckCircle2Icon class="size-4" />Phát hành lệnh
              </Button>
            </div>

            <div
              v-if="(currentAssignment && canAssignmentManage) || (canScheduleManage && expandedSchedule.status === 'PLANNED')"
              class="flex flex-wrap gap-2 border-t border-border bg-muted/15 px-4 py-3"
            >
              <Button
                v-if="currentAssignment && canAssignmentManage"
                variant="outline"
                size="sm"
                class="gap-2"
                @click="removeDialogOpen = true"
              >
                <Trash2Icon class="size-4" />Gỡ phân công
              </Button>
              <template v-if="canScheduleManage && expandedSchedule.status === 'PLANNED'">
                <Button variant="outline" size="sm" @click="deactivateDialogOpen = true">
                  <BusFrontIcon class="size-4" />Ngừng lịch
                </Button>
                <Button variant="destructive" size="sm" @click="cancelDialogOpen = true">
                  <XCircleIcon class="size-4" />Hủy lịch
                </Button>
              </template>
            </div>
          </section>
        </div>
      </article>
      </template>
    </DataGrid>

    <!-- Schedule Dialog (Create / Edit) -->
    <Dialog v-model:open="scheduleDialogOpen">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {{ editingSchedule ? 'Sửa lịch chuyến' : 'Tạo lịch chuyến' }}
          </DialogTitle>
          <DialogDescription>
            {{ editingSchedule ? 'Chỉ lịch Planned chưa có lệnh mới được sửa.' : 'Chọn hợp đồng đang hiệu lực và hạng mục cần điều phối.' }}
          </DialogDescription>
        </DialogHeader>
        <form class="grid gap-4" @submit.prevent="saveSchedule">
          <template v-if="!editingSchedule">
            <div class="grid gap-1.5">
              <Label for="sched-contract">Hợp đồng</Label>
              <select
                id="sched-contract"
                v-model.number="scheduleForm.contract_id"
                class="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                :class="formErrors.contract_id ? 'border-destructive' : ''"
              >
                <option :value="0">Chọn hợp đồng</option>
                <option
                  v-for="contract in (contractsQuery.data.value ?? []).filter((c) => c.status === 'active')"
                  :key="contract.id"
                  :value="contract.id"
                >
                  {{ contract.contract_no }} · {{ contract.customer_name ?? '—' }}
                </option>
              </select>
              <p v-if="formErrors.contract_id" class="text-xs text-destructive">{{ formErrors.contract_id }}</p>
            </div>
            <div class="grid gap-1.5">
              <Label for="sched-item">Hạng mục</Label>
              <select
                id="sched-item"
                v-model.number="scheduleForm.contract_item_id"
                :disabled="!selectedContract"
                class="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted"
                :class="formErrors.contract_item_id ? 'border-destructive' : ''"
              >
                <option :value="0">Chọn hạng mục</option>
                <option
                  v-for="item in selectedContract?.items ?? []"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.route_name ?? item.service_type }} · {{ item.vehicle_type_name ?? 'Chưa có loại xe' }}
                </option>
              </select>
              <p v-if="formErrors.contract_item_id" class="text-xs text-destructive">{{ formErrors.contract_item_id }}</p>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="grid gap-1.5">
              <Label for="sched-start">Bắt đầu</Label>
              <Input
                id="sched-start"
                v-model="scheduleForm.scheduled_start_at"
                type="datetime-local"
                :class="formErrors.scheduled_start_at ? 'border-destructive' : ''"
              />
              <p v-if="formErrors.scheduled_start_at" class="text-xs text-destructive">{{ formErrors.scheduled_start_at }}</p>
            </div>
            <div class="grid gap-1.5">
              <Label for="sched-end">Kết thúc</Label>
              <Input
                id="sched-end"
                v-model="scheduleForm.scheduled_end_at"
                type="datetime-local"
                :class="formErrors.scheduled_end_at ? 'border-destructive' : ''"
              />
              <p v-if="formErrors.scheduled_end_at" class="text-xs text-destructive">{{ formErrors.scheduled_end_at }}</p>
            </div>
          </div>

          <div class="grid gap-1.5">
            <Label for="sched-pickup">Điểm đón</Label>
            <Input
              id="sched-pickup"
              v-model="scheduleForm.pickup_location"
              placeholder="Điểm đón"
            />
          </div>
          <div class="grid gap-1.5">
            <Label for="sched-dropoff">Điểm trả</Label>
            <Input
              id="sched-dropoff"
              v-model="scheduleForm.dropoff_location"
              placeholder="Điểm trả"
            />
          </div>
          <div class="grid gap-1.5">
            <Label for="sched-note">Ghi chú</Label>
            <textarea
              id="sched-note"
              v-model="scheduleForm.note"
              class="min-h-20 rounded-lg border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-ring"
              placeholder="Ghi chú (tùy chọn)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" @click="scheduleDialogOpen = false">Quay lại</Button>
            <Button
              type="submit"
              :disabled="mutations.createSchedule.isPending.value || mutations.updateSchedule.isPending.value"
            >
              {{ mutations.createSchedule.isPending.value || mutations.updateSchedule.isPending.value ? 'Đang lưu…' : editingSchedule ? 'Lưu thay đổi' : 'Tạo lịch' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Substitute Assignment Dialog -->
    <AccessDialog
      :open="substituteDialogOpen"
      title="Thay phân công"
      description="Nêu lý do thay xe hoặc tài xế trước khi lưu."
      confirm-label="Thay phân công"
      cancel-label="Quay lại"
      :pending="mutations.substitute.isPending.value"
      @close="substituteDialogOpen = false"
      @confirm="saveAssignment"
    >
      <textarea
        v-model="replaceReason"
        class="min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-ring"
        placeholder="Lý do thay phân công"
      />
    </AccessDialog>

    <AccessDialog
      :open="removeDialogOpen"
      title="Gỡ phân công"
      description="Lịch sẽ quay về trạng thái chờ phân công."
      confirm-label="Gỡ phân công"
      cancel-label="Quay lại"
      destructive
      :pending="mutations.removeAssignment.isPending.value"
      @close="removeDialogOpen = false"
      @confirm="removeAssignment"
    />

    <AccessDialog
      :open="issueDialogOpen"
      title="Phát hành lệnh điều xe"
      description="Sau khi phát hành, muốn thay phân công phải hủy lệnh trước."
      confirm-label="Phát hành"
      cancel-label="Quay lại"
      :pending="mutations.issue.isPending.value"
      @close="issueDialogOpen = false"
      @confirm="issueOrder"
    />

    <AccessDialog
      :open="deactivateDialogOpen"
      title="Ngừng lịch chuyến"
      description="Chỉ lịch Planned chưa có lệnh mới được ngừng."
      confirm-label="Ngừng lịch"
      cancel-label="Quay lại"
      destructive
      :pending="mutations.deactivateSchedule.isPending.value"
      @close="deactivateDialogOpen = false"
      @confirm="deactivateSchedule"
    />

    <AccessDialog
      :open="cancelDialogOpen"
      title="Hủy lịch chuyến"
      description="Lịch đã hủy không thể tiếp tục phân công."
      confirm-label="Hủy lịch"
      cancel-label="Quay lại"
      destructive
      :pending="mutations.cancelSchedule.isPending.value"
      @close="cancelDialogOpen = false"
      @confirm="cancelSchedule"
    >
      <textarea
        v-model="cancelNote"
        class="min-h-20 w-full rounded-lg border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-ring"
        placeholder="Ghi chú hủy (tùy chọn)"
      />
    </AccessDialog>
  </section>
</template>
