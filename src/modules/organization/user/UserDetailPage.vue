<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Mail, Clock, CalendarDays, ShieldCheck } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { Button } from '@/shared/components/ui/button'
import AccessDialog from '@/shared/components/feedback/AccessDialog.vue'
import PermissionGroupAccordion from '@/shared/components/feedback/PermissionGroupAccordion.vue'
import UserForm from './components/UserForm.vue'
import { useUserDetail } from './composables/useUserDetail'
import { useUserMutations } from './composables/useUserMutations'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id)

const {
  userQuery,
  rolesQuery,
  permissionsQuery,
  user,
  filteredRoles,
  groupedPermissions,
  roleIds,
  permissionIds,
  permissionSearch,
  roleSearch,
  syncRoles,
  syncPermissions,
  toggleRole,
  togglePermission,
} = useUserDetail(id)

const { toggleActive } = useUserMutations()

/* ---------- UI state ---------- */
const editFormOpen = ref(false)
const confirmToggleOpen = ref(false)

function doToggleActive() {
  if (!user.value) return
  toggleActive.mutate(
    { user: user.value },
    {
      onSettled: () => {
        confirmToggleOpen.value = false
      },
    },
  )
}

/** Chữ cái đầu của tên hiển thị */
function initials(u: typeof user.value): string {
  const name = u?.user_name ?? u?.name ?? '?'
  return (name ?? '?')[0]?.toUpperCase() ?? '?'
}
</script>

