const listeners = new Set<(path: string) => void>();
let generation = 0;

// 请求发起时记录身份代次，迟到的旧401不能影响新登录。
export function getSessionGeneration() {
  return generation;
}

// 登录/退出/身份切换使旧身份发出的请求失去清理新会话的资格。
export function advanceSessionGeneration() {
  generation++;
}

// HTTP 层不依赖路由/Pinia，避免认证模块循环初始化。
export function onSessionExpired(listener: (path: string) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 只广播当前身份的 Cookie 鉴权失效，错误验证码不触发跳转。
export function notifyUnauthorized(path: string, requestGeneration = generation) {
  if (requestGeneration !== generation) return;
  // 退出请求由logout动作自己处理401和身份代次，不在通用拦截器中抢先清状态。
  if (!['/api/auth/userinfo', '/api/auth/authorize'].includes(path) && !path.startsWith('/api/admin/')) return;
  listeners.forEach(listener => listener(path));
}
