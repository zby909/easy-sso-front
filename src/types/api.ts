// SSO API 接口类型定义

// 通用响应格式
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T | null;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  current: number;
  pageSize: number;
}

// 用户信息
export interface UserInfo {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 验证码相关
export interface SendVerificationRequest {
  email: string;
  purpose: 'login' | 'register';
}

export interface SendVerificationResponse {
  message: string;
  cooldownSeconds?: number;
}

// 注册相关
export interface RegisterRequest {
  email: string;
  verificationCode: string;
  name?: string;
}

export interface RegisterResponse {
  id: number;
}

// 登录相关
export interface LoginRequest {
  email: string;
  code: string;
}

export interface LoginResponse {
  userId: number;
}

// OAuth 2.0 + PKCE 相关
export interface AuthorizeRequest {
  redirect_uri: string;
  code_challenge: string;
  state?: string;
  code_challenge_method?: string;
}

export interface AuthorizeResponse {
  code: string;
  state: string;
}

// 获取用户信息
export type UserInfoRequest = Record<string, never>; // GET请求通常没有请求体, 这里使用空对象类型

export type UserInfoResponse = UserInfo;

export interface TokenRequest {
  code: string;
  code_verifier: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
  access_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// PKCE 参数
export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  state: string;
}

// URL 查询参数
export interface AuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// 错误响应
export interface ErrorResponse {
  code: number;
  msg: string;
  data: null;
  timestamp?: string;
  path?: string;
}
