/*
 * @Description: 页面路由配置
 * @Author: zby
 * @Date: 2022-03-10 17:57:35
 * @FilePath: \sso-auth-front\src\router\constant-routes\pages.constantRoutes.ts
 * @LastEditors: zby
 * @Reference:
 */

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: 'SSO登录中心',
      requiresAuth: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true,
    },
  },
  {
    path: '/callback',
    name: 'callback',
    component: () => import('@/views/CallbackView.vue'),
    meta: {
      title: '授权回调处理',
      requiresAuth: true,
    },
  },
];

export default routes;
