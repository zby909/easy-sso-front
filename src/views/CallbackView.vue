<!-- src/views/CallbackView.vue -->
<template>
  <div class="mx-auto flex max-w-lg flex-1 items-center p-8">
    <div class="w-full rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
      <template v-if="loadingClient">
        <p class="text-gray-600 dark:text-gray-300">正在校验授权请求...</p>
      </template>

      <template v-else-if="clientInfo && validatedRequest">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">授权访问</h1>
        <p class="mt-5 text-gray-600 dark:text-gray-300">
          <span class="font-semibold text-gray-900 dark:text-gray-100">{{ clientInfo.name }}</span>
          希望使用你的统一登录身份
        </p>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">当前账号：{{ validatedRequest.userEmail }}</p>
        <p class="mt-5 rounded-lg bg-gray-50 p-4 text-left text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          同意后，登录平台只会向该系统证明你的身份。该系统中的角色、权限和业务数据仍由它自己管理。
        </p>

        <div class="mt-7 flex gap-4">
          <el-button class="w-1/2" size="large" :disabled="processing" @click="denyAuthorization">取消</el-button>
          <el-button class="w-1/2" type="primary" size="large" :loading="processing" @click="approveAuthorization"> 同意并继续 </el-button>
        </div>
      </template>

      <template v-else>
        <h1 class="text-xl font-semibold text-red-600">无法处理授权请求</h1>
        <p class="mt-3 text-gray-600 dark:text-gray-300">{{ errorMessage }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/modules/auth';
import { useUserStore } from '@/stores/modules/user';
import * as authApi from '@/api/modules/home.api';

const authStore = useAuthStore();
const userStore = useUserStore();
const route = useRoute();
const processing = ref(false);
const loadingClient = ref(true);
const clientInfo = ref<Api.Response.ClientInfo | null>(null);
const errorMessage = ref('');

const validatedRequest = ref<{
  clientId: string;
  redirectUri: string;
  state?: string;
  challenge: string;
  method?: string;
  userId: number;
  userEmail: string;
} | null>(null);
let requestGeneration = 0;

// 只接受单值查询参数，避免把数组误用为身份或回调地址。
function queryString(key: string) {
  const value = route.query[key];
  return typeof value === 'string' ? value : '';
}
const clientId = computed(() => queryString('client_id'));
const redirectUri = computed(() => queryString('redirect_uri'));
const state = computed(() => queryString('state'));
const codeChallenge = computed(() => queryString('code_challenge'));
const codeChallengeMethod = computed(() => queryString('code_challenge_method') || 'S256');

// 忽略已切换授权请求的迟到响应，展示名称与提交参数绑定同一份快照。
async function loadClientInfo() {
  const generation = ++requestGeneration;
  const request = {
    clientId: clientId.value,
    redirectUri: redirectUri.value,
    state: state.value,
    challenge: codeChallenge.value,
    method: codeChallengeMethod.value,
    userId: userStore.userInfo?.id || 0,
    userEmail: userStore.userEmail,
  };
  loadingClient.value = true;
  clientInfo.value = null;
  validatedRequest.value = null;
  errorMessage.value = '';

  if (!request.userId) {
    errorMessage.value = '当前登录身份无效，请重新登录';
    loadingClient.value = false;
    return;
  }
  if (!request.clientId || !request.redirectUri || !request.challenge) {
    errorMessage.value = '缺少 client_id、redirect_uri 或 PKCE 参数';
    loadingClient.value = false;
    return;
  }

  try {
    const response = await authApi.getClientInfo({ client_id: request.clientId, redirect_uri: request.redirectUri });
    if (generation !== requestGeneration) return;
    if (response.code === 200 && response.data?.client_id === request.clientId) {
      clientInfo.value = response.data;
      validatedRequest.value = request;
    } else {
      errorMessage.value = response.msg || '客户端信息校验失败';
    }
  } catch (error: any) {
    if (generation === requestGeneration) errorMessage.value = error.response?.data?.msg || error.message || '客户端信息校验失败';
  } finally {
    if (generation === requestGeneration) loadingClient.value = false;
  }
}

// 用户同意的只能是当前已完成校验并展示的授权请求。
async function approveAuthorization() {
  const request = validatedRequest.value;
  if (!request || processing.value) return;
  processing.value = true;
  try {
    await authStore.handleAuthorize({
      client_id: request.clientId,
      redirect_uri: request.redirectUri,
      code_challenge: request.challenge,
      state: request.state,
      code_challenge_method: request.method,
      expected_user_id: request.userId,
    });
  } catch (error) {
    console.error('授权处理失败:', error);
    ElMessage.error('授权处理失败，请重试');
  } finally {
    processing.value = false;
  }
}

// 取消也只能使用已经校验的回调地址和同一份 state。
function denyAuthorization() {
  const request = validatedRequest.value;
  if (!request || processing.value) return;
  const target = new URL(request.redirectUri);
  target.searchParams.set('error', 'access_denied');
  target.searchParams.set('error_description', '用户取消授权');
  if (request.state) target.searchParams.set('state', request.state);
  window.location.replace(target.toString());
}

watch([clientId, redirectUri, codeChallenge, state, codeChallengeMethod, () => userStore.userInfo?.id, () => userStore.userEmail], loadClientInfo, {
  immediate: true,
  flush: 'sync',
});
</script>
