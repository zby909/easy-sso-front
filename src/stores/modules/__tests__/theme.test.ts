import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import persistedState from 'pinia-plugin-persistedstate';
import { useThemeStore } from '../theme';

let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };

// 安装真实持久化插件，确保主题不会再次和Pinia JSON争用同一个键。
function createStore() {
  const pinia = createPinia().use(persistedState);
  createApp({}).use(pinia);
  setActivePinia(pinia);
  return useThemeStore();
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
});
afterEach(() => vi.unstubAllGlobals());

it('主题只写一种格式，切换和重新加载后的所有DOM标志一致', async () => {
  const first = createStore();
  first.toggleTheme();
  await nextTick();
  expect(localStorage.getItem('theme')).toBe('dark');
  first.$dispose();
  const restored = createStore();
  await nextTick();
  expect(restored.isDark).toBe(true);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.documentElement.style.colorScheme).toBe('dark');
  restored.$dispose();
});

it('没有手动设置时跟随系统，手动选择后不被系统事件覆盖', async () => {
  media.matches = true;
  const store = createStore();
  expect(store.isDark).toBe(true);
  expect(localStorage.getItem('theme')).toBeNull();
  const listener = media.addEventListener.mock.calls[0][1];
  listener({ matches: false });
  await nextTick();
  expect(store.isDark).toBe(false);
  expect(document.documentElement.style.colorScheme).toBe('light');
  store.toggleTheme();
  listener({ matches: false });
  await nextTick();
  expect(store.isDark).toBe(true);
  store.$dispose();
});

it('释放Store时移除系统主题监听', () => {
  const store = createStore();
  store.$dispose();
  expect(media.removeEventListener).toHaveBeenCalledWith('change', media.addEventListener.mock.calls[0][1]);
});
