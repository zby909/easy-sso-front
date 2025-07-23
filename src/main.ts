import 'normalize.css';
import '@/styles/index.scss';
import '@/styles/main.css';
import '@/styles/font/iconfont.css';
import '@/styles/font/iconfont.js';

import { createApp } from 'vue';
import { usePinia } from '@/stores/index';
import { registerGlobComp } from '@/components/index';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(usePinia);
app.use(registerGlobComp);
app.use(router);

app.mount('#app');
