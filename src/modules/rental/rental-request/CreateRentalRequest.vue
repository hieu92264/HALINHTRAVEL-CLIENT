<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div class="min-w-0">
        <nav class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <RouterLink
            class="transition-colors hover:text-foreground"
            :to="{ name: 'rental-requests' }"
          >
            Thuê xe
          </RouterLink>
          <ChevronRight class="size-4" />
          <RouterLink
            class="transition-colors hover:text-foreground"
            :to="{ name: 'rental-requests' }"
          >
            Yêu cầu thuê
          </RouterLink>
          <ChevronRight class="size-4" />
          <span class="font-medium text-foreground">Tạo mới</span>
        </nav>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Tạo yêu cầu thuê xe
        </h1>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant="outline" class="h-10 min-w-32">
          <FileText class="size-4" />
          Lưu nháp
        </Button>
        <Button class="h-10 min-w-36">
          <Send class="size-4" />
          Tạo yêu cầu
        </Button>
      </div>
    </header>

    <div class="rounded-lg border bg-card shadow-sm">
      <div class="border-b px-5 py-4">
        <h2 class="text-lg font-semibold text-foreground">Thông tin khách hàng</h2>
      </div>

      <div class="grid gap-4 p-5 lg:grid-cols-3">
        <FormField label="Khách hàng" required>
          <Select v-model="form.customer">
            <SelectTrigger class="h-10 w-full bg-background">
              <Building2 class="size-4 text-muted-foreground" />
              <SelectValue placeholder="Chọn khách hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="customer in customers" :key="customer" :value="customer">
                {{ customer }}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Nguồn yêu cầu" required>
          <Select v-model="form.source">
            <SelectTrigger class="h-10 w-full bg-background">
              <SelectValue placeholder="Chọn nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="source in sources" :key="source" :value="source">
                {{ source }}
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Thời điểm tiếp nhận" required>
          <div class="relative">
            <CalendarDays
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input v-model="form.receivedAt" class="h-10 bg-background pl-9 pr-9" />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Xóa thời điểm tiếp nhận"
              @click="form.receivedAt = ''"
            >
              <X class="size-4" />
            </button>
          </div>
        </FormField>
      </div>
    </div>

    <div class="rounded-lg border bg-card shadow-sm">
      <Tabs v-model="form.tripMode" class="w-full">
        <div
          class="flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center md:justify-between"
        >
          <h2 class="text-lg font-semibold text-foreground">Chi tiết chuyến đi</h2>
          <TabsList class="h-10 w-full justify-start bg-background p-0 md:w-auto">
            <TabsTrigger
              value="route"
              class="h-10 border border-transparent px-4 data-[state=active]:border-primary/25 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Theo tuyến có sẵn
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              class="h-10 border border-transparent px-4 data-[state=active]:border-primary/25 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Nhập hành trình
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="route">
          <TripFields />
        </TabsContent>
        <TabsContent value="custom">
          <TripFields />
        </TabsContent>
      </Tabs>
    </div>

    <div class="rounded-lg border bg-card shadow-sm">
      <div class="border-b px-5 py-4">
        <h2 class="text-lg font-semibold text-foreground">Hạng mục yêu cầu</h2>
      </div>

      <div class="space-y-5 p-5">
        <div class="overflow-x-auto rounded-lg border">
          <table class="w-full min-w-[760px] border-collapse text-sm">
            <thead class="bg-muted/70 text-left font-semibold text-muted-foreground">
              <tr>
                <th class="w-72 px-4 py-3">Loại xe</th>
                <th class="w-36 px-4 py-3">Số lượng</th>
                <th class="px-4 py-3">Ghi chú</th>
                <th class="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr class="bg-card">
                <td class="px-4 py-3">
                  <Select v-model="vehicleItem.type">
                    <SelectTrigger class="h-10 w-full bg-background">
                      <Bus class="size-4 text-muted-foreground" />
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="vehicle in vehicleTypes" :key="vehicle" :value="vehicle">
                        {{ vehicle }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td class="px-4 py-3">
                  <Input
                    v-model="vehicleItem.quantity"
                    class="h-10 bg-background"
                    type="number"
                    min="1"
                  />
                </td>
                <td class="px-4 py-3">
                  <Input v-model="vehicleItem.note" class="h-10 bg-background" />
                </td>
                <td class="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    class="text-destructive"
                    aria-label="Xóa hạng mục"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button variant="outline" class="h-9">
          <CirclePlus class="size-4" />
          Thêm hạng mục
        </Button>

        <FormField label="Ghi chú nội bộ">
          <div class="relative">
            <textarea
              v-model="form.internalNote"
              class="min-h-24 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              maxlength="500"
              placeholder="Khách yêu cầu xe đời mới, ưu tiên tài xế có kinh nghiệm tuyến Hạ Long."
            />
            <span class="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {{ form.internalNote.length }}/500
            </span>
          </div>
        </FormField>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  Building2,
  Bus,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  FileText,
  MapPin,
  Send,
  Trash2,
  X,
} from '@lucide/vue'
import { defineComponent, h, reactive } from 'vue'
import { RouterLink } from 'vue-router'

type TripMode = 'route' | 'custom'

