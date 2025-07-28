// SSO 系统配置
export const config = {
  // 前端应用信息
  app: {
    name: 'SSO登录中心',
    version: '1.0.0',
    description: 'SSO单点登录认证中心',
  },

  // 验证码配置
  verification: {
    // 验证码长度
    codeLength: 6,
    // 重发验证码冷却时间(秒)
    resendCooldown: 60,
    // 验证码有效期(分钟)
    validMinutes: 5,
  },

  // 频率限制提示
  rateLimit: {
    emailMessage: '验证码发送过于频繁，请稍后再试',
    apiMessage: '请求过于频繁，请稍后再试',
  },
};
