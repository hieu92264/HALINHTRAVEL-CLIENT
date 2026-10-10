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
        <div v-if="canManage" class="flex flex-wrap gap-2">
          <Button
            v-if="payroll.status === 'draft' || payroll.status === 'calculated'"
            @click="ask('calculate')"
            ><Calculator class="size-4" />Tính lương</Button
          ><Button v-if="payroll.status === 'calculated'" variant="outline" @click="ask('approve')"
            ><CircleCheck class="size-4" />Duyệt</Button
          ><Button v-if="payroll.status === 'approved'" variant="outline" @click="ask('paid')"
            ><BanknoteCheck class="size-4" />Đánh dấu đã chi</Button
          ><Button v-if="payroll.status === 'paid'" variant="destructive" @click="ask('lock')"
            ><LockKeyhole class="size-4" />Chốt lương</Button
          >
        </div>
      </header>
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="rounded-lg border bg-card p-4">
          <p class="text-sm text-muted-foreground">Tổng lương gross</p>
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
          <p class="mt-1 text-sm text-muted-foreground">
            Các khoản điều chỉnh chỉ mở khi kỳ lương đã tính. Lương nguồn luôn do máy chủ tính.
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1040px] text-sm">
            <thead class="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th class="px-4 py-3">Tài xế</th>
                <th class="px-4 py-3 text-right">Lương cơ bản</th>
                <th class="px-4 py-3 text-right">Công chuyến</th>
                <th class="px-4 py-3 text-right">Tạm ứng</th>
                <th class="px-4 py-3 text-right">Khấu trừ</th>
                <th class="px-4 py-3 text-right">Gross</th>
                <th class="px-4 py-3 text-right">Thực nhận</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in payroll.items ?? []" :key="item.id" class="border-b last:border-0">
                <td class="px-4 py-3 font-medium">
                  {{ item.driver_name ?? `Tài xế #${item.driver_id}` }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums">
                  {{ formatMoney(item.base_salary) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums">
                  {{ formatMoney(Number(item.fixed_trip_wage) + Number(item.tourism_commission)) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-destructive">
                  −{{ formatMoney(item.advance_amount) }}
                </td>
                <td class="px-4 py-3 text-right tabular-nums text-destructive">
                  −{{ formatMoney(item.deduction_amount) }}
                </td>
                <td class="px-4 py-3 text-right font-medium tabular-nums">
                  {{ formatMoney(item.gross_salary) }}
                </td>
                <td class="px-4 py-3 text-right font-semibold tabular-nums text-success">
                  {{ formatMoney(item.net_salary) }}
                </td>
                <td class="px-4 py-3">
                  <Button
                    v-if="payroll.status === 'calculated' && canManage"
                    size="sm"
                    variant="ghost"
                    @click="selectedItem = item"
                    ><PencilLine class="size-4" />Điều chỉnh</Button
                  >
                </td>
              </tr>
              <tr v-if="!payroll.items?.length">
                <td colspan="8" class="px-4 py-10 text-center text-muted-foreground">
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
  <Dialog v-model:open="itemOpen"
    ><DialogContent class="sm:max-w-lg"
      ><DialogHeader
        ><DialogTitle>Điều chỉnh khoản lương</DialogTitle
        ><DialogDescription
          >Chỉ điều chỉnh phụ cấp, khấu trừ và ghi chú; tổng sẽ do máy chủ tính
          lại.</DialogDescription
        ></DialogHeader
      >
      <form v-if="selectedItem" class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveItem">
        <label class="grid gap-1.5 text-sm font-medium"
          >Phụ cấp ăn<Input
            v-model="itemForm.meal_allowance"
            type="number"
            min="0"
            step="1" /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Phụ cấp khác<Input
            v-model="itemForm.other_allowance"
            type="number"
            min="0"
            step="1" /></label
        ><label class="grid gap-1.5 text-sm font-medium"
          >Khấu trừ<Input
            v-model="itemForm.deduction_amount"
            type="number"
            min="0"
            step="1" /></label
        ><label class="grid gap-1.5 text-sm font-medium sm:col-span-2"
          >Ghi chú<textarea
            v-model="itemForm.note"
            rows="3"
            class="rounded-md border bg-background px-3 py-2 text-sm font-normal"
          /></label
        ><DialogFooter class="sm:col-span-2"
          ><Button
            type="button"
            variant="outline"
            :disabled="mutations.updatePayrollItem.isPending.value"
            @click="selectedItem = null"
            >Hủy</Button
          ><Button type="submit" :disabled="mutations.updatePayrollItem.isPending.value"
            >Lưu điều chỉnh</Button
          ></DialogFooter
        >
      </form></DialogContent
    ></Dialog
  >
  <AccessDialog
    :open="action !== null"
    :title="actionCopy.title"
    :description="actionCopy.description"
    :confirm-label="actionCopy.confirmLabel"
    cancel-label="Quay lại"
    :destructive="action === 'lock'"
    :pending="isActionPending"
    @close="action = null"
    @confirm="runAction"
  />
</template>
<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/auth.store'
import { useDriverPayrollMutations, usePayrollQuery } from '@/modules/finance/finance.composables'
import {
  formatDate,
  formatMoney,
  payrollStatusLabel,
  stateClass,
} from '@/modules/finance/finance.format'
import type { PayrollItem } from '@/modules/finance/finance.types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { Input } from '@/shared/components/ui/input'
import { BanknoteCheck, Calculator, CircleCheck, LockKeyhole, PencilLine } from '@lucide/vue'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
const route = useRoute()
const id = computed(() => Number(route.params.id))
const query = usePayrollQuery(() => id.value)
const payroll = computed(() => query.data.value)
const mutations = useDriverPayrollMutations()
const auth = useAuthStore()
const action = ref<'calculate' | 'approve' | 'paid' | 'lock' | null>(null)
const selectedItem = ref<PayrollItem | null>(null)
const itemForm = reactive({
  meal_allowance: '',
  other_allowance: '',
  deduction_amount: '',
  note: '',
})
const canManage = computed(() => auth.user?.permissions.includes('payrolls.manage') ?? false)
const itemOpen = computed({
  get: () => selectedItem.value !== null,
  set: (value: boolean) => {
    if (!value) selectedItem.value = null
  },
})
const isActionPending = computed(
  () =>
    mutations.calculatePayroll.isPending.value ||
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
watch(selectedItem, (item) => {
  if (item)
    Object.assign(itemForm, {
      meal_allowance: String(item.meal_allowance),
      other_allowance: String(item.other_allowance),
      deduction_amount: String(item.deduction_amount),
      note: item.note ?? '',
    })
})
function ask(next: NonNullable<typeof action.value>) {
  action.value = next
}
async function runAction() {
  if (!action.value) return
  try {
    if (action.value === 'calculate') await mutations.calculatePayroll.mutateAsync(id.value)
    else if (action.value === 'approve') await mutations.approvePayroll.mutateAsync(id.value)
    else if (action.value === 'paid') await mutations.markPayrollPaid.mutateAsync(id.value)
    else await mutations.lockPayroll.mutateAsync(id.value)
    toast.success('Đã cập nhật kỳ lương.')
    action.value = null
    await query.refetch()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể cập nhật kỳ lương.')
  }
}
async function saveItem() {
  if (!selectedItem.value) return
  try {
    await mutations.updatePayrollItem.mutateAsync({
      id: id.value,
      itemId: selectedItem.value.id,
      data: {
        meal_allowance: itemForm.meal_allowance,
        other_allowance: itemForm.other_allowance,
        deduction_amount: itemForm.deduction_amount,
        note: itemForm.note || null,
      },
    })
    toast.success('Đã cập nhật khoản điều chỉnh.')
    selectedItem.value = null
    await query.refetch()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể lưu điều chỉnh.')
  }
}
</script>
