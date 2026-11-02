<template>
  <section v-if="run" class="mx-auto max-w-5xl space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-primary">Xe chạy công nhân</p>
          <span class="rounded-full px-2 py-1 text-xs font-medium" :class="statusClass">{{
            statusLabel
          }}</span>
        </div>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ run.run_no }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ run.run_date }} · {{ run.pickup_time }} · {{ run.license_plate }}
        </p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button
          class="w-full sm:w-auto"
          variant="outline"
          @click="router.push({ name: 'worker-vehicles-edit', params: { id: run.id } })"
          >Cập nhật</Button
        ><Button
          v-if="run.status === 'planned'"
          class="w-full sm:w-auto"
          :disabled="isSaving"
          @click="start"
          >Bắt đầu</Button
        ><Button
          v-if="run.status === 'in_progress'"
          class="w-full sm:w-auto"
          :disabled="isSaving"
          @click="complete"
          >Hoàn thành</Button
        >
      </div>
    </header>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Info label="Khách hàng" :value="run.customer_name ?? undefined" /><Info
        label="Tuyến / ca"
        :value="[run.route_name, run.shift_name].filter(Boolean).join(' · ')"
      /><Info
        label="Xe / lái xe"
        :value="`${run.license_plate} · ${run.driver_name ?? run.hired_driver_name ?? 'Chưa phân công'}`"
      /><Info
        label="Kế hoạch"
        :value="`${run.run_date} ${run.pickup_time}${run.return_time ? ` — ${run.return_time}` : ''}`"
      /><Info label="Bắt đầu thực tế" :value="formatDateTime(run.actual_started_at)" /><Info
        label="Hoàn thành thực tế"
        :value="formatDateTime(run.actual_completed_at)"
      />
    </div>
    <div class="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
      <div>
        <h2 class="text-base font-semibold">Điểm đón / trả</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div>
            <dt class="text-muted-foreground">Điểm đón</dt>
            <dd class="mt-1 font-medium">{{ run.pickup_location || '—' }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Điểm trả</dt>
            <dd class="mt-1 font-medium">{{ run.dropoff_location || '—' }}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h2 class="text-base font-semibold">Snapshot tài chính</h2>
        <dl class="mt-4 grid grid-cols-1 gap-4 text-sm min-[420px]:grid-cols-2">
          <div>
            <dt class="text-muted-foreground">Cước</dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ money(run.freight_amount) }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Lương lái</dt>
            <dd class="mt-1 font-semibold tabular-nums">{{ money(run.driver_wage) }}</dd>
          </div>
        </dl>
      </div>
    </div>
    <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 class="text-base font-semibold">Chấm công</h2>
      <p v-if="run.attendance" class="mt-2 text-sm">
        Đã tạo chấm công <span class="font-medium">{{ run.attendance.status }}</span> với lương
        {{ money(run.attendance.calculated_wage) }}.
      </p>
      <p v-else class="mt-2 text-sm text-muted-foreground">
        Chưa có chấm công. Hệ thống chỉ tạo một chấm công chờ duyệt khi hoàn thành chuyến có lái xe
        nội bộ.
      </p>
    </div>
  </section>
  <section v-else class="grid min-h-64 place-items-center text-sm text-muted-foreground">
    Đang tải chuyến chạy…
  </section>
</template>

<script setup lang="ts">
import { VehicleOperationsService, type VehicleRun } from '@/services/vehicle-operations.service'
import { Button } from '@/shared/components/ui/button'
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const Info = defineComponent({
  props: { label: { type: String, required: true }, value: { type: String, default: '' } },
  setup(props) {
    return () =>
      h('article', { class: 'rounded-xl border border-border bg-card p-4 shadow-sm' }, [
        h('p', { class: 'text-sm text-muted-foreground' }, props.label),
        h('p', { class: 'mt-1 font-medium' }, props.value || '—'),
      ])
  },
})
const route = useRoute()
const router = useRouter()
const run = ref<VehicleRun | null>(null)
const isSaving = ref(false)
const statusLabel = computed(
  () =>
    ({ planned: 'Kế hoạch', in_progress: 'Đang chạy', completed: 'Hoàn tất', cancelled: 'Đã hủy' })[
      run.value?.status ?? ''
    ] ?? '—',
)
const statusClass = computed(
  () =>
    ({
      planned: 'bg-muted text-muted-foreground',
      in_progress: 'bg-warning/10 text-warning',
      completed: 'bg-success/10 text-success',
      cancelled: 'bg-destructive/10 text-destructive',
    })[run.value?.status ?? ''] ?? 'bg-muted',
)
const money = (value: string) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value),
      )
    : 'Chưa cập nhật'
async function load() {
  run.value = await VehicleOperationsService.workerRun(Number(route.params.id))
}
async function start() {
  isSaving.value = true
  try {
    await VehicleOperationsService.startWorkerRun(run.value!.id)
    toast.success('Đã bắt đầu chuyến')
    await load()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể bắt đầu chuyến')
  } finally {
    isSaving.value = false
  }
}
async function complete() {
  isSaving.value = true
  try {
    await VehicleOperationsService.completeWorkerRun(run.value!.id)
    toast.success('Đã hoàn thành chuyến')
    await load()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể hoàn thành chuyến')
  } finally {
    isSaving.value = false
  }
}
onMounted(load)
</script>
