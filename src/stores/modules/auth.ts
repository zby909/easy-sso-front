/**
 * SSO认证状态管理 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '@/api/modules/home.api';
import { useUserStore } from './user';
import { getErrorMessage } from '@/api/create-axios';
import { getSessionGeneration } from '@/api/session-events';

// 验证码冷却时间（秒）
const VERIFICATION_COOLDOWN = 60;

export const useAuthStore = defineStore('auth', () => {
  const userStore = useUserStore();

  // 状态
  const verificationLoading = ref(false);
  const registerLoading = ref(false);
  const loginLoading = ref(false);

  // 验证码冷却时间
  const cooldownTime = ref(0);
  const cooldownTimer = ref<number | null>(null);

  /**
   * 开始冷却计时
   */
  function startCooldown(seconds: number) {
    cooldownTime.value = seconds;
    if (cooldownTimer.value) {
      clearInterval(cooldownTimer.value);
    }

    cooldownTimer.value = setInterval(() => {
      cooldownTime.value--;
      if (cooldownTime.value <= 0) {
        clearInterval(cooldownTimer.value!);
        cooldownTimer.value = null;
      }
    }, 1000);
  }

  /**
   * 发送验证码
   */
  async function sendVerificationCode(email: string, purpose: 'login' | 'register', invitationToken?: string) {
    try {
      verificationLoading.value = true;

      const response = await authApi.sendVerificationCode({
        email,
        purpose,
        ...(invitationToken === undefined ? {} : { invitation_token: invitationToken }),
      });

      if (response.code >= 200 && response.code < 300) {
        ElMessage.success(response.msg || '验证码发送成功');
        // 开始冷却计时
        const cooldown = response.data?.cooldownSeconds || VERIFICATION_COOLDOWN;
        startCooldown(cooldown);
        return true;
      } else {
        ElMessage.error(response.msg || '验证码发送失败');
        return false;
      }
    } catch (error: any) {
      console.error('Send verification code error:', error);

      // 处理频率限制错误
      if (error.response?.status === 429) {
        ElMessage.error('验证码发送过于频繁，请稍后再试');
      } else {
        ElMessage.error(getErrorMessage(error, '验证码发送失败'));
      }
      return false;
    } finally {
      verificationLoading.value = false;
    }
  }

  /**
   * 用户注册
   */
  async function register(email: string, code: string, name: string) {
    try {
      registerLoading.value = true;

      const response = await authApi.register({ email, verificationCode: code, name });

      if (response.code >= 200 && response.code < 300) {
        ElMessage.success(response.msg || '注册成功');
        // 注册成功后，用户需要重新登录
        return true;
      } else {
        ElMessage.error(response.msg || '注册失败');
        return false;
      }
    } catch (error: any) {
      console.error('Register error:', error);
      ElMessage.error(getErrorMessage(error, '注册失败'));
      return false;
    } finally {
      registerLoading.value = false;
    }
  }

  /**
   * 用户登录
   */
  async function login(email: string, code: string) {
    try {
      loginLoading.value = true;

      const response = await authApi.login({ email, code });

      if (response.code === 200) {
        // 新登录不复用前一身份尚未返回的探测结果。
        userStore.clearUserInfo();
        const active = await userStore.initUserInfo();
        if (active) ElMessage.success(response.msg || '登录成功');
        else ElMessage.error('无法确认登录会话，请重新登录');
        return active;
      } else {
        ElMessage.error(response.msg || '登录失败');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      ElMessage.error(getErrorMessage(error, '登录失败'));
      return false;
    } finally {
      loginLoading.value = false;
    }
  }

  /**
   * 处理OAuth授权流程
   */
  async function handleAuthorize(request: Api.Request.Authorize) {
    const generation = getSessionGeneration();
    try {
      if (!request.client_id || !request.redirect_uri || !request.code_challenge || !request.expected_user_id) {
        throw new Error('缺少必要的授权参数');
      }
      const response = await authApi.authorize(request);
      if (generation !== getSessionGeneration()) return false;

      if (response.code === 200) {
        // 用户已在授权页明确同意，签发授权码后返回该快照中的目标系统。
        const target = new URL(request.redirect_uri);
        target.searchParams.set('code', response.data!.code);
        if (response.data!.state) {
          target.searchParams.set('state', response.data!.state);
        }

        window.location.replace(target.toString());
        return true;
      } else {
        ElMessage.error(response.msg || '授权失败');
        return false;
      }
    } catch (error: any) {
      if (generation !== getSessionGeneration()) return false;
      if (error.response?.status === 409) {
        // 重新展示当前身份，但绝不能自动重试授权，必须再次征得用户同意。
        userStore.clearUserInfo();
        try {
          await userStore.initUserInfo();
        } catch (probeError) {
          ElMessage.error(getErrorMessage(probeError, '暂时无法确认登录状态'));
          return false;
        }
      }
      ElMessage.error(getErrorMessage(error, '授权失败'));
      return false;
    }
  }

  /**
   * 注销登录中心
   */
  async function logout() {
    const generation = getSessionGeneration();
    try {
      const response = await authApi.logoutCenter();
      if (response.code !== 200) throw new Error(response.msg || '退出失败');
    } catch (error: any) {
      if (generation !== getSessionGeneration()) return false;
      if (error.response?.status !== 401) {
        ElMessage.error(getErrorMessage(error, '退出失败，请稍后重试'));
        return false;
      }
    }
    if (generation !== getSessionGeneration()) return false;
    userStore.clearUserInfo();
    ElMessage.success('退出登录成功');
    return true;
  }

  return {
    // 状态
    verificationLoading,
    registerLoading,
    loginLoading,
    cooldownTime,

    // 方法
    sendVerificationCode,
    register,
    login,
    handleAuthorize,
    logout,
  };
});
