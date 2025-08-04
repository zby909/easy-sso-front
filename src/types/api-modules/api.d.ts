// SSO API 接口类型定义

declare namespace Api {
  namespace Request {
    // 验证码相关
    interface SendVerification {
      email: string;
      purpose: 'login' | 'register';
    }

    // 注册相关
    interface Register {
      email: string;
      verificationCode: string;
      name?: string;
    }

    // 登录相关
    interface Login {
      email: string;
      code: string;
    }

    // OAuth 2.0 + PKCE 相关
    interface Authorize {
      redirect_uri: string;
      code_challenge: string;
      state?: string;
      code_challenge_method?: string;
    }

    // 获取用户信息
    type UserInfo = Record<string, never>; // GET请求通常没有请求体, 这里使用空对象类型

    interface Token {
      code: string;
      code_verifier: string;
    }

    interface RefreshToken {
      refresh_token: string;
      access_token: string;
    }
  }

  namespace Response {
    // 通用响应格式
    interface Base<T = any> {
      code: number;
      msg: string;
      data: T | null;
    }

    // 分页响应
    interface Paginated<T> {
      list: T[];
      total: number;
      current: number;
      pageSize: number;
    }

    // 用户信息
    interface UserInfo {
      email: string;
      name: string;
      id: number;
      createdAt: Date;
    }

    // 验证码相关
    interface SendVerification {
      message: string;
      cooldownSeconds?: number;
    }

    // 注册相关
    interface Register {
      id: number;
    }

    // 登录相关
    interface Login {
      userId: number;
    }

    // OAuth 2.0 + PKCE 相关
    interface Authorize {
      code: string;
      state: string;
    }

    interface Token {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }

    interface RefreshToken {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }

    // 错误响应
    interface Error {
      code: number;
      msg: string;
      data: null;
      timestamp?: string;
      path?: string;
    }
  }

  namespace Common {
    // PKCE 参数
    interface PKCEParams {
      codeVerifier: string;
      codeChallenge: string;
      codeChallengeMethod: string;
      state: string;
    }

    // URL 查询参数
    interface AuthCallbackParams {
      code?: string;
      state?: string;
      error?: string;
      error_description?: string;
    }
  }
}
