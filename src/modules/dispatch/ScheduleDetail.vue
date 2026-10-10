<template>
  <section class="mx-auto max-w-5xl space-y-5">
    <p v-if="query.isLoading.value" class="rounded-lg border p-4 text-sm text-muted-foreground">Đang tải lịch chuyến...</p>
    <template v-else-if="schedule">
      <header class="flex flex-wrap items-start justify-between gap-3"><div><div class="flex items-center gap-2"><h1 class="text-2xl font-semibold">{{ schedule.schedule_no }}</h1><span :class="['rounded-full px-2 py-1 text-xs', statusClass(schedule.status)]">{{ scheduleStatusLabel(schedule.status) }}</span></div><p class="mt-1 text-sm text-muted-foreground">{{ formatDispatchDate(schedule.scheduled_start_at) }} · {{ schedule.route_name || schedule.journey || '—' }}</p></div><Button v-if="canManage && schedule.status === 'ASSIGNED' && !schedule.dispatch_order" @click="createOrder"><FilePlus2 class="size-4" />Tạo lệnh điều xe</Button></header>
      <div class="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <section class="rounded-lg border bg-card p-5"><h2 class="font-semibold">Phân công</h2><p class="mt-1 text-sm text-muted-foreground">Kiểm tra lại availability trước khi chọn xe và tài xế.</p><AvailabilityPanel class="mt-4" :start-at="schedule.scheduled_start_at" :end-at="schedule.scheduled_end_at" :vehicle-type-id="schedule.required_vehicle_type_id" /><form v-if="canManage && (schedule.status === 'PLANNED' || schedule.status === 'ASSIGNED')" class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="saveAssignment"><label class="grid gap-1 text-sm">Mã xe<Input v-model.number="assignment.vehicle_id" type="number" min="1" required /></label><label class="grid gap-1 text-sm">Mã tài xế<Input v-model.number="assignment.driver_id" type="number" min="1" required /></label><label v-if="schedule.status === 'ASSIGNED'" class="grid gap-1 text-sm sm:col-span-2">Lý do thay thế<Input v-model="assignment.replace_reason" required /></label><Button type="submit" class="sm:col-span-2" :disabled="pending">{{ schedule.status === 'PLANNED' ? 'Phân công' : 'Thay thế phân công' }}</Button></form><div class="mt-4 space-y-3"><article v-for="item in schedule.assignments" :key="item.id" class="rounded-md border p-3 text-sm"><div class="flex justify-between gap-3"><b>{{ item.license_plate || '—' }} · {{ item.driver_name || '—' }}</b><span>{{ item.is_current ? 'Hiện hành' : 'Đã thay thế' }}</span></div><p v-if="item.replace_reason" class="mt-1 text-muted-foreground">{{ item.replace_reason }}</p></article><p v-if="!schedule.assignments.length" class="text-sm text-muted-foreground">Chưa có phân công.</p></div></section>
        <aside class="space-y-4"><section class="rounded-lg border bg-card p-5"><h2 class="font-semibold">Thông tin chuyến</h2><dl class="mt-3 space-y-2 text-sm"><div>Khách: {{ schedule.customer_name || '—' }}</div><div>Điểm đón: {{ schedule.pickup_location || '—' }}</div><div>Điểm trả: {{ schedule.dropoff_location || '—' }}</div><div>Loại xe: {{ schedule.required_vehicle_type_name || '—' }}</div></dl></section><section v-if="schedule.dispatch_order" class="rounded-lg border bg-card p-5"><h2 class="font-semibold">Lệnh điều xe</h2><Button class="mt-3" variant="outline" @click="router.push({ name: 'dispatch-order-detail', params: { id: schedule.dispatch_order?.id } })">{{ schedule.dispatch_order.order_no }}</Button></section></aside>
      </div>
    </template>
    <p v-else class="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">Không thể tải lịch chuyến.</p>
  </section>
</template>
<script setup lang="ts">
import AvailabilityPanel from '@/modules/dispatch/AvailabilityPanel.vue'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useDispatchMutations, useScheduleQuery } from '@/modules/dispatch/dispatch.composables'
import { formatDispatchDate, scheduleStatusLabel, statusClass } from '@/modules/dispatch/dispatch.format'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FilePlus2 } from '@lucide/vue'
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute(); const router = useRouter(); const id = computed(() => Number(route.params.id)); const query = useScheduleQuery(() => id.value); const schedule = computed(() => query.data.value); const mutations = useDispatchMutations(); const auth = useAuthStore(); const canManage = computed(() => auth.user?.permissions.includes('trip-assignments.manage') ?? false); const assignment = reactive({ vehicle_id: 0, driver_id: 0, replace_reason: '' }); const pending = computed(() => mutations.assign.isPending.value || mutations.substitute.isPending.value)
async function saveAssignment() { try { if (schedule.value?.status === 'PLANNED') await mutations.assign.mutateAsync({ id: id.value, data: { vehicle_id: assignment.vehicle_id, driver_id: assignment.driver_id } }); else await mutations.substitute.mutateAsync({ id: id.value, data: { vehicle_id: assignment.vehicle_id, driver_id: assignment.driver_id, replace_reason: assignment.replace_reason } }); await query.refetch(); toast.success('Đã cập nhật phân công.') } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể phân công.') } }
async function createOrder() { try { const order = await mutations.createOrder.mutateAsync(id.value); toast.success('Đã tạo lệnh điều xe.'); await router.push({ name: 'dispatch-order-detail', params: { id: order.id } }) } catch (error) { toast.error(error instanceof Error ? error.message : 'Không thể tạo lệnh điều xe.') } }
</script>
