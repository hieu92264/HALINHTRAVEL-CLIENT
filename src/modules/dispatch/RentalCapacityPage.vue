<script setup lang="ts">
import {
  AlertTriangleIcon,
  BusFrontIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  LoaderCircleIcon,
  MinusIcon,
  PlusIcon,
  SearchCheckIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  XIcon,
} from '@lucide/vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { DispatchService } from '@/services/dispatch.service'
import { useVehicleTypeQuery } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
import { usePartnerOptionsQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  createCapacityItem,
  isCapacityFormValid,
  toAvailabilityPayload,
  validateCapacityForm,
} from './capacity-form'

const startAt = ref('')
const endAt = ref('')
const ownership = ref<'' | 'company' | 'partner'>('')
const partnerId = ref<number | null>(null)
const items = ref([createCapacityItem(1)])
const nextId = ref(2)
const validationVisible = ref(false)
const formElement = ref<HTMLElement | null>(null)
const filtersOpen = ref(false)
const vehicleTypesQuery = useVehicleTypeQuery()
const partnerOptionsQuery = usePartnerOptionsQuery()
const availability = useMutation({ mutationFn: DispatchService.checkAvailability })

const form = computed(() => ({
  startAt: startAt.value,
  endAt: endAt.value,
  ownership: ownership.value,
  partnerId: partnerId.value,
  items: items.value,
}))
const errors = computed(() => validateCapacityForm(form.value))
const isFormValid = computed(() => isCapacityFormValid(form.value))
const isChecked = computed(() => availability.isSuccess.value)
const canFulfill = computed(() => availability.data.value?.can_fulfill ?? false)
const totalNeeded = computed(() =>
  items.value.reduce((total, item) => total + item.quantity, 0),
)
const selectedVehicleTypeIds = computed(
  () =>
    new Set(
      items.value
        .map((item) => item.vehicleTypeId)
        .filter((id): id is number => id !== null),
    ),
)
const canAddVehicleType = computed(
  () => (vehicleTypesQuery.data.value?.length ?? 0) > selectedVehicleTypeIds.value.size,
)
const sourceLabel = computed(() =>
  ownership.value === 'company'
    ? 'Xe công ty'
    : ownership.value === 'partner'
      ? 'Xe đối tác'
      : 'Tất cả nguồn xe',
)

watch(ownership, (value) => {
  if (value === 'company') partnerId.value = null
})
watch(partnerId, (value) => {
  if (value !== null) ownership.value = 'partner'
})
watch([startAt, endAt, ownership, partnerId, items], () => {
  if (availability.isSuccess.value || availability.isError.value) availability.reset()
}, { deep: true })