<template>
  <!-- Loading -->
  <div
    v-if="userQuery.isLoading.value"
    class="flex items-center justify-center py-16 text-muted-foreground text-sm"
  >
    Đang tải tài khoản…
  </div>

  <!-- Error -->
  <div v-else-if="userQuery.error.value" class="py-16 text-center text-sm text-destructive">
    Không thể tải tài khoản. <button class="underline" @click="userQuery.refetch()">Thử lại</button>
  </div>

  <!-- Content -->
  <section v-else-if="user" class="space-y-5">
    <!-- Page header -->
    <header class="flex items-center gap-3">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Quay lại danh sách tài khoản"
        @click="router.push({ name: 'users' })"
      >
        <ArrowLeft :size="18" />
      </button>
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">{{ user.user_name }}</h1>
        <p class="text-sm text-muted-foreground">Chi tiết tài khoản</p>
      </div>
    </header>

    <!-- Main layout: sidebar + content -->
    <div class="grid gap-5 lg:grid-cols-[260px_1fr]">
      <!-- ── Sidebar: thông tin cơ bản ── -->
      <aside class="space-y-4">
        <div class="rounded-xl border bg-card p-5">
          <!-- Avatar chữ cái đầu -->
          <div class="flex flex-col items-center gap-3 pb-4">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
              :class="user.is_active ? 'bg-[#1769C2]' : 'bg-muted-foreground'"
              aria-hidden="true"
            >
              {{ initials(user) }}
            </div>
            <div class="text-center">
              <p class="font-semibold">{{ user.user_name }}</p>
              <span
                class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="
                  user.is_active
                    ? 'bg-[#2F8A68]/10 text-[#2F8A68]'
                    : 'bg-muted text-muted-foreground'
                "
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="user.is_active ? 'bg-[#2F8A68]' : 'bg-muted-foreground'"
                />
                {{ user.is_active ? 'Đang hoạt động' : 'Vô hiệu hoá' }}
              </span>
            </div>
          </div>

          <!-- Thông tin chi tiết -->
          <dl class="space-y-3 border-t pt-4 text-sm">
            <div v-if="user.email" class="flex items-start gap-2 text-muted-foreground">
              <Mail :size="14" class="mt-0.5 shrink-0" />
              <span class="break-all text-foreground">{{ user.email }}</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <CalendarDays :size="14" class="shrink-0" />
              <span
                >Tạo: <span class="text-foreground">{{ user.created_at ?? '—' }}</span></span
              >
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Clock :size="14" class="shrink-0" />
              <span
                >Đăng nhập:
                <span class="text-foreground">{{
                  user.last_login_at ?? 'Chưa đăng nhập'
                }}</span></span
              >
            </div>
          </dl>

          <!-- Actions -->
          <div class="mt-4 flex flex-col gap-2 border-t pt-4">
            <Button variant="outline" size="sm" class="w-full" @click="editFormOpen = true">
              Sửa thông tin
            </Button>
            <Button
              size="sm"
              class="w-full"
              :variant="user.is_active ? 'destructive' : 'outline'"
              @click="confirmToggleOpen = true"
            >
              {{ user.is_active ? 'Vô hiệu hoá' : 'Kích hoạt lại' }}
            </Button>
          </div>
        </div>

        <!-- Quyền hiệu lực -->
        <div class="rounded-xl border bg-card p-4">
          <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck :size="15" class="text-[#1769C2]" />
            Quyền hiệu lực
            <span
              class="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground"
            >
              {{ user.permissions?.length ?? 0 }}
            </span>
          </h2>
          <div v-if="user.permissions?.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="perm in user.permissions"
              :key="perm"
              class="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {{ perm }}
            </span>
          </div>
          <p v-else class="text-xs text-muted-foreground">Chưa có quyền hiệu lực.</p>
        </div>
      </aside>

      <!-- ── Main: vai trò + quyền ngoại lệ ── -->
      <div class="space-y-5">
        <!-- Vai trò -->
        <section class="rounded-xl border bg-card">
          <header class="flex items-center justify-between border-b px-5 py-3">
            <h2 class="font-semibold">Vai trò trực tiếp</h2>
            <span
              class="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground"
            >
              {{ roleIds.length }} được chọn
            </span>
          </header>

          <div v-if="rolesQuery.data.value" class="p-4 space-y-3">
            <!-- Tìm role -->
            <input
              v-model="roleSearch"
              type="search"
              class="h-8 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tìm vai trò…"
            />

            <div class="max-h-48 overflow-auto divide-y rounded-lg border">
              <label
                v-for="role in filteredRoles"
                :key="role.id"
                class="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  :checked="roleIds.includes(role.id)"
                  class="h-4 w-4 accent-[#1769C2]"
                  @change="toggleRole(role.id)"
                />
                <span class="flex-1">{{ role.name }}</span>
                <span class="text-xs tabular-nums text-muted-foreground">
                  {{ role.permissions.length }} quyền
                </span>
              </label>
              <p
                v-if="filteredRoles.length === 0"
                class="px-4 py-4 text-center text-sm text-muted-foreground"
              >
                Không tìm thấy vai trò.
              </p>
            </div>
          </div>
          <p v-else class="p-5 text-sm text-muted-foreground">
            Không có quyền xem danh mục vai trò.
          </p>

          <footer v-if="rolesQuery.data.value" class="flex justify-end border-t px-5 py-3">
            <Button size="sm" :disabled="syncRoles.isPending.value" @click="syncRoles.mutate()">
              {{ syncRoles.isPending.value ? 'Đang lưu…' : 'Lưu vai trò' }}
            </Button>
          </footer>
        </section>

        <!-- Quyền ngoại lệ -->
        <section class="rounded-xl border bg-card">
          <header class="flex items-center justify-between border-b px-5 py-3">
            <h2 class="font-semibold">Quyền ngoại lệ</h2>
            <span
              class="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground"
            >
              {{ permissionIds.length }} được chọn
            </span>
          </header>

          <div v-if="permissionsQuery.data.value" class="p-4 space-y-3">
            <!-- Tìm quyền -->
            <input
              v-model="permissionSearch"
              type="search"
              class="h-8 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tìm quyền…"
            />

            <PermissionGroupAccordion
              :groups="groupedPermissions"
              :checked-ids="permissionIds"
              @toggle="togglePermission"
            />
          </div>
          <p v-else class="p-5 text-sm text-muted-foreground">Không có quyền xem danh mục quyền.</p>

          <footer v-if="permissionsQuery.data.value" class="flex justify-end border-t px-5 py-3">
            <Button
              size="sm"
              :disabled="syncPermissions.isPending.value"
              @click="syncPermissions.mutate()"
            >
              {{ syncPermissions.isPending.value ? 'Đang lưu…' : 'Lưu quyền ngoại lệ' }}
            </Button>
          </footer>
        </section>
      </div>
    </div>
  </section>

  <!-- Edit form dialog -->
  <UserForm :open="editFormOpen" :user="user" @close="editFormOpen = false" />

  <!-- Confirm toggle active -->
  <AccessDialog
    :open="confirmToggleOpen"
    :title="user?.is_active ? 'Vô hiệu hoá tài khoản' : 'Kích hoạt lại tài khoản'"
    :description="
      user?.is_active
        ? `Tài khoản «${user?.user_name}» sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`
        : `Tài khoản «${user?.user_name}» sẽ được phép đăng nhập trở lại.`
    "
    :confirm-label="user?.is_active ? 'Vô hiệu hoá' : 'Kích hoạt'"
    :destructive="user?.is_active ?? false"
    :pending="toggleActive.isPending.value"
    @close="confirmToggleOpen = false"
    @confirm="doToggleActive"
  />
</template>
