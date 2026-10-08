import { expect, it, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
const mock = vi.hoisted(() => ({ logout: vi.fn(), push: vi.fn() }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mock.push }) }));
vi.mock('@/stores/modules/auth', () => ({ useAuthStore: () => ({ logout: mock.logout }) }));
vi.mock('@/stores/modules/user', () => ({ useUserStore: () => ({ isLoggedIn: true, userName: 'Test', userInfo: { isAdmin: false } }) }));
vi.mock('@/stores/modules/theme', () => ({ useThemeStore: () => ({ isDark: false, toggleTheme: vi.fn() }) }));
import Navbar from '../Navbar.vue';

it.each([false, true])('退出导航尊重接口结果 (%s)', async success => {
  mock.logout.mockResolvedValue(success);
  const wrapper = shallowMount(Navbar, {
    global: {
      stubs: {
        ElTooltip: { template: '<div><slot /></div>' },
        ElButton: true,
        ElAvatar: true,
        ElDropdown: { template: '<div><slot /><slot name="dropdown" /></div>' },
        ElDropdownMenu: { template: '<div><slot /></div>' },
        ElDropdownItem: { template: '<button><slot /></button>' },
      },
    },
  });
  const button = wrapper.findAll('button').find(item => item.text() === '退出登录')!;
  await button.trigger('click');
  await flushPromises();
  if (success) expect(mock.push).toHaveBeenCalledWith('/login');
  else expect(mock.push).not.toHaveBeenCalled();
  wrapper.unmount();
});
