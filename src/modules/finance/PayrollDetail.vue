<template>
  <section class="mx-auto max-w-7xl space-y-5">
    <p
      v-if="query.isLoading.value"
      class="rounded-lg border bg-card p-4 text-sm text-muted-foreground"
    >
      Đang tải kỳ lương...
    </p>
    <template v-else-if="payroll"
      ><header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-semibold">{{ payroll.code }}</h1>
            <span
              :class="['rounded-full px-2.5 py-1 text-xs font-medium', stateClass(payroll.status)]"
              >{{ payrollStatusLabel(payroll.status) }}</span
            >
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            Kỳ {{ formatDate(payroll.from_date) }} — {{ formatDate(payroll.to_date) }}
          </p>
        </div>
        <div v-if="canManage" class="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Button
            v-if="payroll.status === 'draft'"
            class="w-full sm:w-auto"
            variant="outline"
            @click="editOpen = true"
            >Sửa kỳ lương</Button
          >
          <Button
            v-if="payroll.status === 'draft'"
            class="w-full sm:w-auto"
            variant="destructive"
            @click="ask('cancel')"
            >Hủy kỳ nháp</Button
          >
          <Button
            v-if="payroll.status === 'draft' || payroll.status === 'calculated'"
            :disabled="Boolean(periodError)"
            class="w-full sm:w-auto"
            @click="ask('calculate')"
            ><Calculator class="size-4" />Cập nhật</Button
          ><Button
            v-if="payroll.status === 'calculated'"
            variant="outline"
            :disabled="Boolean(periodError)"
            class="w-full sm:w-auto"
            @click="ask('approve')"
            ><CircleCheck class="size-4" />Duyệt</Button
          ><Button
            v-if="payroll.status === 'approved'"
            variant="outline"
            :disabled="Boolean(periodError)"
            class="w-full sm:w-auto"
            @click="ask('paid')"
            ><BanknoteCheck class="size-4" />Đánh dấu đã chi</Button
          ><Button
            v-if="payroll.status === 'paid'"
            class="w-full sm:w-auto"
            variant="destructive"
            @click="ask('lock')"
            ><LockKeyhole class="size-4" />Chốt lương</Button
          >
        </div>
      </header>
      <p
        v-if="periodError"
        class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {{ periodError }}
      </p>
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Tổng lương trước khấu trừ</p>
          <p class="mt-1 text-xl font-semibold tabular-nums">
            {{ formatMoney(payroll.total_gross ?? payroll.gross_salary) }}
          </p>
        </article>
        <article class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Tổng thực nhận</p>
          <p class="mt-1 text-xl font-semibold tabular-nums text-success">
            {{ formatMoney(payroll.total_net ?? payroll.net_salary) }}
          </p>
        </article>
        <article class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Tài xế trong kỳ</p>
          <p class="mt-1 text-xl font-semibold tabular-nums">{{ payroll.items?.length ?? 0 }}</p>
        </article>
      </div>
      <section class="overflow-hidden rounded-lg border bg-card">
        <div class="border-b px-5 py-4">
          <h2 class="font-semibold">Bảng lương theo tài xế</h2>
        </div>
        <div class="space-y-3 p-3 sm:hidden">
          <article
            v-for="item in payroll.items ?? []"
            :key="item.id"
            class="rounded-lg border border-border p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-medium">{{ item.driver_name ?? `Tài xế #${item.driver_id}` }}</p>
                <div
                  v-if="item.details?.length"
                  class="mt-1 space-y-0.5 text-xs text-muted-foreground"
                >
                  <p v-for="detail in item.details" :key="detail.id">
                    {{ detail.worker_run_no ?? detail.tourist_run_no ?? 'Nguồn khác' }} ·
                    {{ payrollCalculationLabel(detail.calculation_type) }}
                  </p>
                </div>
              </div>
              <p class="shrink-0 text-right text-sm font-semibold tabular-nums text-success">
                {{ formatMoney(item.net_salary) }}
              </p>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt class="text-xs text-muted-foreground">Lương công nhân</dt>
                <dd class="mt-0.5 tabular-nums">{{ formatMoney(item.fixed_trip_wage) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Lương du lịch</dt>
                <dd class="mt-0.5 tabular-nums">{{ formatMoney(item.tourism_commission) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Tạm ứng</dt>
                <dd class="mt-0.5 tabular-nums text-destructive">
                  −{{ formatMoney(item.advance_amount) }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Lái xe thu</dt>
                <dd class="mt-0.5 tabular-nums text-destructive">
                  −{{ formatMoney(item.driver_collected_amount) }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Lái xe nộp</dt>
                <dd class="mt-0.5 tabular-nums text-success">
                  +{{ formatMoney(item.driver_remitted_amount) }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Lái xe chi</dt>
                <dd class="mt-0.5 tabular-nums text-success">
                  +{{ formatMoney(item.driver_expense_amount) }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Lương trước khấu trừ</dt>
                <dd class="mt-0.5 font-medium tabular-nums">
                  {{ formatMoney(item.gross_salary) }}
                </dd>
              </div>
            </dl>
          </article>
          <p v-if="!payroll.items?.length" class="py-8 text-center text-sm text-muted-foreground">
            Chưa có dòng lương.
          </p>
        </div>
        <div class="hidden overflow-x-auto sm:block">
          <table class="w-full min-w-[1280px] text-sm">
            <thead class="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th class="px-4 py-3">Tài xế</th>
                <th class="px-4 py-3 text-right">Trách nhiệm</th>
                <th class="px-4 py-3 text-right">Lương CN</th>
                <th class="px-4 py-3 text-right">Lương du lịch</th>
                <th class="px-4 py-3 text-right">Tạm ứng</th>
                <th class="px-4 py-3 text-right">Lái xe thu</th>
                <th class="px-4 py-3 text-right">Lái xe nộp</th>
                <th class="px-4 py-3 text-right">Lái xe chi</th>
                <th class="px-4 py-3 text-right">Lương trước khấu trừ</th>
                <th class="px-4 py-3 text-right">Thực lĩnh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in payroll.items ?? []" :key="item.id" class="border-b last:border-0">
                <td class="px-4 py-3 font-medium">
                  {{ item.driver_name ?? `Tài xế #${item.driver_id}` }}
                  <div
                    v-if="item.details?.length"
                    class="mt-1 space-y-0.5 text-xs font-normal text-muted-foreground"
                  >
                    <p v-for="detail in item.details" :key="detail.id">
                      {{ detail.worker_run_no ?? detail.tourist_run_no ?? 'Nguồn khác' }}
                      · {{ payrollCalculationLabel(detail.calculation_type) }} ·
                      {{ formatMoney(detail.amount) }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-3 text-right tabular-nums">
                  {{ formatMoney(item.responsibility_allowance) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums">
                  {{ formatMoney(item.fixed_trip_wage) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums">
                  {{ formatMoney(item.tourism_commission) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-destructive">
                  −{{ formatMoney(item.advance_amount) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-destructive">
                  −{{ formatMoney(item.driver_collected_amount) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-success">
                  +{{ formatMoney(item.driver_remitted_amount) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-success">
                  +{{ formatMoney(item.driver_expense_amount) }}
                </td>
                <td class="px-4 py-3 text-right font-medium tabular-nums">
                  {{ formatMoney(item.gross_salary) }}
                </td>
                <td class="px-4 py-3 text-right font-semibold tabular-nums text-success">
                  {{ formatMoney(item.net_salary) }}
                </td>
              </tr>
              <tr v-if="!payroll.items?.length">
                <td colspan="10" class="px-4 py-10 text-center text-muted-foreground">
                  Chưa có dòng lương. Hãy chạy “Tính lương” sau khi xác nhận công và tạm ứng.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section
        v-if="payroll.status === 'locked'"
        class="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary"
      >
        <b>Kỳ lương đã chốt.</b> Công, tạm ứng và các dòng lương nguồn liên quan đã trở thành dữ
        liệu bất biến.
      </section></template
    >
    <p
      v-else
      class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
    >
      Không tìm thấy hoặc không thể tải kỳ lương.
    </p>
  </section>
  <PayrollPeriodDialog
    :open="editOpen"
    :payroll="payroll"
    :pending="mutations.updatePayroll.isPending.value"
    @close="editOpen = false"
    @save="savePeriod"
  />
  <AccessDialog
    :open="action !== null"
    :title="actionCopy.title"
    :description="actionCopy.description"
    :confirm-label="actionCopy.confirmLabel"
    cancel-label="Quay lại"
    :destructive="action === 'lock' || action === 'cancel'"
    :pending="isActionPending"
    @close="action = null"
    @confirm="runAction"
  />
</template>
<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { payrollCalculationLabel } from '@/modules/finance/payroll-labels'
import PayrollPeriodDialog from '@/modules/finance/components/PayrollPeriodDialog.vue'
import { payrollPeriodIssues } from '@/modules/finance/payroll-period'
import type { PayrollPayload } from '@/modules/finance/finance.types'
import { useDriverPayrollMutations, usePayrollQuery } from '@/modules/finance/finance.composables'
import {
  formatDate,
  formatMoney,
  payrollStatusLabel,
  stateClass,
} from '@/modules/finance/finance.format'
import { Button } from '@/shared/components/ui/button'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { BanknoteCheck, Calculator, CircleCheck, LockKeyhole } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))
const query = usePayrollQuery(() => id.value)
const payroll = computed(() => query.data.value)
const mutations = useDriverPayrollMutations()
const auth = useAuthStore()
const editOpen = ref(false)
const action = ref<'calculate' | 'approve' | 'paid' | 'lock' | 'cancel' | null>(null)
const canManage = computed(() => auth.user?.permissions.includes('payrolls.manage') ?? false)
const periodError = computed(() =>
  payroll.value ? payrollPeriodIssues(payroll.value).join(' ') : '',
)
async function savePeriod(data: PayrollPayload) {
  try {
    await mutations.updatePayroll.mutateAsync({ id: id.value, data })
    editOpen.value = false
    await query.refetch()
    toast.success('Đã cập nhật kỳ lương.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể cập nhật kỳ lương.')
  }
}
const isActionPending = computed(
  () =>
    mutations.calculatePayroll.isPending.value ||
    mutations.cancelPayroll.isPending.value ||
    mutations.approvePayroll.isPending.value ||
    mutations.markPayrollPaid.isPending.value ||
    mutations.lockPayroll.isPending.value,
)
const actionCopy = computed(
  () =>
    ({
      calculate: {
        title: 'Tính lại bảng lương',
        description: 'Các dòng lương sẽ được tạo lại từ công và tạm ứng đã xác nhận trong kỳ.',
        confirmLabel: 'Tính lương',
      },
      cancel: {
        title: 'Hủy kỳ lương nháp',
        description:
          'Kỳ lương này sẽ được lưu lịch sử và không thể tính hoặc duyệt lại. Công, tạm ứng và chuyến xe nguồn không bị khóa.',
        confirmLabel: 'Hủy kỳ nháp',
      },
      approve: {
        title: 'Duyệt bảng lương',
        description: 'Sau khi duyệt, kỳ lương sẵn sàng cho bước chi trả.',
        confirmLabel: 'Duyệt lương',
      },
      paid: {
        title: 'Đánh dấu đã chi',
        description: 'Xác nhận doanh nghiệp đã thực hiện chi trả kỳ lương này.',
        confirmLabel: 'Đánh dấu đã chi',
      },
      lock: {
        title: 'Chốt bảng lương',
        description:
          'Thao tác này không thể đảo ngược. Kỳ lương, công và tạm ứng nguồn sẽ bị khóa.',
        confirmLabel: 'Chốt lương',
      },
    })[action.value ?? 'calculate'],
)
function ask(next: NonNullable<typeof action.value>) {
  action.value = next
}
async function runAction() {
  if (!action.value) return
  try {
    if (action.value === 'calculate') await mutations.calculatePayroll.mutateAsync(id.value)
    else if (action.value === 'approve') await mutations.approvePayroll.mutateAsync(id.value)
    else if (action.value === 'paid') await mutations.markPayrollPaid.mutateAsync(id.value)
    else if (action.value === 'cancel') {
      await mutations.cancelPayroll.mutateAsync(id.value)
      toast.success('Đã hủy kỳ lương nháp.')
      await router.push({ name: 'driver-payroll' })
      return
    } else await mutations.lockPayroll.mutateAsync(id.value)
    toast.success('Đã cập nhật kỳ lương.')
    action.value = null
    await query.refetch()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể cập nhật kỳ lương.')
  }
}
</script>
