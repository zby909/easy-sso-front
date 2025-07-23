/*
 * @Description:
 * @Author: zby
 * @Date: 2023-05-26 15:17:13
 * @LastEditors: zby
 * @Reference:
 */
import type { App } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { Icon } from '@iconify/vue';

export function registerGlobComp(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
  app.component('IconifyIcon', Icon);
}
