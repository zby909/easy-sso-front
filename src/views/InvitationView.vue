<template>
  <div class="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <h1 class="mb-3 text-2xl font-semibold">受邀加入组织</h1>
    <p class="mb-5 text-sm text-gray-500">邀请只加入组织，各业务平台默认不可进入，需要管理员逐项开通。</p>
    <p v-if="loading" role="status">正在检查邀请…</p>
    <template v-else-if="info">
      <el-alert v-if="info.existingAccount" title="已有账号将保留原ID和姓名，验证邮箱后加入组织。" type="info" :closable="false" class="mb-4" />
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="join">
        <el-form-item label="受邀邮箱"><el-input :model-value="info.email" disabled /></el-form-item>
        <el-form-item v-if="!info.existingAccount" label="姓名" prop="name"><el-input v-model="form.name" maxlength="191" /></el-form-item>
        <el-form-item label="邮箱验证码" prop="code">
          <div class="flex w-full gap-3">
            <el-input v-model="form.code" maxlength="6" autocomplete="one-time-code" /><el-button
              :loading="auth.verificationLoading"
              :disabled="auth.cooldownTime > 0"
              @click="sendCode"
              >{{ auth.cooldownTime ? `${auth.cooldownTime}s` : '获取验证码' }}</el-button
            >
          </div>
        </el-form-item>
        <el-button type="primary" class="w-full" :loading="joining" @click="join">验证邮箱并加入</el-button>
      </el-form>
      <p class="mt-4 text-xs text-gray-500">有效至 {{ new Date(info.expiresAt).toLocaleString() }}，只对上述邮箱有效。</p>
    </template>
    <el-alert v-else :title="errorMessage || '邀请不可用'" type="error" :closable="false" />
    <router-link to="/login" class="mt-5 inline-block text-sm text-blue-500">返回登录</router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { useAuthStore } from '@/stores/modules/auth';
import { inspectInvitation, acceptInvitation } from '@/api/modules/home.api';
import { getErrorMessage } from '@/api/create-axios';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const token = typeof route.query.token === 'string' ? route.query.token : '';
const loading = ref(true);
const joining = ref(false);
const info = ref<Api.Response.InvitationInfo | null>(null);
const errorMessage = ref('');
const form = reactive({ name: '', code: '' });
const formRef = ref<FormInstance>();
const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  code: [{ pattern: /^\d{6}$/, required: true, message: '请输入六位验证码', trigger: 'blur' }],
};

// Token仅发送到JSON接口，邮箱由服务器锁定，不能改邀请目标。
async function load() {
  try {
    const result = await inspectInvitation(token);
    if (result.code !== 200 || !result.data) throw new Error(result.msg || '邀请不可用');
    info.value = result.data;
  } catch (error) {
    errorMessage.value = getErrorMessage(error, '邀请不可用');
  } finally {
    loading.value = false;
  }
}
// 验证码绑定本次邀请，不与普通管理员初始化的注册验证码混用。
async function sendCode() {
  if (info.value) await auth.sendVerificationCode(info.value.email, 'register', token);
}
// 成功加入不等于登录，移除邀请query后回登录页，不自动授权任何平台。
async function join() {
  if (joining.value || !info.value) return;
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  joining.value = true;
  try {
    const result = await acceptInvitation({ token, code: form.code, ...(info.value.existingAccount ? {} : { name: form.name }) });
    if (result.code !== 200) throw new Error(result.msg || '加入失败');
    ElMessage.success('已加入组织，请登录；平台需管理员开通');
    await router.replace('/login');
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '加入失败'));
  } finally {
    joining.value = false;
  }
}
onMounted(load);
</script>
