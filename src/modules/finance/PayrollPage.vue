<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Chấm công và lương</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Xác nhận công chuyến, quản lý tạm ứng và thực hiện quy trình chốt lương.
        </p>
      </div>
      <Button
        v-if="canManage && activeTab !== 'attendances'"
        @click="activeTab === 'advances' ? (advanceDialog = true) : (payrollDialog = true)"
        ><Plus class="size-4" />{{
          activeTab === 'advances' ? 'Tạo tạm ứng' : 'Tạo kỳ lương'
        }}</Button
      >
    </header>
    <Tabs v-model="activeTab" class="space-y-4"
      ><TabsList
        ><TabsTrigger value="advances">Tạm ứng</TabsTrigger
        ><TabsTrigger value="attendances">Chấm công chuyến</TabsTrigger
        ><TabsTrigger value="payrolls">Kỳ lương</TabsTrigger></TabsList
      ><TabsContent value="advances"
        ><DataGrid
          :data-source="advanceSource"
          :columns="advanceColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'driver-advances', url: true, queryPrefix: 'advance' }"
          empty-title="Chưa có tạm ứng"
          empty-description="Tạm ứng cho tài xế sẽ hiển thị theo từng kỳ."
          @retry="advances.refetch()"
          ><template #actions="{ row }"
            ><div class="flex h-full items-center justify-center gap-1" v-if="canManage">
              <Button
                v-if="row.status === 'pending'"
                variant="ghost"
                size="icon-xs"
                title="Sửa"
                @click="selectedAdvance = row"
                ><PencilLine class="size-4" /></Button
              ><Button
                v-if="row.status === 'pending'"
                variant="ghost"
                size="icon-xs"
                title="Xác nhận"
                @click="confirmation = { type: 'advance', id: row.id }"
                ><CircleCheck class="size-4 text-success" /></Button
              ><Button
                v-if="row.status === 'pending'"
                variant="ghost"
                size="icon-xs"
                title="Ngừng hoạt động"
                @click="removeAdvance(row.id)"
                ><Trash2 class="size-4 text-destructive"
              /></Button></div></template></DataGrid></TabsContent
      ><TabsContent value="attendances"
        ><DataGrid
          :data-source="attendanceSource"
          :columns="attendanceColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'driver-attendances', url: true, queryPrefix: 'attendance' }"
          empty-title="Chưa có công chuyến"
          empty-description="Công chỉ phát sinh từ lệnh điều xe đã hoàn thành."
          @retry="attendances.refetch()"
          ><template #actions="{ row }"
            ><div class="flex h-full items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                title="Xem công thức"
                @click="selectedAttendance = row"
                ><Eye class="size-4" /></Button
              ><Button
                v-if="canManage && row.status === 'pending'"
                variant="ghost"
                size="icon-xs"
                title="Xác nhận"
                @click="confirmation = { type: 'attendance', id: row.id }"
                ><CircleCheck class="size-4 text-success"
              /></Button></div></template></DataGrid></TabsContent
      ><TabsContent value="payrolls"
        ><DataGrid
          :data-source="payrollSource"
          :columns="payrollColumns"
          :pagination="pagination"
          filter-row
          global-filter
          show-actions
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'payrolls', url: true, queryPrefix: 'payroll' }"
          empty-title="Chưa có kỳ lương"
          empty-description="Tạo kỳ lương rồi tính từ công và tạm ứng đã xác nhận."
          @retry="payrolls.refetch()"
          ><template #actions="{ row }"
            ><Button
              variant="ghost"
              size="icon-xs"
              title="Mở kỳ lương"
              @click="router.push({ name: 'payroll-detail', params: { id: row.id } })"
              ><Eye class="size-4" /></Button></template></DataGrid></TabsContent
    ></Tabs>
  </section>
  <AdvanceDialog
    :open="advanceDialog || selectedAdvance !== null"
    :row="selectedAdvance"
    :pending="advancePending"
    @close="closeAdvance"
    @save="saveAdvance"
  /><PayrollPeriodDialog
    :open="payrollDialog"
    :pending="mutations.createPayroll.isPending.value"
    @close="payrollDialog = false"
    @save="savePayroll"
  />
  <Dialog v-model:open="attendanceOpen"
    ><DialogContent class="sm:max-w-lg"
      ><DialogHeader
        ><DialogTitle>Công thức tiền công</DialogTitle
        ><DialogDescription
          >Đây là dữ liệu do máy chủ tính từ lệnh điều xe và loại công.</DialogDescription
        ></DialogHeader
      >
      <dl v-if="selectedAttendance" class="grid grid-cols-2 gap-3 rounded-md bg-muted p-4 text-sm">
        <dt>Loại công</dt>
        <dd>{{ workTypeLabel(selectedAttendance.work_type) }}</dd>
        <dt>Đơn vị công</dt>
        <dd class="tabular-nums">{{ selectedAttendance.work_units }}</dd>
        <dt>Cơ sở tính</dt>
        <dd class="tabular-nums">{{ formatMoney(selectedAttendance.base_amount) }}</dd>
        <dt>Tỷ lệ</dt>
        <dd class="tabular-nums">{{ selectedAttendance.rate }}</dd>
        <dt class="font-semibold">Tiền công</dt>
        <dd class="font-semibold tabular-nums">
          {{ formatMoney(selectedAttendance.calculated_wage) }}
        </dd>
      </dl></DialogContent
    ></Dialog
  >
  <AccessDialog
    :open="confirmation !== null"
    title="Xác nhận dữ liệu nguồn"
    :description="
      confirmation?.type === 'advance'
        ? 'Tạm ứng sau xác nhận sẽ không còn chỉnh sửa cho tới khi được xử lý trong kỳ lương.'
        : 'Công chuyến sau xác nhận sẽ trở thành nguồn để tính lương.'
    "
    confirm-label="Xác nhận"
    cancel-label="Quay lại"
    :pending="isConfirming"
    @close="confirmation = null"
    @confirm="confirm"
  />
