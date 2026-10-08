import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '@/api/modules/home.api';
import { advanceSessionGeneration } from '@/api/session-events';

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<Api.Response.UserInfo | null>(null);
    const isLoggedIn = ref(false);
    const userName = computed(() => userInfo.value?.name || userInfo.value?.email || '');
    const userEmail = computed(() => userInfo.value?.email || '');
    let pending: Promise<boolean> | null = null;
    let generation = 0;

    // 身份变化使旧的在途探测结果失效。
    function setUserInfo(user: Api.Response.UserInfo) {
      if (!isLoggedIn.value || userInfo.value?.id !== user.id) advanceSessionGeneration();
      generation++;
      userInfo.value = user;
      isLoggedIn.value = true;
    }

    // 清理本地身份并允许下一次路由重新向中心确认。
    function clearUserInfo() {
      advanceSessionGeneration();
      generation++;
      userInfo.value = null;
      isLoggedIn.value = false;
      pending = null;
    }

    // 每次导航可重新探测；并发请求合并，网络故障不缓存为登出。
    function initUserInfo(): Promise<boolean> {
      if (pending) return pending;
      const current = generation;
      const request = Promise.resolve().then(async () => {
        try {
          const response = await authApi.getUserInfo({});
          if (current !== generation) return isLoggedIn.value;
          if (response.code === 200 && response.data) setUserInfo(response.data);
          else if (response.code === 401) clearUserInfo();
          else throw new Error(response.msg || '无法确认登录状态');
          return isLoggedIn.value;
        } catch (error: any) {
          if (error.response?.status === 401) {
            if (current === generation) clearUserInfo();
            return isLoggedIn.value;
          }
          throw error;
        } finally {
          if (pending === request) pending = null;
        }
      });
      pending = request;
      return request;
    }

    // 更新展示信息不替代服务端身份校验。
    function updateUserInfo(updates: Partial<Api.Response.UserInfo>) {
      if (userInfo.value) userInfo.value = { ...userInfo.value, ...updates };
    }

    return { userInfo, isLoggedIn, userName, userEmail, setUserInfo, clearUserInfo, initUserInfo, updateUserInfo };
  },
  { persist: true },
);
