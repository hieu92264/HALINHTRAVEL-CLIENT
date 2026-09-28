<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
</script>

<template>
  <main class="grid min-h-svh lg:grid-cols-2">
    <section class="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="flex items-center gap-3 text-lg font-semibold">
        <span class="grid size-9 place-items-center rounded-xl bg-blue-500 font-bold">HL</span>
        Hà Linh Travel
      </div>
      <div class="max-w-lg space-y-5">
        <p class="text-sm font-medium tracking-[0.2em] text-blue-300 uppercase">Operations center</p>
        <h1 class="text-4xl leading-tight font-semibold">Vận hành chuyến xe chính xác, minh bạch.</h1>
        <p class="text-slate-300">
          Không gian làm việc dành cho điều phối, quản lý phương tiện và tài xế Hà Linh Travel.
        </p>
      </div>
      <p class="text-sm text-slate-400">© Hà Linh Travel</p>
    </section>

    <section class="flex items-center justify-center bg-muted/35 px-5 py-12">
      <div class="w-full max-w-sm rounded-2xl border bg-card p-7 shadow-xl shadow-slate-950/5">
        <div class="mb-7 space-y-2">
          <p class="text-sm font-medium text-blue-600">Hà Linh Travel</p>
          <h2 class="text-2xl font-semibold tracking-tight">Chào mừng trở lại</h2>
          <p class="text-sm text-muted-foreground">Đăng nhập để tiếp tục vào hệ thống điều hành.</p>
        </div>
        <LoginForm />
      </div>
    </section>
  </main>
</template>
