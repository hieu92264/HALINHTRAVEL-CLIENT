<template>
  <section class="mx-auto max-w-4xl space-y-5">
    <p v-if="query.isLoading.value" class="rounded-lg border p-4 text-sm text-muted-foreground">Đang tải lệnh điều xe...</p>
    <template v-else-if="order">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div><div class="flex items-center gap-2"><h1 class="text-2xl font-semibold">{{ order.order_no }}</h1><span :class="['rounded-full px-2 py-1 text-xs', statusClass(order.status)]">{{ scheduleStatusLabel(order.status) }}</span></div><p class="mt-1 text-sm text-muted-foreground">{{ formatDispatchDate(order.scheduled_start_at) }} · {{ order.route_name || order.journey || '—' }}</p></div>
        <div class="flex gap-2"><Button v-if="canManage && order.status === 'ISSUED'" @click="assign">Xác nhận lệnh</Button><Button v-if="canManage && ['ISSUED', 'ASSIGNED'].includes(order.status)" variant="destructive" @click="cancel">Hủy lệnh</Button></div>
      </header>
      <div class="grid gap-5 lg:grid-cols-[1fr_.85fr]"><section class="rounded-lg border bg-card p-5"><h2 class="font-semibold">Thông tin lệnh</h2><dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div>Khách hàng: <b>{{ order.customer_name || '—' }}</b></div><div>Liên hệ: <b>{{ order.contact_name || order.customer_phone || '—' }}</b></div><div>Điểm đón: <b>{{ order.pickup_location || '—' }}</b></div><div>Điểm trả: <b>{{ order.dropoff_location || '—' }}</b></div><div>Xe: <b>{{ order.assignment?.license_plate || '—' }}</b></div><div>Tài xế: <b>{{ order.assignment?.driver_name || '—' }}</b></div></dl><p class="mt-5 border-t pt-4 text-sm text-muted-foreground">Lệnh in gọn: {{ order.order_no }} · {{ order.schedule_no || '—' }} · {{ formatDispatchDate(order.scheduled_start_at) }}</p></section>
      <section class="rounded-lg border bg-card p-5"><h2 class="font-semibold">Thực tế chuyến đi</h2><form v-if="canManage && order.status === 'ASSIGNED'" class="mt-4 grid gap-3" @submit.prevent="start"><label class="grid gap-1 text-sm">Thời gian bắt đầu<Input v-model="startForm.actual_start_at" type="datetime-local" required /></label><label class="grid gap-1 text-sm">ODO bắt đầu<Input v-model.number="startForm.start_odometer" type="number" min="0" required /></label><label class="grid gap-1 text-sm">Ghi chú<Input v-model="startForm.note" /></label><Button type="submit">Bắt đầu chuyến</Button></form><form v-else-if="canManage && order.status === 'IN_PROGRESS'" class="mt-4 grid gap-3" @submit.prevent="complete"><label class="grid gap-1 text-sm">Thời gian hoàn tất<Input v-model="completeForm.actual_end_at" type="datetime-local" required /></label><label class="grid gap-1 text-sm">ODO kết thúc<Input v-model.number="completeForm.end_odometer" type="number" min="0" required /></label><label class="grid gap-1 text-sm">Quãng đường (km)<Input v-model.number="completeForm.actual_distance_km" type="number" min="0" required /></label><label class="grid gap-1 text-sm">Giờ chờ<Input v-model.number="completeForm.waiting_hours" type="number" min="0" step="0.25" /></label><label class="grid gap-1 text-sm">Doanh thu<Input v-model.number="completeForm.customer_amount" type="number" min="0" /></label><label class="grid gap-1 text-sm">Chi phí xe đối tác<Input v-model.number="completeForm.partner_vehicle_cost" type="number" min="0" /></label><Button type="submit">Hoàn thành chuyến</Button></form><div v-else class="mt-4 text-sm text-muted-foreground"><p>Thực tế bắt đầu: {{ formatDispatchDate(order.actual_start_at) }}</p><p class="mt-1">Thực tế kết thúc: {{ formatDispatchDate(order.actual_end_at) }}</p><p class="mt-1">ODO: {{ order.start_odometer ?? '—' }} → {{ order.end_odometer ?? '—' }}</p></div></section></div>
    </template>
    <p v-else class="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">Không thể tải lệnh điều xe.</p>
  </section>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { useDispatchMutations, useOrderQuery } from '@/modules/dispatch/dispatch.composables'
import { formatDispatchDate, scheduleStatusLabel, statusClass } from '@/modules/dispatch/dispatch.format'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute(); const id = computed(() => Number(route.params.id)); const query = useOrderQuery(() => id.value); const order = computed(() => query.data.value); const mutations = useDispatchMutations(); const auth = useAuthStore(); const canManage = computed(() => auth.user?.permissions.includes('dispatch-orders.manage') ?? false)
const startForm = reactive({ actual_start_at: '', start_odometer: 0, note: '' }); const completeForm = reactive({ actual_end_at: '', end_odometer: 0, actual_distance_km: 0, waiting_hours: undefined as number | undefined, customer_amount: undefined as number | undefined, partner_vehicle_cost: undefined as number | undefined })
async function run(action: () => Promise<unknown>, success: string) { try { await action(); await query.refetch(); toast.success(success) } catch (error) { toast.error(error instanceof Error ? error.message : 'Thao tác không thành công. Trạng thái đã được làm mới.') } }
function assign() { return run(() => mutations.assignOrder.mutateAsync(id.value), 'Đã xác nhận lệnh.') }
function cancel() { const note = window.prompt('Lý do hủy lệnh:'); if (note) return run(() => mutations.cancelOrder.mutateAsync({ id: id.value, note }), 'Đã hủy lệnh.') }
function start() { return run(() => mutations.startOrder.mutateAsync({ id: id.value, data: { ...startForm, actual_start_at: new Date(startForm.actual_start_at).toISOString(), note: startForm.note || null } }), 'Đã bắt đầu chuyến.') }
function complete() { return run(() => mutations.completeOrder.mutateAsync({ id: id.value, data: { ...completeForm, actual_end_at: new Date(completeForm.actual_end_at).toISOString() } }), 'Đã hoàn thành chuyến.') }
</script>
