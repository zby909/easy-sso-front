/*
 * @Description:
 * @Author: zby
 * @Date: 2023-08-31 11:27:48
 * @LastEditors: zby
 * @Reference:
 */
export default [
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    meta: {
      title: '路径错误',
    },
  },

  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    meta: {
      title: '没有权限',
    },
  },
];
