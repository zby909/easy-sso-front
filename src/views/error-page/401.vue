<template>
  <div class="mx-auto mt-24 w-full max-w-4xl px-4">
    <el-button :icon="ArrowLeft" class="mb-4" @click="back">返回</el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-6xl font-bold text-gray-600 dark:text-gray-300">401</h1>
        <h2 class="mt-4 text-2xl font-medium text-gray-700 dark:text-gray-200">你没有权限访问此页面</h2>
        <p class="mt-2 text-gray-500 dark:text-gray-400">如需管理权限，请联系管理员。</p>
        <router-link to="/profile" class="mt-6 inline-block text-blue-500 hover:underline">返回个人中心</router-link>
      </el-col>
      <el-col :span="12">
        <img src="@/assets/401_images/401.gif" width="313" height="428" alt="暂无访问权限" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
// 无返回历史时回到个人中心，权限仍由现有路由守卫确认。
function back() {
  if (route.query.noGoBack || !window.history.state?.back) void router.push('/profile');
  else router.back();
}
</script>
