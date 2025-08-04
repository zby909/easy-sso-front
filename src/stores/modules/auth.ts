/**
 * SSO认证状态管理 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '@/api/modules/home.api';
import { useUserStore } from './user';

// 验证码冷却时间（秒）
const VERIFICATION_COOLDOWN = 60;

export const useAuthStore = defineStore('auth', () => {
  const userStore = useUserStore();

  // 状态
  const verificationLoading = ref(false);
  const registerLoading = ref(false);
  const loginLoading = ref(false);
  const authorizeLoading = ref(false);

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
  async function sendVerificationCode(email: string, purpose: 'login' | 'register') {
    try {
      verificationLoading.value = true;

      const response = await authApi.sendVerificationCode({ email, purpose });

      if (response.code === 200) {
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
        ElMessage.error(error.message || '验证码发送失败');
      }
      return false;
    } finally {
      verificationLoading.value = false;
    }
  }

  /**
   * 用户注册
   */
  async function register(email: string, code: string, name?: string) {
    try {
      registerLoading.value = true;

      const response = await authApi.register({ email, verificationCode: code, name });

      if (response.code === 200) {
        ElMessage.success(response.msg || '注册成功');
        // 注册成功后，用户需要重新登录
        return true;
      } else {
        ElMessage.error(response.msg || '注册失败');
        return false;
      }
    } catch (error: any) {
      console.error('Register error:', error);
      ElMessage.error(error.message || '注册失败');
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
        ElMessage.success(response.msg || '登录成功');
        // 登录成功后，获取并设置用户信息
        await fetchUserInfo();
        return true;
      } else {
        ElMessage.error(response.msg || '登录失败');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      ElMessage.error(error.message || '登录失败');
      return false;
    } finally {
      loginLoading.value = false;
    }
  }

  /**
   * 处理OAuth授权流程
   */
  async function handleAuthorize(redirectUri: string, codeChallenge: string, clientState?: string, codeChallengeMethod?: string) {
    try {
      authorizeLoading.value = true;

      // 如果没有提供PKCE参数，说明是第一次访问，需要重定向到授权页面
      if (!redirectUri || !codeChallenge) {
        throw new Error('缺少必要的授权参数');
      }

      const response = await authApi.authorize({
        redirect_uri: redirectUri,
        state: clientState || '',
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
      });

      if (response.code === 200) {
        // 授权成功，重定向到客户端
        const params = new URLSearchParams({
          code: response.data!.code,
          state: response.data!.state,
        });

        try {
          await ElMessageBox.confirm(`即将重定向到客户端：${redirectUri}`, '授权成功', {
            confirmButtonText: '立即跳转',
            cancelButtonText: '取消',
            type: 'success',
          });

          window.location.href = `${redirectUri}?${params.toString()}`;
          return true;
        } catch {
          // 用户取消了重定向
          ElMessage.info('重定向已取消');
          return false;
        }
      } else {
        ElMessage.error(response.msg || '授权失败');
        return false;
      }
    } catch (error: any) {
      console.error('Authorize error:', error);
      ElMessage.error(error.message || '授权失败');
      return false;
    } finally {
      authorizeLoading.value = false;
    }
  }

  /**
   * 注销登录中心
   */
  async function logout() {
    try {
      await authApi.logoutCenter();
      userStore.clearUserInfo();
      ElMessage.success('退出登录成功');
      return true;
    } catch (error: any) {
      console.error('Logout error:', error);
      // 即使接口失败也清除本地状态
      userStore.clearUserInfo();
      return false;
    }
  }

  /**
   * 获取当前用户信息
   */
  async function fetchUserInfo() {
    try {
      const response = await authApi.getUserInfo({});

      if (response.code === 200) {
        userStore.setUserInfo(response.data!);
        return true;
      } else {
        // 如果获取用户信息失败，可能是token失效，清除本地信息
        userStore.clearUserInfo();
        return false;
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      userStore.clearUserInfo();
      return false;
    }
  }

  return {
    // 状态
    verificationLoading,
    registerLoading,
    loginLoading,
    authorizeLoading,
    cooldownTime,

    // 方法
    sendVerificationCode,
    register,
    login,
    handleAuthorize,
    logout,
    fetchUserInfo,
  };
});
