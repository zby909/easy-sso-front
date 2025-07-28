/*
 * @Description:
 * @Author: zby
 * @Date: 2022-03-10 17:57:35
 * @FilePath: \tfl-client\src\router\constant-routes\pages.constantRoutes.js
 * @LastEditors: zby
 * @Reference:
 */

export default [
  {
    path: '/',
    redirect: 'login',
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
];
