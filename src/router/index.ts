import { createRouter, createWebHashHistory } from 'vue-router';
import pageRoute from './constant-routes/pages.constantRoutes';
import otherRoute from './constant-routes/other.constantRoutes';
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

  // 临时网络错误不把用户永久锁在错误的本地登录态中。
  try {
    await userStore.initUserInfo();
  } catch {
    ElMessage.error('暂时无法确认登录状态，请检查网络后重试');
    next(false);
    return;
  }

  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  const isLoggedIn = userStore.isLoggedIn;

  if (isLoggedIn) {
    if (to.meta.requiresAdmin && !userStore.userInfo?.isAdmin) {
      next('/401');
      return;
    }

    // 如果已登录，访问登录页则重定向到个人中心
    if (to.path === '/login') {
      // 检查是否有OAuth回调参数，如果有则转到callback路由
      if (to.query.client_id && to.query.redirect_uri && to.query.code_challenge) {
        next({ path: '/callback', query: to.query });
      } else {
        next({ path: '/profile' });
      }
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