</template>
<script setup lang="ts">
import AdvanceDialog from '@/modules/finance/components/AdvanceDialog.vue'
import PayrollPeriodDialog from '@/modules/finance/components/PayrollPeriodDialog.vue'
import {
  advanceColumns,
  attendanceColumns,
  payrollColumns,
} from '@/modules/finance/components/finance-columns'
import {
  useAdvancesQuery,
  useAttendancesQuery,
  useDriverPayrollMutations,
  usePayrollsQuery,
} from '@/modules/finance/finance.composables'
import { formatMoney, workTypeLabel } from '@/modules/finance/finance.format'
import type { DriverAdvance, DriverAttendance } from '@/modules/finance/finance.types'
import { useAuthStore } from '@/modules/auth/auth.store'
import { DataGrid, type DataGridDataSource } from '@/shared/components/data-grid'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { CircleCheck, Eye, PencilLine, Plus, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
const auth = useAuthStore()
const router = useRouter()
const advances = useAdvancesQuery()
const attendances = useAttendancesQuery()
const payrolls = usePayrollsQuery()
const mutations = useDriverPayrollMutations()
const activeTab = ref('advances')
const advanceDialog = ref(false)
const payrollDialog = ref(false)
const selectedAdvance = ref<DriverAdvance | null>(null)
const selectedAttendance = ref<DriverAttendance | null>(null)
const confirmation = ref<{ type: 'advance' | 'attendance'; id: number } | null>(null)
const canManage = computed(
  () =>
    auth.user?.permissions.some((permission) =>
      ['driver-advances.manage', 'driver-attendances.manage', 'payrolls.manage'].includes(
        permission,
      ),
    ) ?? false,
)
const pagination = { mode: 'client' as const, pageSize: 15, pageSizeOptions: [15, 25, 50] }
const source = <T,>(query: {
  data: { value: T[] | undefined }
  isLoading: { value: boolean }
  isFetching: { value: boolean }
  error: { value: unknown }
}) =>
  computed<DataGridDataSource<T>>(() => ({
    data: query.data.value ?? [],
    isLoading: query.isLoading.value,
    isFetching: query.isFetching.value,
    error: query.error.value,
  }))
const advanceSource = source(advances)
const attendanceSource = source(attendances)
const payrollSource = source(payrolls)
const advancePending = computed(
  () => mutations.createAdvance.isPending.value || mutations.updateAdvance.isPending.value,
)
const attendanceOpen = computed({
  get: () => selectedAttendance.value !== null,
  set: (value: boolean) => {
    if (!value) selectedAttendance.value = null
  },
})
const isConfirming = computed(
  () => mutations.confirmAdvance.isPending.value || mutations.confirmAttendance.isPending.value,
)
function closeAdvance() {
  advanceDialog.value = false
  selectedAdvance.value = null
}
async function saveAdvance(data: {
  driver_id: number
  advance_date: string
  amount: string
  description: string | null
}) {
  try {
    if (selectedAdvance.value)
      await mutations.updateAdvance.mutateAsync({ id: selectedAdvance.value.id, data })
    else await mutations.createAdvance.mutateAsync(data)
    toast.success('Đã lưu tạm ứng.')
    closeAdvance()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu tạm ứng.')
  }
}
async function savePayroll(data: {
  month: number
  year: number
  from_date: string
  to_date: string
}) {
  try {
    const payroll = await mutations.createPayroll.mutateAsync(data)
    payrollDialog.value = false
    toast.success('Đã tạo kỳ lương.')
    await router.push({ name: 'payroll-detail', params: { id: payroll.id } })
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Không thể tạo kỳ lương. Kỳ này có thể đã tồn tại.',
    )
  }
}
async function removeAdvance(id: number) {
  if (!window.confirm('Ngừng hoạt động tạm ứng này?')) return
  try {
    await mutations.deleteAdvance.mutateAsync(id)
    toast.success('Đã ngừng hoạt động tạm ứng.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể cập nhật tạm ứng.')
  }
}
async function confirm() {
  const current = confirmation.value
  if (!current) return
  try {
    if (current.type === 'advance') await mutations.confirmAdvance.mutateAsync(current.id)
    else await mutations.confirmAttendance.mutateAsync(current.id)
    toast.success('Đã xác nhận dữ liệu.')
    confirmation.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể xác nhận dữ liệu.')
  }
}
</script>
