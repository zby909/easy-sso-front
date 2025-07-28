<!-- src/views/ProfileView.vue -->
<template>
  <div class="profile-container">
    <p v-if="!redirectUri">欢迎回来, {{ userStore.userInfo?.name || userStore.userInfo?.email }}!</p>
    <p v-else>正在处理授权, 请稍候...</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/modules/auth';
import { useUserStore } from '@/stores/modules/user';

const authStore = useAuthStore();
const userStore = useUserStore();
const route = useRoute();

const redirectUri = computed(() => route.query.redirect_uri as string);
const state = computed(() => route.query.state as string);
const codeChallenge = computed(() => route.query.code_challenge as string);
const codeChallengeMethod = computed(() => route.query.code_challenge_method as string);

async function handleAfterAuth() {
  if (!redirectUri.value || !codeChallenge.value) {
    ElMessage.error('缺少必需的 code_challenge 参数，请返回重试');
    return;
  }
  await authStore.handleAuthorize(redirectUri.value, codeChallenge.value, state.value, codeChallengeMethod.value);
}

onMounted(() => {
  handleAfterAuth();
});
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  text-align: center;
}
</style>
