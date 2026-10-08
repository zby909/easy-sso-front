import '@/styles/main.css';

import { createApp } from 'vue';
import { usePinia } from '@/stores/index';

import App from './App.vue';
import router from './router';
import { useUserStore } from '@/stores/modules/user';
import { onSessionExpired } from '@/api/session-events';

const app = createApp(App);

app.use(usePinia);
let redirecting = false;
// 受保护操作返回 401 时纠正本地状态，并保留待完成的授权上下文。
const unsubscribe = onSessionExpired(path => {
  useUserStore().clearUserInfo();
  if (path === '/api/auth/userinfo' || redirecting || !router.currentRoute.value.meta.requiresAuth) return;
  redirecting = true;
  void router.replace({ path: '/login', query: router.currentRoute.value.query }).finally(() => {
    redirecting = false;
  });
});
if (import.meta.hot) import.meta.hot.dispose(unsubscribe);
app.use(router);

app.mount('#app');
