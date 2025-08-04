<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navbar from '@/components/common/Navbar.vue';
import { useThemeStore } from '@/stores/modules/theme';

useThemeStore();
</script>

<template>
  <div id="app-container" class="flex min-h-screen flex-col bg-gray-50 transition-colors dark:bg-gray-900">
    <Navbar />
    <main class="main-content flex w-full flex-1 flex-col items-center justify-center p-4 md:p-8">
      <RouterView />
    </main>
  </div>
</template>

<style></style>
