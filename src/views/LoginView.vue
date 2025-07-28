'''<!-- SSO登录页面 -->
<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="card-header">
        <Icon icon="mdi:shield-lock-outline" class="header-icon" />
        <h1 class="title">SSO 登录中心</h1>
        <p class="subtitle">统一认证，安全访问</p>
      </div>

      <!-- Form -->
      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @submit.prevent="handleSubmit">
        <!-- 模式切换 -->
        <el-radio-group v-model="isRegisterMode" class="mode-switch">
          <el-radio-button :label="false">登录</el-radio-button>
          <el-radio-button :label="true">注册</el-radio-button>
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
          <div class="code-input-group">
            <el-input v-model="form.code" placeholder="6位验证码" size="large" :prefix-icon="Key" @keyup.enter="handleSubmit" />
            <el-button
              class="code-btn"
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
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleSubmit">
            {{ isRegisterMode ? '注册' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <footer class="login-footer">
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
    router.push({ path: '/profile', query: route.query });
  }
}

onMounted(() => {
  if (!redirectUri.value || !codeChallenge.value) {
    ElMessage.error('缺少必要的授权参数，请返回重试');
  }
});
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;

  .header-icon {
    font-size: 3rem;
    color: #4a90e2;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #343a40;
  }

  .subtitle {
    font-size: 1rem;
    color: #6c757d;
    margin-top: 0.5rem;
  }
}

.login-form {
  width: 100%;
}

.mode-switch {
  display: flex;
  width: 100%;
  margin-bottom: 1.5rem;

  .el-radio-button {
    width: 50%;
    :deep(.el-radio-button__inner) {
      width: 100%;
      border-radius: 0 !important;
      border: 1px solid #dee2e6;
    }

    &:first-child :deep(.el-radio-button__inner) {
      border-top-left-radius: 8px !important;
      border-bottom-left-radius: 8px !important;
    }
    &:last-child :deep(.el-radio-button__inner) {
      border-top-right-radius: 8px !important;
      border-bottom-right-radius: 8px !important;
    }
  }
}

.code-input-group {
  display: flex;
  gap: 1rem;
  width: 100%;

  .code-btn {
    white-space: nowrap;
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.login-footer {
  margin-top: 2rem;
  color: #6c757d;
  font-size: 0.875rem;
  text-align: center;
}
</style>
'''
