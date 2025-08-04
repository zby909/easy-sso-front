<!-- 导航栏组件 -->
<template>
  <header
    class="sticky top-0 z-[1000] flex h-16 w-full items-center justify-center bg-white px-4 shadow-md transition-colors md:px-8 dark:bg-gray-800"
  >
    <div class="flex w-full max-w-6xl items-center justify-between">
      <!-- Logo区域 -->
      <div class="flex cursor-pointer items-center gap-2 sm:gap-3" @click="goHome">
        <Icon icon="mdi:shield-lock-outline" class="text-2xl text-blue-500 sm:text-3xl" />
        <span class="text-lg font-semibold text-gray-800 sm:text-xl dark:text-gray-100">
          <span class="hidden sm:inline">SSO-Auth</span>
          <span class="sm:hidden">SSO</span>
        </span>
      </div>

      <!-- 导航菜单区域 -->
      <div class="navbar-menu flex items-center gap-3">
        <!-- 主题切换按钮 -->
        <el-tooltip :content="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
          <el-button
            type="text"
            class="!p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            @click="themeStore.toggleTheme"
          >
            <Icon :icon="themeStore.isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" class="text-lg" />
          </el-button>
        </el-tooltip>

        <!-- 用户信息下拉菜单 -->
        <el-dropdown v-if="userStore.isLoggedIn" class="user-dropdown" trigger="click">
          <div
            class="flex min-w-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-gray-50 sm:justify-start sm:gap-3 sm:px-3 dark:hover:bg-gray-700"
          >
            <!-- 用户头像 -->
            <el-avatar :size="28" class="shrink-0 sm:!h-8 sm:!w-8">
              {{ userStore.userName?.charAt(0).toUpperCase() }}
            </el-avatar>
            <!-- 用户名（在中等屏幕及以上显示） -->
            <span class="hidden font-medium text-gray-600 md:inline dark:text-gray-300">{{ userStore.userName }}</span>
            <!-- 下拉箭头 -->
            <Icon icon="mdi:chevron-down" class="text-sm text-gray-400 dark:text-gray-500" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToProfile">
                <Icon icon="mdi:account-circle-outline" />
                <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <Icon icon="mdi:logout" />
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 登录按钮（未登录时显示） -->
        <div v-else class="flex items-center gap-2">
          <el-button type="primary" size="default" @click="goToLogin" class="!px-3 !py-1.5 !text-sm sm:!px-4 sm:!py-2 sm:!text-base">
            登录
          </el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';
import { useThemeStore } from '@/stores/modules/theme';
import { Icon } from '@iconify/vue';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const goHome = () => router.push('/');
const goToProfile = () => router.push('/profile');
const goToLogin = () => router.push('/login');

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* 下拉菜单项样式 */
:global(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  padding: 8px 16px;
}

/* 用户下拉菜单触发区域 */
.user-dropdown :global(.el-dropdown-link) {
  outline: none;
}
</style>
