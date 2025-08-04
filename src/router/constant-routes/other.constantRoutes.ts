/*
 * @Description: 错误页面路由配置
 * @Author: zby
 * @Date: 2023-08-31 11:27:48
 * @LastEditors: zby
 * @Reference:
 */

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error-page/404.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false,
    },
  },

  {
    path: '/401',
    name: 'Unauthorized',
    component: () => import('@/views/error-page/401.vue'),
    meta: {
      title: '没有权限',
      requiresAuth: false,
    },
  },
];

export default routes;
