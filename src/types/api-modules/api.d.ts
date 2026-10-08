// SSO API 接口类型定义

declare namespace Api {
  namespace Request {
    // 验证码相关
    interface SendVerification {
      email: string;
      purpose: 'login' | 'register';
      invitation_token?: string;
    }

    // 注册相关
    interface Register {
      email: string;
      verificationCode: string;
      name: string;
    }

    // 登录相关
    interface Login {
      email: string;
      code: string;
    }

    // OAuth 2.0 + PKCE 相关
    interface Authorize {
      expected_user_id: number;
      client_id: string;
      redirect_uri: string;
      code_challenge: string;
      state?: string;
      code_challenge_method?: string;
    }

    interface ClientInfo {
      client_id: string;
      redirect_uri: string;
    }

    // 获取用户信息
    type UserInfo = Record<string, never>; // GET请求通常没有请求体, 这里使用空对象类型
  }

  namespace Response {
    // 通用响应格式
    interface Base<T = any> {
      code: number;
      msg: string;
      data: T | null;
    }

    // 用户信息
    interface UserInfo {
      email: string;
      name: string;
      id: number;
      createdAt: string;
      lastLoginAt?: string | null;
      isAdmin: boolean;
      joinedAt?: string | null;
      blocked?: boolean;
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

    interface ClientInfo {
      client_id: string;
      name: string;
    }

    interface AdminClient {
      id: string;
      name: string;
      redirectUris: string[];
      enabled: boolean;
      createdAt: string;
      updatedAt: string;
    }

    interface AdminUser {
      id: number;
      email: string;
      name: string;
      createdAt: string;
      lastLoginAt: string | null;
      isAdmin: boolean;
      joinedAt?: string | null;
      blocked?: boolean;
      activeSessions: number;
    }

    interface AdminAudit {
      id: number;
      action: string;
      targetType: string;
      targetId: string | null;
      detail: Record<string, unknown> | null;
      createdAt: string;
      actor: { id: number; email: string; name: string } | null;
    }

    interface InvitationInfo {
      email: string;
      expiresAt: string;
      existingAccount: boolean;
      name: string | null;
    }
    interface InvitationCreated {
      id: string;
      email: string;
      expiresAt: string;
      invitationUrl: string;
    }
    interface Invitation {
      id: string;
      email: string;
      expiresAt: string;
      acceptedAt: string | null;
      revokedAt: string | null;
      createdAt: string;
      status: 'pending' | 'accepted' | 'revoked' | 'expired';
    }
    interface UserAccess {
      clientId: string;
      name: string;
      enabled: boolean;
      status: 'not_granted' | 'allowed' | 'blocked';
    }

    interface AdminOverview {
      userCount: number;
      clientCount: number;
      enabledClientCount: number;
      activeUsers: number;
      activeSessions: number;
      recentAudits: AdminAudit[];
    }
  }
}
