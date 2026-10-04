<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Loại chi phí</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Quản lý danh mục chi phí theo phạm vi sử dụng.
        </p>
      </div>
    </header>

    <ExpenseTypeTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="expenseTypeToDeactivate = $event"
    />

    <ExpenseTypeModal :is-open="isModalOpen" :row="selectedExpenseType" @close="closeModal" />

    <AccessDialog
      :open="Boolean(expenseTypeToDeactivate)"
      title="Ngừng hoạt động loại chi phí"
      :description="`Loại chi phí «${expenseTypeToDeactivate?.name}» sẽ không còn được sử dụng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="expenseTypeToDeactivate = null"
      @confirm="deactivateExpenseType"
    />
  </section>
</template>

<script setup lang="ts">
import ExpenseTypeModal from '@/modules/master-data/expense-type/components/ExpenseTypeModal.vue'
import ExpenseTypeTable from '@/modules/master-data/expense-type/components/ExpenseTypeTable.vue'
import { useDeleteExpenseTypeMutation } from '@/modules/master-data/expense-type/composables/useExpenseTypeMutation'
import type { ExpenseType } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedExpenseType = ref<ExpenseType | null>(null)
const expenseTypeToDeactivate = ref<ExpenseType | null>(null)
const deactivateMutation = useDeleteExpenseTypeMutation()

function openCreate() {
  selectedExpenseType.value = null
  isModalOpen.value = true
}

function openEdit(expenseType: ExpenseType) {
  selectedExpenseType.value = expenseType
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedExpenseType.value = null
}

async function deactivateExpenseType() {
  if (!expenseTypeToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(expenseTypeToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động loại chi phí')
    expenseTypeToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động loại chi phí')
  }
}
</script>
