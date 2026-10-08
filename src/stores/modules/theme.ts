import { defineStore } from 'pinia';
import { ref, watch, onScopeDispose } from 'vue';

// 只读取本主题自己写入的字符串格式，浏览器禁用存储时仍可使用当前页。
function readTheme(): 'dark' | 'light' | null {
  try {
    const value = localStorage.getItem('theme');
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export const useThemeStore = defineStore('theme', () => {
  const preference = readTheme();
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let followsSystem = preference === null;
  const isDark = ref(preference ? preference === 'dark' : media.matches);

  // 初始化、切换和系统变化只走一个DOM同步入口。
  function applyTheme() {
    const theme = isDark.value ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.toggle('dark', isDark.value);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  }

  // 仅手动选择时持久化；不再叠加Pinia对同一键的JSON保存。
  function toggleTheme() {
    followsSystem = false;
    isDark.value = !isDark.value;
    try {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    } catch {
      /* 存储被禁用不影响当前页面切换。 */
    }
  }

  // 尚未手动选择时跟随系统，Store释放时移除监听。
  function followSystem(event: MediaQueryListEvent) {
    if (followsSystem) isDark.value = event.matches;
  }
  watch(isDark, applyTheme, { immediate: true, flush: 'sync' });
  media.addEventListener('change', followSystem);
  onScopeDispose(() => media.removeEventListener('change', followSystem));
  return { isDark, toggleTheme };
});
