<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Thông tin khách hàng</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Tra cứu, lọc và sắp xếp danh sách khách hàng.
        </p>
      </div>
    </header>

    <CustomerTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="customerToDeactivate = $event"
    />

    <CustomerModal :is-open="isModalOpen" :row="selectedCustomer" @close="closeModal" />

    <AccessDialog
      :open="Boolean(customerToDeactivate)"
      title="Ngừng hoạt động khách hàng"
      :description="`Khách hàng «${customerToDeactivate?.name}» sẽ không còn được sử dụng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="customerToDeactivate = null"
      @confirm="deactivateCustomer"
    />
  </section>
</template>

<script setup lang="ts">
import CustomerModal from '@/modules/master-data/customer/components/CustomerModal.vue'
import CustomerTable from '@/modules/master-data/customer/components/CustomerTable.vue'
import { useDeleteCustomerMutation } from '@/modules/master-data/customer/composables/useCustomerMutation'
import type { Customer } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { toast } from 'vue-sonner'
import { ref } from 'vue'

const isModalOpen = ref(false)
const selectedCustomer = ref<Customer | null>(null)
const customerToDeactivate = ref<Customer | null>(null)
const deactivateMutation = useDeleteCustomerMutation()

function openCreate() {
  selectedCustomer.value = null
  isModalOpen.value = true
}

function openEdit(customer: Customer) {
  selectedCustomer.value = customer
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedCustomer.value = null
}

async function deactivateCustomer() {
  if (!customerToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(customerToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động khách hàng')
    customerToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động khách hàng')
  }
}
</script>
