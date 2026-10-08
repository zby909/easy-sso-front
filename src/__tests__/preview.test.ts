// @vitest-environment node
import { expect, it } from 'vitest';
import type { ProxyOptions, UserConfig } from 'vite';
import config from '../../vite.config';

it('本地生产预览固定4173并代理生产包使用的/api，不剥离API前缀', () => {
  const preview = (config as UserConfig).preview!;
  expect(preview.host).toBe('localhost');
  expect(preview.port).toBe(4173);
  expect(preview.strictPort).toBe(true);
  const apiProxy = preview.proxy!['/api'] as ProxyOptions;
  expect(apiProxy.target).toBe('http://127.0.0.1:3000');
  expect(apiProxy.rewrite).toBeUndefined();
});

// 测试夹具与单元测试保持test环境，不注入会干扰交互的开发工具。
it('测试环境不加载Vue DevTools或Inspector插件', () => {
  expect(process.env.NODE_ENV).toBe('test');
  const plugins = (config as UserConfig).plugins || [];
  const hasDevTools = plugins
    .flat(3)
    .some(plugin => plugin && typeof plugin === 'object' && 'name' in plugin && /devtools|inspector/i.test(String(plugin.name)));
  expect(hasDevTools).toBe(false);
});
