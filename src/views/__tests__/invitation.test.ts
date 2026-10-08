import { beforeEach, expect, it, vi } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
const mock = vi.hoisted(() => ({ inspect: vi.fn(), accept: vi.fn(), send: vi.fn(), replace: vi.fn(), route: {} as any }));
vi.mock('@/api/modules/home.api', () => ({ inspectInvitation: mock.inspect, acceptInvitation: mock.accept }));
vi.mock('@/stores/modules/auth', () => ({ useAuthStore: () => ({ sendVerificationCode: mock.send, verificationLoading: false, cooldownTime: 0 }) }));
vi.mock('vue-router', () => ({ useRoute: () => mock.route, useRouter: () => ({ replace: mock.replace }) }));
import InvitationView from '../InvitationView.vue';
import { useUserStore } from '@/stores/modules/user';

beforeEach(() => {
  setActivePinia(createPinia());
  mock.route = { query: { token: 'a'.repeat(43) } };
  mock.inspect
    .mockReset()
    .mockResolvedValue({ code: 200, data: { email: 'invited@example.com', expiresAt: '2026-10-07', existingAccount: false, name: null } });
  mock.accept.mockReset().mockResolvedValue({ code: 200, data: { id: 2 } });
  mock.replace.mockReset();
  mock.send.mockReset();
  vi.stubGlobal('ElMessage', { success: vi.fn(), error: vi.fn() });
});
// 简化表单外观但保留输入绑定和点击，身份仍由真实View逻辑决定。
function mountView() {
  return shallowMount(InvitationView, {
    global: {
      stubs: {
        ElForm: { template: '<form><slot /></form>', methods: { validate: () => Promise.resolve() } },
        ElFormItem: { template: '<div><slot /></div>' },
        ElInput: {
          props: ['modelValue', 'disabled'],
          template: '<input :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        ElButton: { template: '<button><slot /></button>' },
        ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
        RouterLink: true,
      },
    },
  });
}

it('受邀邮箱不能修改，验证码绑定邀请，加入后回登录而非自动授权', async () => {
  const wrapper = mountView();
  await flushPromises();
  const inputs = wrapper.findAll('input');
  expect(inputs[0].attributes('disabled')).toBeDefined();
  expect((inputs[0].element as HTMLInputElement).value).toBe('invited@example.com');
  await wrapper
    .findAll('button')
    .find(button => button.text() === '获取验证码')!
    .trigger('click');
  expect(mock.send).toHaveBeenCalledWith('invited@example.com', 'register', 'a'.repeat(43));
  await inputs[1].setValue('Invited');
  await inputs[2].setValue('314159');
  await wrapper
    .findAll('button')
    .find(button => button.text() === '验证邮箱并加入')!
    .trigger('click');
  await flushPromises();
  expect(mock.accept).toHaveBeenCalledWith({ token: 'a'.repeat(43), code: '314159', name: 'Invited' });
  expect(mock.replace).toHaveBeenCalledWith('/login');
  expect(useUserStore().isLoggedIn).toBe(false);
  wrapper.unmount();
});

it('已有待加入账号不改名，接受时不发送新姓名', async () => {
  mock.inspect.mockResolvedValue({
    code: 200,
    data: { email: 'invited@example.com', expiresAt: '2026-10-07', existingAccount: true, name: 'Original' },
  });
  const wrapper = mountView();
  await flushPromises();
  const inputs = wrapper.findAll('input');
  expect(inputs).toHaveLength(2);
  await inputs[1].setValue('314159');
  await wrapper
    .findAll('button')
    .find(button => button.text() === '验证邮箱并加入')!
    .trigger('click');
  await flushPromises();
  expect(mock.accept).toHaveBeenCalledWith({ token: 'a'.repeat(43), code: '314159' });
  wrapper.unmount();
});

it('失效邀请只显示错误，不提供加入按钮', async () => {
  mock.inspect.mockRejectedValue({ response: { data: { msg: '邀请已撤销' } } });
  const wrapper = mountView();
  await flushPromises();
  expect(wrapper.text()).toContain('邀请已撤销');
  expect(wrapper.findAll('button')).toHaveLength(0);
  wrapper.unmount();
});
