import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const api = vi.hoisted(() => ({ getUserInfo: vi.fn() }));
vi.mock('@/api/modules/home.api', () => api);
import { useUserStore } from '../user';
import { getSessionGeneration, notifyUnauthorized, onSessionExpired } from '@/api/session-events';
const user = { id: 1, email: 'test@example.com', name: 'Test', createdAt: '', isAdmin: false };
const response = { code: 200, msg: '', data: user };

beforeEach(() => {
  setActivePinia(createPinia());
  api.getUserInfo.mockReset();
});

describe('会话探测与恢复', () => {
  it('不会永久缓存首次登录，服务器401后清除身份', async () => {
    const store = useUserStore();
    api.getUserInfo.mockResolvedValueOnce(response).mockRejectedValueOnce({ response: { status: 401 } });
    expect(await store.initUserInfo()).toBe(true);
    expect(await store.initUserInfo()).toBe(false);
    expect(store.isLoggedIn).toBe(false);
    expect(api.getUserInfo).toHaveBeenCalledTimes(2);
  });
  it('并发探测合并为一个请求', async () => {
    api.getUserInfo.mockResolvedValue(response);
    const store = useUserStore();
    await Promise.all([store.initUserInfo(), store.initUserInfo()]);
    expect(api.getUserInfo).toHaveBeenCalledTimes(1);
  });
  it('临时网络错误不永久缓存且下一次可以恢复', async () => {
    api.getUserInfo.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response);
    const store = useUserStore();
    await expect(store.initUserInfo()).rejects.toThrow('offline');
    expect(await store.initUserInfo()).toBe(true);
  });
  it('注销后迟到的成功响应不能重新登录', async () => {
    let resolve!: (value: typeof response) => void;
    api.getUserInfo.mockImplementation(
      () =>
        new Promise(done => {
          resolve = done;
        }),
    );
    const store = useUserStore();
    const pending = store.initUserInfo();
    await Promise.resolve();
    store.clearUserInfo();
    resolve(response);
    expect(await pending).toBe(false);
    expect(store.userInfo).toBeNull();
  });
  it('旧请求的迟到401不影响新登录正在完成的身份探测', async () => {
    const store = useUserStore();
    const oldGeneration = getSessionGeneration();
    const dispose = onSessionExpired(() => store.clearUserInfo());
    store.clearUserInfo(); // 新登录成功后开始独立的身份确认。
    api.getUserInfo.mockResolvedValue(response);
    const pending = store.initUserInfo();
    notifyUnauthorized('/api/auth/authorize', oldGeneration);
    expect(await pending).toBe(true);
    expect(store.isLoggedIn).toBe(true);
    dispose();
  });
  it('错误验证码不广播会话过期，受保护接口401会广播', () => {
    const listener = vi.fn();
    const dispose = onSessionExpired(listener);
    notifyUnauthorized('/api/auth/login');
    expect(listener).not.toHaveBeenCalled();
    notifyUnauthorized('/api/auth/authorize');
    notifyUnauthorized('/api/admin/users');
    expect(listener).toHaveBeenCalledTimes(2);
    dispose();
  });
});
