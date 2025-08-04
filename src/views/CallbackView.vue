<!-- src/views/CallbackView.vue -->
<template>
  <div class="mx-auto max-w-2xl p-8 text-center">
    <div class="rounded-lg bg-white p-8 shadow-lg">
      <el-loading v-if="processing" />
      <p class="text-gray-600">正在处理授权请求，请稍候...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/modules/auth';

const authStore = useAuthStore();
const route = useRoute();
const processing = ref(false);

const redirectUri = computed(() => route.query.redirect_uri as string);
const state = computed(() => route.query.state as string);
const codeChallenge = computed(() => route.query.code_challenge as string);
const codeChallengeMethod = computed(() => route.query.code_challenge_method as string);

async function handleCallback() {
  if (!redirectUri.value || !codeChallenge.value) {
    ElMessage.error('缺少必需的授权参数，请检查回调链接');
    return;
  }

  processing.value = true;
  try {
    await authStore.handleAuthorize(redirectUri.value, codeChallenge.value, state.value, codeChallengeMethod.value);
  } catch (error) {
    console.error('授权处理失败:', error);
    ElMessage.error('授权处理失败，请重试');
  } finally {
    processing.value = false;
  }
}

onMounted(() => {
  console.log('OAuth回调处理中...');
  handleCallback();
});
</script>