const customers = ['Công ty Hải Phòng Xanh', 'Trường THPT Ngô Quyền', 'Công ty Minh Phát']
const sources = ['Zalo', 'Website', 'Hotline', 'Khách quen']
const services = ['Tour du lịch', 'Đưa đón học sinh', 'Thuê xe theo hợp đồng', 'Đưa đón công nhân']
const locations = [
  'Hà Nội - Văn phòng Cầu Giấy',
  'Hạ Long - Bãi Cháy',
  'Hải Phòng - Văn phòng trung tâm',
  'Ninh Bình - Tràng An',
]
const vehicleTypes = ['Xe 45 chỗ', 'Xe 29 chỗ', 'Xe 16 chỗ', 'Limousine 9 chỗ']

const form = reactive({
  customer: customers[0],
  source: sources[0],
  receivedAt: '14/04/2025 09:30',
  tripMode: 'route' as TripMode,
  service: services[0],
  pickup: locations[0],
  dropoff: locations[1],
  startAt: '20/04/2025 06:00',
  endAt: '20/04/2025 18:00',
  internalNote: '',
})

const vehicleItem = reactive({
  type: vehicleTypes[0],
  quantity: 2,
  note: 'Có nước uống',
})

const FormField = defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'space-y-2' }, [
        h(Label, { class: 'text-sm font-semibold text-foreground' }, () => [
          props.label,
          props.required ? h('span', { class: 'text-destructive' }, ' *') : null,
        ]),
        slots.default?.(),
      ])
  },
})

const TripFields = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'grid gap-5 p-5' }, [
        h('div', { class: 'flex flex-col gap-2 sm:flex-row sm:items-center' }, [
          h(Label, { class: 'min-w-20 text-sm font-semibold text-foreground' }, () => [
            'Dịch vụ',
            h('span', { class: 'text-destructive' }, ' *'),
          ]),
          h(
            Select,
            {
              modelValue: form.service,
              'onUpdate:modelValue': (value) => (form.service = String(value ?? '')),
            },
            () => [
              h(SelectTrigger, { class: 'h-10 w-full bg-background lg:w-[460px]' }, () => [
                h(Bus, { class: 'size-4 text-muted-foreground' }),
                h(SelectValue, { placeholder: 'Chọn dịch vụ' }),
              ]),
              h(SelectContent, null, () =>
                services.map((service) =>
                  h(SelectItem, { key: service, value: service }, () => service),
                ),
              ),
            ],
          ),
        ]),
        h(
          'div',
          { class: 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] xl:items-end' },
          [
            h(FormField, { label: 'Điểm đón', required: true }, () =>
              h(
                Select,
                {
                  modelValue: form.pickup,
                  'onUpdate:modelValue': (value) => (form.pickup = String(value ?? '')),
                },
                () => [
                  h(SelectTrigger, { class: 'h-10 w-full bg-background' }, () => [
                    h(MapPin, { class: 'size-4 text-primary' }),
                    h(SelectValue, { placeholder: 'Chọn điểm đón' }),
                  ]),
                  h(SelectContent, null, () =>
                    locations.map((location) =>
                      h(SelectItem, { key: location, value: location }, () => location),
                    ),
                  ),
                ],
              ),
            ),
            h('div', { class: 'hidden h-10 items-center justify-center xl:flex' }, [
              h('span', { class: 'h-px w-full border-t border-dashed border-primary/70' }),
              h(Bus, { class: 'mx-2 size-5 shrink-0 text-primary' }),
              h('span', { class: 'h-px w-full border-t border-dashed border-primary/70' }),
            ]),
            h(FormField, { label: 'Điểm trả', required: true }, () =>
              h(
                Select,
                {
                  modelValue: form.dropoff,
                  'onUpdate:modelValue': (value) => (form.dropoff = String(value ?? '')),
                },
                () => [
                  h(SelectTrigger, { class: 'h-10 w-full bg-background' }, () => [
                    h(MapPin, { class: 'size-4 text-primary' }),
                    h(SelectValue, { placeholder: 'Chọn điểm trả' }),
                  ]),
                  h(SelectContent, null, () =>
                    locations.map((location) =>
                      h(SelectItem, { key: location, value: location }, () => location),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        h('div', { class: 'grid gap-5 lg:grid-cols-2' }, [
          h(FormField, { label: 'Khởi hành', required: true }, () =>
            h('div', { class: 'relative' }, [
              h(CalendarDays, {
                class:
                  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
              }),
              h(Input, {
                modelValue: form.startAt,
                'onUpdate:modelValue': (value) => (form.startAt = String(value)),
                class: 'h-10 bg-background pl-9 pr-9',
              }),
              h(
                'button',
                {
                  type: 'button',
                  class:
                    'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground',
                  'aria-label': 'Xóa thời gian khởi hành',
                  onClick: () => (form.startAt = ''),
                },
                h(X, { class: 'size-4' }),
              ),
            ]),
          ),
          h(FormField, { label: 'Kết thúc', required: true }, () =>
            h('div', { class: 'relative' }, [
              h(CalendarDays, {
                class:
                  'pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
              }),
              h(Input, {
                modelValue: form.endAt,
                'onUpdate:modelValue': (value) => (form.endAt = String(value)),
                class: 'h-10 bg-background pl-9 pr-9',
              }),
              h(
                'button',
                {
                  type: 'button',
                  class:
                    'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground',
                  'aria-label': 'Xóa thời gian kết thúc',
                  onClick: () => (form.endAt = ''),
                },
                h(X, { class: 'size-4' }),
              ),
            ]),
          ),
        ]),
      ])
  },
})
</script>
