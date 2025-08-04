import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref(false);

    // 初始化主题
    const initTheme = () => {
      // 检查本地存储的主题设置
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        isDark.value = savedTheme === 'dark';
      } else {
        // 如果没有保存的主题，检查系统偏好
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      applyTheme();
    };

    // 应用主题
    const applyTheme = () => {
      const htmlElement = document.documentElement;
      if (isDark.value) {
        htmlElement.classList.add('dark');
        htmlElement.setAttribute('data-theme', 'dark');
        // 强制设置样式确保暗黑模式生效
        htmlElement.style.colorScheme = 'dark';
      } else {
        htmlElement.classList.remove('dark');
        htmlElement.setAttribute('data-theme', 'light');
        htmlElement.style.colorScheme = 'light';
      }
    };

    // 切换主题
    const toggleTheme = () => {
      isDark.value = !isDark.value;
      applyTheme();
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    };

    // 设置主题
    const setTheme = (dark: boolean) => {
      isDark.value = dark;
      applyTheme();
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
    };

    // 监听系统主题变化
    const watchSystemTheme = () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches;
          applyTheme();
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    };

    // 监听主题变化，同步Element Plus
    watch(isDark, newVal => {
      // Element Plus 暗黑模式类名
      const htmlElement = document.documentElement;
      if (newVal) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    });

    initTheme();
    watchSystemTheme();

    return {
      isDark,
      initTheme,
      toggleTheme,
      setTheme,
      watchSystemTheme,
    };
  },
  {
    persist: true,
  },
);
