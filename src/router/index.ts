import { createRouter, createWebHashHistory } from 'vue-router';
import pageRoute from './constant-routes/pages.constantRoutes.js';
import otherRoute from './constant-routes/other.constantRoutes.js';
import { useUserStore } from '@/stores/modules/user';

const routes = [...pageRoute, ...otherRoute];
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
router.addRoute({ path: '/:catchAll(.*)', redirect: '/404' });

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 加载用户信息
  await userStore.initUserInfo();

  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  const isLoggedIn = userStore.isLoggedIn;

  if (isLoggedIn) {
    // 如果已登录，访问登录页则重定向到个人中心
    if (to.path === '/login') {
      next({ path: '/profile', query: to.query });
    } else {
      next();
    }
  } else {
    // 如果未登录，访问需要权限的页面则重定向到登录页
    if (to.meta.requiresAuth) {
      next({
        path: '/login',
        query: to.query,
      });
    } else {
      next();
    }
  }
});
export default router;