function vehicleTypeName(id: number | null): string {
  return (
    vehicleTypesQuery.data.value?.find((type) => type.id === id)?.name ?? 'Chọn loại xe'
  )
}
function isSelectedByAnotherItem(vehicleTypeId: number, itemId: number): boolean {
  return items.value.some(
    (item) => item.id !== itemId && item.vehicleTypeId === vehicleTypeId,
  )
}
function addItem(): void {
  if (!canAddVehicleType.value) return
  items.value.push(createCapacityItem(nextId.value++))
  validationVisible.value = true
}
function removeItem(id: number): void {
  if (items.value.length === 1) return
  items.value = items.value.filter((item) => item.id !== id)
}
function updateQuantity(itemId: number, delta: number): void {
  const item = items.value.find((candidate) => candidate.id === itemId)
  if (item) item.quantity = Math.max(1, item.quantity + delta)
}
function resultFor(vehicleTypeId: number | null) {
  return availability.data.value?.vehicle_capacities.find(
    (result) => result.vehicle_type_id === vehicleTypeId,
  )
}
async function focusFirstError(): Promise<void> {
  await nextTick()
  formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
function checkCapacity(): void {
  validationVisible.value = true
  if (!isFormValid.value) {
    void focusFirstError()
    return
  }
  availability.mutate(toAvailabilityPayload(form.value))
}
</script>

<template>
  <section class="mx-auto max-w-6xl space-y-6">
    <!-- Header -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="flex items-center gap-2 text-sm font-medium text-primary">
          <SearchCheckIcon class="size-4" /> Điều hành / Kiểm tra năng lực
        </div>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Kiểm tra năng lực
        </h1>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Chọn thời gian và số xe cần dùng để kiểm tra nguồn xe, tài xế có thể phục vụ.
        </p>
      </div>
    </header>

    <!-- Form -->
    <form
      ref="formElement"
      class="rounded-xl border border-border bg-card"
      @submit.prevent="checkCapacity"
      @input="validationVisible = true"
      @change="validationVisible = true"
    >
      <div class="border-b border-border px-5 py-4">
        <h2 class="font-bold text-foreground">Nhu cầu điều phối</h2>
        <p class="mt-1 text-xs text-muted-foreground">
          Các trường có dấu * là bắt buộc.
        </p>
      </div>
      <fieldset class="space-y-6 p-5" :disabled="availability.isPending.value">
        <!-- Time Range -->
        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid gap-1.5">
            <Label for="capacity-start">
              Bắt đầu <span class="text-destructive">*</span>
            </Label>
            <Input
              id="capacity-start"
              v-model="startAt"
              type="datetime-local"
              :class="validationVisible && errors.startAt ? 'border-destructive' : ''"
              :aria-invalid="Boolean(validationVisible && errors.startAt)"
              aria-describedby="capacity-start-error"
            />
            <p
              v-if="validationVisible && errors.startAt"
              id="capacity-start-error"
              class="text-xs text-destructive"
            >
              {{ errors.startAt }}
            </p>
          </div>
          <div class="grid gap-1.5">
            <Label for="capacity-end">
              Kết thúc <span class="text-destructive">*</span>
            </Label>
            <Input
              id="capacity-end"
              v-model="endAt"
              type="datetime-local"
              :class="validationVisible && errors.endAt ? 'border-destructive' : ''"
              :aria-invalid="Boolean(validationVisible && errors.endAt)"
              aria-describedby="capacity-end-error"
            />
            <p
              v-if="validationVisible && errors.endAt"
              id="capacity-end-error"
              class="text-xs text-destructive"
            >
              {{ errors.endAt }}
            </p>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="rounded-lg border border-border bg-muted/25">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-foreground"
            @click="filtersOpen = !filtersOpen"
          >
            <SlidersHorizontalIcon class="size-4 text-primary" />
            Bộ lọc nâng cao
            <svg
              class="ml-auto size-4 text-muted-foreground transition-transform"
              :class="filtersOpen ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-96 opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="max-h-96 opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-show="filtersOpen" class="overflow-hidden border-t border-border">
              <div class="grid gap-4 p-4 md:grid-cols-2">
                <div class="grid gap-1.5">
                  <Label for="capacity-ownership">Nguồn xe</Label>
                  <select
                    id="capacity-ownership"
                    v-model="ownership"
                    class="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Tất cả nguồn xe</option>
                    <option value="company">Xe công ty</option>
                    <option value="partner">Xe đối tác</option>
                  </select>
                </div>
                <div class="grid gap-1.5">
                  <Label for="capacity-partner">Đối tác</Label>
                  <select
                    id="capacity-partner"
                    v-model.number="partnerId"
                    class="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted"
                    :disabled="ownership === 'company'"
                  >
                    <option :value="null">
                      {{ ownership === 'company' ? 'Chỉ áp dụng cho xe đối tác' : 'Tất cả đối tác' }}
                    </option>
                    <option
                      v-for="partner in partnerOptionsQuery.data.value ?? []"
                      :key="partner.id"
                      :value="partner.id"
                    >
                      {{ partner.name }}
                    </option>
                  </select>
                  <p
                    v-if="partnerId !== null"
                    class="text-xs text-muted-foreground"
                  >
                    Đã tự chọn nguồn xe đối tác.
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Vehicle Type Items -->
        <fieldset class="space-y-3" aria-describedby="capacity-items-error">
          <div class="flex items-center justify-between gap-3">
            <div>
              <legend class="text-sm font-bold text-foreground">
                Loại xe yêu cầu <span class="text-destructive">*</span>
              </legend>
              <p class="mt-1 text-xs text-muted-foreground">
                Mỗi loại xe chỉ thêm một lần.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              :disabled="!canAddVehicleType"
              type="button"
              @click="addItem"
            >
              <PlusIcon class="size-4" />Thêm loại xe
            </Button>
          </div>
          <div class="space-y-2">
            <div
              v-for="item in items"
              :key="item.id"
              class="grid items-center gap-3 rounded-lg border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_144px_40px]"
            >
              <div class="grid gap-1">
                <span class="sr-only">Loại xe</span>
                <select
                  v-model.number="item.vehicleTypeId"
                  class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                  :aria-invalid="Boolean(validationVisible && errors.items)"
                  :aria-label="`Loại xe yêu cầu dòng ${item.id}`"
                >
                  <option :value="null">Chọn loại xe</option>
                  <option
                    v-for="vehicleType in vehicleTypesQuery.data.value ?? []"
                    :key="vehicleType.id"
                    :value="vehicleType.id"
                    :disabled="isSelectedByAnotherItem(vehicleType.id, item.id)"
                  >
                    {{ vehicleType.name }}
                  </option>
                </select>
              </div>
              <div
                class="flex h-9 overflow-hidden rounded-md border border-input"
                aria-label="Số lượng xe"
              >
                <button
                  class="grid w-10 place-items-center text-muted-foreground hover:bg-muted"
                  :aria-label="`Giảm số lượng ${vehicleTypeName(item.vehicleTypeId)}`"
                  type="button"
                  @click="updateQuantity(item.id, -1)"
                >
                  <MinusIcon class="size-4" />
                </button>
                <input
                  v-model.number="item.quantity"
                  class="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold tabular-nums outline-none"
                  min="1"
                  step="1"
                  type="number"
                  :aria-invalid="Boolean(validationVisible && errors.items)"
                />
                <button
                  class="grid w-10 place-items-center text-muted-foreground hover:bg-muted"
                  :aria-label="`Tăng số lượng ${vehicleTypeName(item.vehicleTypeId)}`"
                  type="button"
                  @click="updateQuantity(item.id, 1)"
                >
                  <PlusIcon class="size-4" />
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                :aria-label="`Xoá ${vehicleTypeName(item.vehicleTypeId)}`"
                :disabled="items.length === 1"
                type="button"
                @click="removeItem(item.id)"
              >
                <XIcon class="size-4" />
              </Button>
            </div>
          </div>
          <p
            v-if="validationVisible && errors.items"
            id="capacity-items-error"
            class="text-xs text-destructive"
          >
            {{ errors.items }}
          </p>
        </fieldset>

        <!-- Submit -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p class="text-xs text-muted-foreground">
            Kết quả là snapshot, không giữ xe hoặc tài xế.
          </p>
          <Button
            type="submit"
            :disabled="!isFormValid || availability.isPending.value"
          >
            <LoaderCircleIcon
              v-if="availability.isPending.value"
              class="size-4 animate-spin"
            />
            <SearchCheckIcon v-else class="size-4" />
            {{ availability.isPending.value ? 'Đang kiểm tra…' : 'Kiểm tra năng lực' }}
          </Button>
        </div>
      </fieldset>
    </form>

    <!-- Loading State -->
    <section
      v-if="availability.isPending.value"
      class="space-y-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="h-16 animate-pulse rounded-xl bg-muted" />
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="h-56 animate-pulse rounded-xl bg-muted" />
        <div class="h-56 animate-pulse rounded-xl bg-muted" />
      </div>
    </section>

    <!-- Error State -->
    <section
      v-else-if="availability.isError.value"
      class="rounded-xl border border-destructive/20 bg-destructive/5 p-5"
      role="alert"
    >
      <h2 class="font-bold text-destructive">Không thể kiểm tra năng lực</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Hãy kiểm tra lại thời gian, loại xe và bộ lọc rồi thử lại.
      </p>
      <Button
        variant="destructive"
        size="sm"
        class="mt-3"
        type="button"
        @click="checkCapacity"
      >
        Thử lại
      </Button>
    </section>

    <!-- Results -->
    <section v-else-if="isChecked" class="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-live="polite">
      <!-- Summary Banner -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/10 p-5">
        <div>
          <h2 class="text-lg font-bold text-foreground">Kết quả năng lực</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ new Date(startAt).toLocaleString('vi-VN') }} →
            {{ new Date(endAt).toLocaleString('vi-VN') }} · {{ sourceLabel }}
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
          :class="
            canFulfill
              ? 'bg-success/10 text-success'
              : 'bg-destructive/10 text-destructive'
          "
        >
          <CheckCircle2Icon v-if="canFulfill" class="size-4" />
          <CircleAlertIcon v-else class="size-4" />
          {{ canFulfill ? 'Có thể đáp ứng' : 'Chưa đủ nguồn lực' }}
        </span>
      </div>

      <!-- Detailed Results (Stacked layout) -->
      <div class="space-y-6 p-5">
        <!-- Drivers Panel -->
        <article class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 p-4">
            <div class="flex items-center gap-3">
              <span class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <UserRoundIcon class="size-4" />
              </span>
              <div>
                <h3 class="font-bold text-foreground">Năng lực tài xế</h3>
                <p class="text-xs text-muted-foreground">Yêu cầu tối thiểu {{ totalNeeded }} tài xế</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div class="grid text-right">
                <span class="text-xs text-muted-foreground">Khả dụng</span>
                <span class="font-bold text-foreground tabular-nums">
                  {{ availability.data.value?.driver_capacity.available_count ?? 0 }}
                  <span class="text-xs font-normal text-muted-foreground ml-1">
                    ({{ availability.data.value?.driver_capacity.company_available_count ?? 0 }} nhà / {{ availability.data.value?.driver_capacity.partner_available_count ?? 0 }} ngoài)
                  </span>
                </span>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  availability.data.value?.driver_capacity.is_sufficient
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                "
              >
                {{ availability.data.value?.driver_capacity.is_sufficient ? 'Đủ tài xế' : 'Thiếu tài xế' }}
              </span>
            </div>
          </div>
          
          <div class="bg-card p-4 sm:p-5">
            <div
              v-if="(availability.data.value?.driver_capacity.candidates ?? []).length === 0"
              class="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground"
            >
              Không tìm thấy tài xế nào khả dụng trong khung giờ này.
            </div>
            <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <div
                v-for="driver in availability.data.value?.driver_capacity.candidates ?? []"
                :key="driver.id"
                class="flex flex-col justify-center rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/30"
              >
                <span
                  class="font-semibold text-sm text-foreground truncate"
                  :title="`${driver.code} · ${driver.full_name}`"
                >
                  {{ driver.code }} · {{ driver.full_name }}
                </span>
                <span
                  class="mt-1 text-xs text-muted-foreground truncate"
                  :title="driver.ownership_type === 'partner' ? driver.partner_name ?? 'Đối tác' : 'Tài xế công ty'"
                >
                  {{ driver.ownership_type === 'partner' ? driver.partner_name ?? 'Đối tác' : 'Tài xế công ty' }}
                </span>
              </div>
            </div>
          </div>
        </article>

        <!-- Vehicle Panels -->
        <article
          v-for="capacity in availability.data.value?.vehicle_capacities ?? []"
          :key="capacity.vehicle_type_id"
          class="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/20 p-4">
            <div class="flex items-center gap-3">
              <span class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <BusFrontIcon class="size-4" />
              </span>
              <div>
                <h3 class="font-bold text-foreground">{{ capacity.vehicle_type_name }}</h3>
                <p class="text-xs text-muted-foreground">Ứng viên xe trống chuyến</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div class="grid text-right">
                <span class="text-xs text-muted-foreground">Nhu cầu</span>
                <span class="font-bold text-foreground tabular-nums">
                  {{ items.find(i => i.vehicleTypeId === capacity.vehicle_type_id)?.quantity ?? 0 }}
                </span>
              </div>
              <div class="w-px h-6 bg-border hidden sm:block"></div>
              <div class="grid text-right">
                <span class="text-xs text-muted-foreground">Khả dụng</span>
                <span class="font-bold text-foreground tabular-nums">
                  {{ capacity.available_count }}
                  <span class="text-xs font-normal text-muted-foreground ml-1">
                    ({{ capacity.company_available_count }} nhà / {{ capacity.partner_available_count }} ngoài)
                  </span>
                </span>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  capacity.is_sufficient
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                "
              >
                {{ capacity.is_sufficient ? 'Đủ xe' : 'Thiếu xe' }}
              </span>
            </div>
          </div>
          
          <div class="bg-card p-4 sm:p-5">
            <div
              v-if="capacity.candidates.length === 0"
              class="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground"
            >
              Không tìm thấy xe nào khả dụng trong khung giờ này.
            </div>
            <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <div
                v-for="vehicle in capacity.candidates"
                :key="vehicle.id"
                class="flex flex-col justify-center rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/30"
              >
                <span
                  class="font-semibold text-sm tabular-nums text-foreground truncate"
                  :title="vehicle.license_plate"
                >
                  {{ vehicle.license_plate }}
                </span>
                <span
                  class="mt-1 text-xs text-muted-foreground truncate"
                  :title="vehicle.ownership_type === 'partner' ? vehicle.partner_name ?? 'Đối tác' : 'Xe công ty'"
                >
                  {{ vehicle.ownership_type === 'partner' ? vehicle.partner_name ?? 'Đối tác' : 'Xe công ty' }}
                </span>
              </div>
            </div>
          </div>
        </article>

        <!-- Disclaimer -->
        <div
          class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-200"
        >
          <AlertTriangleIcon class="mt-0.5 size-4 shrink-0" />
          Snapshot không giữ tài nguyên. Hãy kiểm tra lại ngay trước khi báo giá, tạo
          hợp đồng hoặc phân công chuyến.
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <section
      v-else
      class="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center"
    >
      <span
        class="mx-auto grid size-10 place-items-center rounded-full bg-primary/10 text-primary"
      >
        <BusFrontIcon class="size-5" />
      </span>
      <h2 class="mt-3 font-bold">Sẵn sàng kiểm tra năng lực</h2>
      <p class="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Nhập thời gian và nhu cầu xe để xem số lượng xe, tài xế và ứng viên phù hợp.
      </p>
    </section>
  </section>
</template>
