<template>
  <!-- SSO登录页面 -->
  <div class="flex w-full flex-1 flex-col items-center justify-center">
    <div class="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-10 shadow-xl dark:border-gray-700 dark:bg-gray-800">
      <!-- Header -->
      <div class="mb-8 text-center">
        <Icon icon="mdi:shield-lock-outline" class="mb-4 text-5xl text-blue-500" />
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">SSO 登录中心</h1>
        <p class="mt-2 text-base text-gray-500 dark:text-gray-400">统一认证，安全访问</p>
      </div>

      <!-- Form -->
      <el-form ref="formRef" :model="form" :rules="rules" class="w-full" @submit.prevent="handleSubmit">
        <!-- 模式切换 -->
        <el-radio-group v-model="isRegisterMode" class="mb-6 flex w-full">
          <el-radio-button :value="false" class="w-1/2">登录</el-radio-button>
          <el-radio-button :value="true" class="w-1/2">注册</el-radio-button>
        </el-radio-group>

        <!-- 邮箱 -->
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱地址" size="large" :prefix-icon="User" />
        </el-form-item>

        <!-- 姓名 (仅注册) -->
        <el-form-item v-if="isRegisterMode" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名（可选）" size="large" :prefix-icon="Postcard" />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="code">
          <div class="flex w-full gap-4">
            <el-input v-model="form.code" placeholder="6位验证码" size="large" :prefix-icon="Key" @keyup.enter="handleSubmit" />
            <el-button
              class="whitespace-nowrap"
              size="large"
              :disabled="!form.email || authStore.verificationLoading || cooldownTime > 0"
              :loading="authStore.verificationLoading"
              @click="sendCode"
            >
              {{ cooldownTime > 0 ? `${cooldownTime}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" size="large" class="h-12 w-full text-base font-semibold" :loading="loading" @click="handleSubmit">
            {{ isRegisterMode ? '注册' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <footer class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>&copy; {{ new Date().getFullYear() }} SSO-Auth. All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/modules/auth';
import { Icon } from '@iconify/vue';
import { User, Key, Postcard } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const formRef = ref<FormInstance>();
const isRegisterMode = ref(false);

const form = reactive({
  email: '',
  name: '',
  code: '',
});

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
  ],
  name: [{ min: 2, max: 20, message: '姓名长度应在2-20个字符', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须为6位', trigger: 'blur' },
  ],
};

const loading = computed(() => authStore.registerLoading || authStore.loginLoading);
const cooldownTime = computed(() => authStore.cooldownTime);

const redirectUri = computed(() => route.query.redirect_uri as string);
const codeChallenge = computed(() => route.query.code_challenge as string);

watch(isRegisterMode, () => {
  formRef.value?.clearValidate();
});

async function sendCode() {
  const valid = await formRef.value?.validateField('email');
  if (!valid) return;

  const purpose = isRegisterMode.value ? 'register' : 'login';
  await authStore.sendVerificationCode(form.email, purpose);
}

async function handleSubmit() {
  await formRef.value?.validate();

  const success = isRegisterMode.value
    ? await authStore.register(form.email, form.code, form.name || undefined)
    : await authStore.login(form.email, form.code);

  if (success) {
    // 检查是否有OAuth回调参数，决定跳转到哪个页面
    if (redirectUri.value && codeChallenge.value) {
      router.push({ path: '/callback', query: route.query });
    } else {
      router.push({ path: '/profile' });
    }
  }
}

onMounted(() => {
  if (!redirectUri.value || !codeChallenge.value) {
    ElMessage.error('缺少必要的授权参数，请返回重试');
  }
});
</script>

<style scoped>
/* Element Plus 自定义样式 */
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-left-radius: 8px !important;
  border-bottom-left-radius: 8px !important;
  width: 100%;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-right-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
  width: 100%;
}

:deep(.el-radio-button .el-radio-button__inner) {
  border-radius: 0 !important;
  border: 1px solid #dee2e6;
}
</style>
