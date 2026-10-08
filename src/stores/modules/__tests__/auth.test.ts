import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
const api = vi.hoisted(() => ({
  logoutCenter: vi.fn(),
  sendVerificationCode: vi.fn(),
  register: vi.fn(),
  login: vi.fn(),
  authorize: vi.fn(),
  getUserInfo: vi.fn(),
}));
vi.mock('@/api/modules/home.api', () => api);
import { useAuthStore } from '../auth';
import { useUserStore } from '../user';

const userA = { id: 1, email: 'a@example.com', name: 'A', createdAt: '', isAdmin: false };
const userB = { ...userA, id: 2, email: 'b@example.com', name: 'B' };
const authorization = {
  client_id: 'system-1',
  redirect_uri: 'https://app.example/callback',
  state: 'state',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
  expected_user_id: 1,
};

beforeEach(() => {
  setActivePinia(createPinia());
  Object.values(api).forEach(mock => mock.mockReset());
  vi.stubGlobal('ElMessage', { error: vi.fn(), success: vi.fn(), warning: vi.fn() });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it.each([
  new Error('offline'),
  { response: { status: 403, data: { msg: '来源被拒绝' } } },
  { response: { status: 500, data: { msg: '服务暂不可用' } } },
])('退出失败保留身份并提示，可重试 (%j)', async error => {
  const user = useUserStore();
  user.setUserInfo(userA);
  const auth = useAuthStore();
  api.logoutCenter.mockRejectedValueOnce(error).mockResolvedValueOnce({ code: 200 });
  expect(await auth.logout()).toBe(false);
  expect(user.userInfo?.id).toBe(userA.id);
  expect(ElMessage.error).toHaveBeenCalledTimes(1);
  expect(await auth.logout()).toBe(true);
  expect(user.isLoggedIn).toBe(false);
});

it('会话已经失效的401可完成本地退出', async () => {
  useUserStore().setUserInfo(userA);
  api.logoutCenter.mockRejectedValue({ response: { status: 401 } });
  expect(await useAuthStore().logout()).toBe(true);
  expect(useUserStore().isLoggedIn).toBe(false);
});

it('迟到的旧退出成功不能清除后来登录的新身份', async () => {
  const user = useUserStore();
  user.setUserInfo(userA);
  let resolve!: (value: any) => void;
  api.logoutCenter.mockImplementation(
    () =>
      new Promise(done => {
        resolve = done;
      }),
  );
  const pending = useAuthStore().logout();
  user.setUserInfo(userB);
  resolve({ code: 200 });
  expect(await pending).toBe(false);
  expect(user.userInfo?.id).toBe(userB.id);
  expect(ElMessage.success).not.toHaveBeenCalled();
});

it('登录和注册等错误展示服务端可操作原因，而不是Axios状态文本', async () => {
  const error = { message: 'Request failed with status code 400', response: { status: 400, data: { msg: '此邮箱未注册' } } };
  api.sendVerificationCode.mockRejectedValue(error);
  api.register.mockRejectedValue(error);
  api.login.mockRejectedValue(error);
  api.authorize.mockRejectedValue(error);
  const auth = useAuthStore();
  await auth.sendVerificationCode(userA.email, 'login');
  await auth.register(userA.email, '314159', userA.name);
  await auth.login(userA.email, '314159');
  await auth.handleAuthorize(authorization);
  expect(vi.mocked(ElMessage.error).mock.calls.map(args => args[0])).toEqual(Array(4).fill('此邮箱未注册'));
});

it('迟到的授权身份冲突不重置后来登录的身份', async () => {
  const user = useUserStore();
  user.setUserInfo(userA);
  let reject!: (error: any) => void;
  api.authorize.mockImplementation(
    () =>
      new Promise((_resolve, fail) => {
        reject = fail;
      }),
  );
  const pending = useAuthStore().handleAuthorize(authorization);
  user.setUserInfo(userB);
  reject({ response: { status: 409, data: { msg: '登录账号已变化' } } });
  expect(await pending).toBe(false);
  expect(user.userInfo?.id).toBe(userB.id);
  expect(api.getUserInfo).not.toHaveBeenCalled();
});

it('身份冲突后重新探测账号但不能自动替用户授权', async () => {
  useUserStore().setUserInfo(userA);
  api.authorize.mockRejectedValue({ response: { status: 409, data: { msg: '登录账号已变化，请重新确认授权' } } });
  api.getUserInfo.mockResolvedValue({ code: 200, data: userB });
  expect(await useAuthStore().handleAuthorize(authorization)).toBe(false);
  expect(useUserStore().userInfo?.id).toBe(userB.id);
  expect(api.authorize).toHaveBeenCalledTimes(1);
  expect(api.authorize).toHaveBeenCalledWith(authorization);
});
