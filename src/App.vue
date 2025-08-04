<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from '@/components/common/Navbar.vue';
</script>

<template>
  <div id="app-container" class="bg-bg-light flex min-h-screen flex-col">
    <Navbar />
    <main class="main-content flex w-full flex-1 flex-col items-center justify-center p-4 md:p-8">
      <RouterView />
    </main>
  </div>
</template>

<style></style>
