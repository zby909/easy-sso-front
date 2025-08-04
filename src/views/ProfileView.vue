<!-- src/views/ProfileView.vue -->
<template>
  <div class="mx-auto max-w-2xl p-8 text-center">
    <div class="rounded-lg bg-white p-8 shadow-lg">
      <h2 class="mb-6 text-2xl font-bold text-blue-500">个人中心</h2>

      <div class="space-y-4">
        <!-- 用户名信息 -->
        <div class="flex items-center justify-between">
          <div class="text-left">
            <span class="text-sm text-gray-500">用户名</span>
            <p class="text-lg text-gray-900">{{ userStore.userName || '未设置' }}</p>
          </div>
          <Icon icon="mdi:account-circle-outline" class="text-gray-400" />
        </div>

        <!-- 邮箱信息 -->
        <div class="flex items-center justify-between">
          <div class="text-left">
            <span class="text-sm text-gray-500">邮箱</span>
            <p class="text-lg text-gray-900">{{ userStore.userEmail || '未设置' }}</p>
          </div>
          <Icon icon="mdi:email-outline" class="text-gray-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user';
import { Icon } from '@iconify/vue';

const userStore = useUserStore();
</script>
