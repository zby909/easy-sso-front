import { beforeEach, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
const mocks = vi.hoisted(() => ({ register: vi.fn(), push: vi.fn(), query: {} }));
vi.mock('@/api/modules/home.api', () => ({ register: mocks.register }));
vi.mock('vue-router', () => ({ useRoute: () => ({ query: mocks.query }), useRouter: () => ({ push: mocks.push }) }));
import LoginView from '../LoginView.vue';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.stubGlobal('ElMessage', { error: vi.fn(), success: vi.fn() });
});

it('独立登录不误报OAuth参数，注册成功回登录而不假装已认证', async () => {
  mocks.register.mockResolvedValue({ code: 200, data: { id: 1 } });
  const wrapper = shallowMount(LoginView, {
    global: {
      stubs: {
        ElForm: { template: '<div><slot /></div>', methods: { validate: () => Promise.resolve(), clearValidate: () => {} } },
        ElFormItem: { template: '<div><slot /></div>' },
        ElAlert: true,
        ElRadioGroup: true,
        ElRadioButton: true,
        ElInput: true,
        ElButton: true,
      },
    },
  });
  expect(ElMessage.error).not.toHaveBeenCalled();
  const vm = wrapper.vm as any;
  vm.isRegisterMode = true;
  Object.assign(vm.form, { email: 'user@example.com', code: '314159', name: 'User' });
  await vm.handleSubmit();
  expect(mocks.register).toHaveBeenCalledTimes(1);
  expect(vm.isRegisterMode).toBe(false);
  expect(vm.form.code).toBe('');
  expect(mocks.push).not.toHaveBeenCalled();
  wrapper.unmount();
});
