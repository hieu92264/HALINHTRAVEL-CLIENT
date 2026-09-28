<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
</script>

<template>
  <main class="grid min-h-svh lg:grid-cols-[480px_1fr]">
    <!-- Left panel -->
    <section
      class="relative hidden overflow-hidden bg-[#0d1b2e] p-10 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <!-- Background pattern -->
      <div class="absolute inset-0 overflow-hidden">
        <svg
          class="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <!-- Decorative circles -->
        <div class="absolute -top-20 -left-20 size-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div class="absolute bottom-20 right-10 size-48 rounded-full bg-blue-400/10 blur-2xl" />
      </div>

      <!-- Top: logo -->
      <div class="relative flex items-center gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-500">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 7l9-5 9 5v10l-9 5-9-5V7z" />
            <path d="M12 2v20" />
            <path d="M3 7l9 5 9-5" />
          </svg>
        </div>
        <div>
          <p class="text-base font-bold leading-tight">Hà Linh Travel</p>
          <p class="text-xs text-blue-300">Hệ thống quản lý vận hành</p>
        </div>
      </div>

      <!-- Middle: headline -->
      <div class="relative space-y-6">
        <div class="w-8 h-0.5 bg-blue-400" />
        <div class="space-y-4">
          <h1 class="text-3xl font-bold leading-snug">Kết nối hành trình<br />vận hành hiệu quả</h1>
          <p class="text-sm leading-relaxed text-slate-300">
            Quản lý tour, điều phối phương tiện,<br />
            khách hàng và đối tác trên một nền tảng<br />
            thống nhất, an toàn và tin cậy.
          </p>
        </div>

        <!-- Features -->
        <div class="space-y-4 pt-2">
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-300"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold">Bảo mật dữ liệu</p>
              <p class="text-xs text-slate-400">Đạt tiêu chuẩn an toàn doanh nghiệp</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-300"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold">Đồng hành cùng đội ngũ</p>
              <p class="text-xs text-slate-400">Tối ưu vận hành mỗi ngày</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-blue-300"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold">Phát triển bền vững</p>
              <p class="text-xs text-slate-400">Kiến tạo trải nghiệm du lịch tốt hơn</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom: tagline -->
      <div class="relative flex items-center gap-3">
        <div class="h-px w-10 bg-slate-600" />
        <p class="text-xs italic text-slate-500">Mọi hành trình đều có điểm đến tốt đẹp hơn</p>
      </div>
    </section>

    <!-- Right panel -->
    <section class="flex flex-col bg-[#f8fafc] dark:bg-background">
      <!-- Top bar -->
      <div
        class="flex items-center justify-end gap-3 border-b border-slate-200 dark:border-border px-6 py-3"
      >
        <button
          class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-muted dark:text-muted-foreground"
          type="button"
          aria-label="Chuyển giao diện"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
        <div class="h-4 w-px bg-slate-200 dark:bg-border" />
        <button
          class="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-muted"
          type="button"
        >
          <span class="font-semibold">VI</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <!-- Form area -->
      <div class="flex flex-1 items-center justify-center px-5 py-12">
        <div class="w-full max-w-md">
          <!-- Card -->
          <div
            class="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-8 shadow-sm"
          >
            <div class="mb-7 space-y-1 text-center">
              <h2 class="text-2xl font-bold tracking-tight text-slate-800 dark:text-foreground">
                Đăng nhập hệ thống
              </h2>
              <p class="text-sm text-slate-500 dark:text-muted-foreground">
                Chào mừng bạn quay trở lại Hà Linh Travel
              </p>
            </div>
            <LoginForm />
          </div>

          <!-- Footer -->
          <p class="mt-6 text-center text-xs text-slate-400 dark:text-muted-foreground">
            © 2026 Hà Linh Travel. Nội bộ doanh nghiệp. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
