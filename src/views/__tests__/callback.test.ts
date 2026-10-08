import { beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
const mock = vi.hoisted(() => ({ getClientInfo: vi.fn(), authorize: vi.fn(), route: {} as any, user: {} as any }));
vi.mock('@/api/modules/home.api', () => ({ getClientInfo: mock.getClientInfo }));
vi.mock('@/stores/modules/auth', () => ({ useAuthStore: () => ({ handleAuthorize: mock.authorize }) }));
vi.mock('@/stores/modules/user', () => ({ useUserStore: () => mock.user }));
vi.mock('vue-router', () => ({ useRoute: () => mock.route }));
import CallbackView from '../CallbackView.vue';

beforeEach(() => {
  mock.getClientInfo.mockReset();
  mock.authorize.mockReset().mockResolvedValue(false);
  mock.user = reactive({ userInfo: { id: 1 }, userEmail: 'user@example.com' });
});

it('确认快照绑定展示用户，换号后重新展示且不会自动授权', async () => {
  mock.route = reactive({
    query: { client_id: 'client-a', redirect_uri: 'https://a.example/callback', state: 'state-a', code_challenge: 'a'.repeat(43) },
  });
  mock.getClientInfo.mockResolvedValue({ code: 200, data: { client_id: 'client-a', name: 'System A' } });
  const wrapper = shallowMount(CallbackView, { global: { stubs: { ElButton: { template: '<button><slot /></button>' } } } });
  await flushPromises();
  expect(wrapper.text()).toContain('user@example.com');
  await wrapper.findAll('button')[1].trigger('click');
  await flushPromises();
  expect(mock.authorize).toHaveBeenLastCalledWith(expect.objectContaining({ expected_user_id: 1 }));
  mock.user.userInfo = { id: 2 };
  mock.user.userEmail = 'new-user@example.com';
  await flushPromises();
  expect(wrapper.text()).toContain('new-user@example.com');
  expect(mock.authorize).toHaveBeenCalledTimes(1);
  await wrapper.findAll('button')[1].trigger('click');
  expect(mock.authorize).toHaveBeenLastCalledWith(expect.objectContaining({ expected_user_id: 2 }));
  wrapper.unmount();
});

it.each([undefined, ''])('可选PKCE方法为空或缺省时使用S256 (%s)', async method => {
  mock.route = reactive({
    query: {
      client_id: 'client-a',
      redirect_uri: 'https://a.example/callback',
      state: 'state-a',
      code_challenge: 'a'.repeat(43),
      code_challenge_method: method,
    },
  });
  mock.getClientInfo.mockResolvedValue({ code: 200, data: { client_id: 'client-a', name: 'System A' } });
  const wrapper = shallowMount(CallbackView, { global: { stubs: { ElButton: { template: '<button><slot /></button>' } } } });
  await flushPromises();
  await wrapper.findAll('button')[1].trigger('click');
  expect(mock.authorize).toHaveBeenCalledWith({
    client_id: 'client-a',
    redirect_uri: 'https://a.example/callback',
    code_challenge: 'a'.repeat(43),
    state: 'state-a',
    code_challenge_method: 'S256',
    expected_user_id: 1,
  });
  wrapper.unmount();
});

it('乱序响应不能把A的名称套在B的授权参数上', async () => {
  mock.route = reactive({
    query: {
      client_id: 'client-a',
      redirect_uri: 'https://a.example/callback',
      state: 'state-a',
      code_challenge: 'a'.repeat(43),
      code_challenge_method: 'S256',
    },
  });
  const pending: { id: string; resolve: (value: any) => void }[] = [];
  mock.getClientInfo.mockImplementation(({ client_id }) => new Promise(resolve => pending.push({ id: client_id, resolve })));
  const wrapper = shallowMount(CallbackView, { global: { stubs: { ElButton: { template: '<button><slot /></button>' } } } });
  mock.route.query = {
    client_id: 'client-b',
    redirect_uri: 'https://b.example/callback',
    state: 'state-b',
    code_challenge: 'b'.repeat(43),
    code_challenge_method: 'S256',
  };
  await nextTick();
  pending.filter(item => item.id === 'client-b').forEach(item => item.resolve({ code: 200, data: { client_id: 'client-b', name: 'System B' } }));
  await flushPromises();
  pending.filter(item => item.id === 'client-a').forEach(item => item.resolve({ code: 200, data: { client_id: 'client-a', name: 'System A' } }));
  await flushPromises();
  expect(wrapper.text()).toContain('System B');
  expect(wrapper.text()).not.toContain('System A');
  await wrapper.findAll('button')[1].trigger('click');
  expect(mock.authorize).toHaveBeenCalledWith({
    client_id: 'client-b',
    redirect_uri: 'https://b.example/callback',
    code_challenge: 'b'.repeat(43),
    state: 'state-b',
    code_challenge_method: 'S256',
    expected_user_id: 1,
  });
  wrapper.unmount();
});
