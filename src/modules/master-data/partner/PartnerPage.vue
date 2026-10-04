<template>
  <section class="space-y-5">
    <header class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">Thông tin đối tác</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Tra cứu, lọc và quản lý danh sách đối tác vận hành.
        </p>
      </div>
    </header>

    <PartnerTable
      @create="openCreate"
      @edit="openEdit"
      @deactivate="partnerToDeactivate = $event"
    />

    <PartnerModal :is-open="isModalOpen" :row="selectedPartner" @close="closeModal" />

    <AccessDialog
      :open="Boolean(partnerToDeactivate)"
      title="Ngừng hoạt động đối tác"
      :description="`Đối tác «${partnerToDeactivate?.name}» sẽ không còn được sử dụng cho các nghiệp vụ mới.`"
      confirm-label="Ngừng hoạt động"
      destructive
      :pending="deactivateMutation.isPending.value"
      @close="partnerToDeactivate = null"
      @confirm="deactivatePartner"
    />
  </section>
</template>

<script setup lang="ts">
import PartnerModal from '@/modules/master-data/partner/components/PartnerModal.vue'
import PartnerTable from '@/modules/master-data/partner/components/PartnerTable.vue'
import { useDeletePartnerMutation } from '@/modules/master-data/partner/composables/usePartnerMutation'
import type { Partner } from '@/modules/master-data/master-data.type'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const isModalOpen = ref(false)
const selectedPartner = ref<Partner | null>(null)
const partnerToDeactivate = ref<Partner | null>(null)
const deactivateMutation = useDeletePartnerMutation()

function openCreate() {
  selectedPartner.value = null
  isModalOpen.value = true
}

function openEdit(partner: Partner) {
  selectedPartner.value = partner
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedPartner.value = null
}

async function deactivatePartner() {
  if (!partnerToDeactivate.value) return

  try {
    await deactivateMutation.mutateAsync(partnerToDeactivate.value.id)
    toast.success('Đã ngừng hoạt động đối tác')
    partnerToDeactivate.value = null
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể ngừng hoạt động đối tác')
  }
}
</script>
