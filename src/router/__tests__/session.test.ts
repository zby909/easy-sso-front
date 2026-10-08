import { beforeEach, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const api = vi.hoisted(() => ({ getUserInfo: vi.fn() }));
vi.mock('@/api/modules/home.api', () => api);
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return { ...actual, createWebHashHistory: actual.createMemoryHistory };
});
import router from '../index';
import { useUserStore } from '@/stores/modules/user';
const user = { id: 1, email: 'test@example.com', name: 'Test', createdAt: '', isAdmin: false };

beforeEach(() => {
  setActivePinia(createPinia());
  api.getUserInfo.mockReset();
  vi.stubGlobal('ElMessage', { error: vi.fn() });
  vi.stubGlobal('scrollTo', vi.fn());
});

it('服务器会话失效后可以回登录页，并保留完整授权参数', async () => {
  api.getUserInfo.mockResolvedValue({ code: 200, data: user });
  await router.push('/profile');
  expect(useUserStore().isLoggedIn).toBe(true);
  api.getUserInfo.mockRejectedValue({ response: { status: 401 } });
  const query = {
    client_id: 'system-1',
    redirect_uri: 'https://app.example/callback',
    state: 'random-state',
    code_challenge: 'x'.repeat(43),
    code_challenge_method: 'S256',
  };
  await router.push({ path: '/login', query });
  expect(router.currentRoute.value.path).toBe('/login');
  expect(router.currentRoute.value.query).toEqual(query);
  expect(useUserStore().isLoggedIn).toBe(false);
});

it('已有中心身份时去授权确认页，普通用户不能进入管理页', async () => {
  api.getUserInfo.mockResolvedValue({ code: 200, data: user });
  await router.push({
    path: '/login',
    query: { client_id: 'system-1', redirect_uri: 'https://app.example/callback', code_challenge: 'x'.repeat(43) },
  });
  expect(router.currentRoute.value.path).toBe('/callback');
  await router.push('/admin');
  expect(router.currentRoute.value.path).toBe('/401');
});
