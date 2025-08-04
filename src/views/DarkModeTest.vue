<!-- 暗黑模式测试页面 -->
<template>
  <div class="min-h-screen bg-white p-8 dark:bg-gray-900">
    <div class="mx-auto max-w-md">
      <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">暗黑模式测试</h1>

      <div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
        <p class="text-gray-700 dark:text-gray-300">这是一个测试段落，用来验证暗黑模式是否正常工作。</p>
      </div>

      <button @click="toggleDark" class="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
        切换暗黑模式
      </button>

      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">当前状态: {{ isDark ? '暗黑模式' : '亮色模式' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isDark = ref(false);

const toggleDark = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
</script>
