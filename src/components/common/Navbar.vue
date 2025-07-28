'''<!-- 导航栏组件 -->
<template>
  <header class="sso-navbar">
    <div class="navbar-content">
      <div class="navbar-brand" @click="goHome">
        <Icon icon="mdi:shield-lock-outline" class="brand-icon" />
        <span class="brand-text">SSO-Auth</span>
      </div>

      <div class="navbar-menu">
        <!-- 用户信息下拉菜单 -->
        <el-dropdown v-if="userStore.isLoggedIn" class="user-dropdown" trigger="click">
          <div class="user-trigger">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar" class="user-avatar">
              {{ userStore.userName?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="user-name">{{ userStore.userName }}</span>
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
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';
import { Icon } from '@iconify/vue';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();

const goHome = () => router.push('/');
const goToProfile = () => router.push('/profile');

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped lang="scss">
.sso-navbar {
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 0 1rem; // Default padding for mobile
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1000;

  @media (min-width: 768px) {
    padding: 0 2rem; // Padding for larger screens
  }
}

.navbar-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  .brand-icon {
    font-size: 1.75rem;
    color: #4a90e2;
  }

  .brand-text {
    display: none; // Hide text on mobile
    font-size: 1.25rem;
    font-weight: 600;
    color: #343a40;

    @media (min-width: 768px) {
      display: inline; // Show text on larger screens
    }
  }
}

.user-dropdown {
  .user-trigger {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .user-avatar {
    background-color: #4a90e2;
    color: white;
    font-weight: 600;
  }

  .user-name {
    display: none; // Hide username on mobile
    font-weight: 500;
    color: #495057;

    @media (min-width: 768px) {
      display: inline; // Show username on larger screens
    }
  }
}

:global(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}
</style>
'''
