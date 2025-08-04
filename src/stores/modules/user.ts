/**
 * SSO用户状态管理 Store
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const userInfo = ref<Api.Response.UserInfo | null>(null);
    const isLoggedIn = ref(false);

    // 计算属性
    const userName = computed(() => userInfo.value?.name || userInfo.value?.email || '');
    const userEmail = computed(() => userInfo.value?.email || '');

    /**
     * 设置用户信息
     */
    function setUserInfo(user: Api.Response.UserInfo) {
      userInfo.value = user;
      isLoggedIn.value = true;
    }

    /**
     * 清除用户信息
     */
    function clearUserInfo() {
      userInfo.value = null;
      isLoggedIn.value = false;
    }

    /**
     * 应用初始化时调用，如果已登录，则获取最新用户信息
     */
    async function initUserInfo() {
      // The state is already loaded by the plugin.
      // We just need to check if we are logged in and refresh the user info.
      if (isLoggedIn.value) {
        const authStore = useAuthStore();
        // fetchUserInfo will clear user info on failure
        await authStore.fetchUserInfo();
      }
    }

    /**
     * 更新用户信息的某个字段
     */
    function updateUserInfo(updates: Partial<Api.Response.UserInfo>) {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...updates };
      }
    }

    return {
      // 状态
      userInfo,
      isLoggedIn,

      // 计算属性
      userName,
      userEmail,

      // 方法
      setUserInfo,
      clearUserInfo,
      initUserInfo,
      updateUserInfo,
    };
  },
  {
    persist: true,
  },
);
