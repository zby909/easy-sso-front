import { beforeEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ElementPlus from 'element-plus';
const mocks = vi.hoisted(() => ({ blocked: vi.fn(), users: vi.fn() }));
vi.mock('@/stores/modules/user', () => ({ useUserStore: () => ({ userInfo: { id: 1 } }) }));
vi.mock('@/api/modules/admin.api', () => ({
  getOverview: vi.fn().mockResolvedValue({ code: 200, data: { recentAudits: [], userCount: 2 } }),
  getClients: vi.fn().mockResolvedValue({ code: 200, data: [] }),
  getUsers: mocks.users,
  setUserBlocked: mocks.blocked,
}));
import AdminView from '../AdminView.vue';

beforeEach(() => {
  mocks.users.mockResolvedValue({
    code: 200,
    data: [
      { id: 1, email: 'admin@example.com', name: 'Admin', activeSessions: 1, isAdmin: true, joinedAt: '2026-09-30', blocked: false },
      { id: 7, email: 'offline@example.com', name: 'Offline', activeSessions: 0, isAdmin: false, joinedAt: '2026-09-30', blocked: false },
    ],
  });
  mocks.blocked.mockResolvedValue({ code: 200, data: { blocked: true, sessions: 0, tokenClients: 1 } });
  vi.stubGlobal('ElMessageBox', { confirm: vi.fn().mockResolvedValue('confirm') });
  vi.stubGlobal('ElMessage', { success: vi.fn(), error: vi.fn() });
});

it('中心会话为零仍允许全局强退封禁，但不能封禁自己', async () => {
  const wrapper = mount(AdminView, { global: { plugins: [ElementPlus], stubs: { Icon: true, InvitationsPanel: true, UserAccessDialog: true } } });
  await flushPromises();
  const buttons = wrapper.findAll('button').filter(item => item.text() === '全局强退并封禁');
  expect(buttons).toHaveLength(2);
  expect(buttons[0].attributes('disabled')).toBeDefined();
  expect(buttons[1].attributes('disabled')).toBeUndefined();
  await buttons[1].trigger('click');
  await flushPromises();
  expect(mocks.blocked).toHaveBeenCalledWith(7, true);
  wrapper.unmount();
});

it('解除全局封禁单独请求，不默认开通平台', async () => {
  mocks.users.mockResolvedValue({
    code: 200,
    data: [{ id: 7, email: 'offline@example.com', name: 'Offline', activeSessions: 0, joinedAt: '2026-09-30', blocked: true }],
  });
  const wrapper = mount(AdminView, { global: { plugins: [ElementPlus], stubs: { Icon: true, InvitationsPanel: true, UserAccessDialog: true } } });
  await flushPromises();
  const button = wrapper.findAll('button').find(item => item.text() === '解除全局封禁');
  await button.trigger('click');
  await flushPromises();
  expect(mocks.blocked).toHaveBeenCalledWith(7, false);
  wrapper.unmount();
});
