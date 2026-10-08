import { beforeEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ElementPlus from 'element-plus';
const mock = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock('@/api/modules/admin.api', () => ({ getUserAccess: mock.get, setUserAccess: mock.set }));
import UserAccessDialog from '../admin/UserAccessDialog.vue';
const user = {
  id: 7,
  email: 'member@example.com',
  name: 'Member',
  activeSessions: 0,
  isAdmin: false,
  createdAt: '',
  lastLoginAt: null,
  joinedAt: '2026-09-30',
  blocked: false,
};
const a = { clientId: 'system-1', name: 'System A', enabled: true, status: 'not_granted' };
const b = { clientId: 'system-2', name: 'System B', enabled: true, status: 'allowed' };

beforeEach(() => {
  mock.get.mockReset().mockResolvedValue({ code: 200, data: [a, b] });
  mock.set.mockReset().mockResolvedValue({ code: 200, data: { allowed: true } });
  vi.stubGlobal('ElMessageBox', { confirm: vi.fn().mockResolvedValue('confirm') });
  vi.stubGlobal('ElMessage', { success: vi.fn(), error: vi.fn() });
});
// 对话框使用真实表格与控件，关闭Teleport便于检查默认拒绝状态。
function mountDialog() {
  return mount(UserAccessDialog, { global: { plugins: [ElementPlus], stubs: { ElDialog: { template: '<div><slot /></div>' } } } });
}

it('未开通不会自动允许，点击才请求单平台开通', async () => {
  const wrapper = mountDialog();
  await wrapper.vm.show(user);
  await flushPromises();
  expect(wrapper.text()).toContain('未开通');
  expect(mock.set).not.toHaveBeenCalled();
  await wrapper
    .findAll('button')
    .find(button => button.text() === '允许进入')!
    .trigger('click');
  await flushPromises();
  expect(mock.set).toHaveBeenCalledWith(7, 'system-1', true);
  wrapper.unmount();
});

it('平台封禁只发送该用户与该客户端，不能变成全局操作', async () => {
  const wrapper = mountDialog();
  await wrapper.vm.show(user);
  await flushPromises();
  const button = wrapper
    .findAll('tr')
    .find(row => row.text().includes('System B'))!
    .findAll('button')
    .find(button => button.text() === '强退并封禁')!;
  await button.trigger('click');
  await flushPromises();
  expect(mock.set).toHaveBeenCalledWith(7, 'system-2', false);
  wrapper.unmount();
});

it('全局封禁或未加入时不能开通平台', async () => {
  const wrapper = mountDialog();
  await wrapper.vm.show({ ...user, blocked: true });
  await flushPromises();
  const button = wrapper.findAll('button').find(button => button.text() === '允许进入')!;
  expect(button.attributes('disabled')).toBeDefined();
  wrapper.unmount();
});

it('切换用户后旧列表响应不能覆盖新用户准入', async () => {
  const pending: { resolve: (value: any) => void }[] = [];
  mock.get.mockImplementation(() => new Promise(resolve => pending.push({ resolve })));
  const wrapper = mountDialog();
  const first = wrapper.vm.show(user);
  const second = wrapper.vm.show({ ...user, id: 8, email: 'other@example.com' });
  pending[1].resolve({ code: 200, data: [b] });
  await second;
  await flushPromises();
  pending[0].resolve({ code: 200, data: [a] });
  await first;
  await flushPromises();
  expect(wrapper.text()).toContain('System B');
  expect(wrapper.text()).not.toContain('System A');
  wrapper.unmount();
});
