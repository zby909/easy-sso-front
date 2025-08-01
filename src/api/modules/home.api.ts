/*
 * @Description: SSO认证API接口
 * @Author: zby
 * @Date: 2025-07-23
 * @FilePath: \sso-auth-front\src\api\modules\home.api.ts
 * @LastEditors: zby
 * @Reference: SSO后端认证中心API
 */
import { defHttp } from '@/api';
import type {
  ApiResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  UserInfoRequest,
  UserInfoResponse,
} from '@/types/api-modules/api';

// ==================== 认证相关接口 ====================

/**
 * 发送邮箱验证码
 */
export function sendVerificationCode(data: SendVerificationRequest, config?, options?) {
  return defHttp.request<ApiResponse<SendVerificationResponse>>(
    {
      url: '/api/auth/verification/send',
      method: 'POST',
      data,
      ...config,
    },
    {
      afHLoading: false,
      isAlertErrorMsg: false,
      returnResponseData: true,
      ...options,
    },
  );
}

/**
 * 用户注册（无密码）
 */
export function register(data: RegisterRequest, config?, options?) {
  return defHttp.request<ApiResponse<RegisterResponse>>(
    {
      url: '/api/auth/register',
      method: 'POST',
      data,
      ...config,
    },
    {
      afHLoading: true,
      isAlertErrorMsg: false,
      returnResponseData: true,
      ...options,
    },
  );
}

/**
 * 用户登录（无密码）
 */
export function login(data: LoginRequest, config?, options?) {
  return defHttp.request<ApiResponse<LoginResponse>>(
    {
      url: '/api/auth/login',
      method: 'POST',
      data,
      ...config,
    },
    {
      afHLoading: true,
      isAlertErrorMsg: false,
      returnResponseData: true,
      ...options,
    },
  );
}

/**
 * 注销登录中心会话
 */
export function logoutCenter(config?, options?) {
  return defHttp.request<ApiResponse<{ message: string }>>(
    {
      url: '/api/auth/logout/center',
      method: 'POST',
      ...config,
    },
    {
      afHLoading: false,
      isAlertErrorMsg: false,
      returnResponseData: true,
      ...options,
    },
  );
}

// ==================== OAuth 2.0 接口 ====================

/**
 * OAuth 授权 - 获取授权码
 */
export function authorize(params: AuthorizeRequest, config?, options?) {
  return defHttp.request<ApiResponse<AuthorizeResponse>>(
    {
      url: '/api/auth/authorize',
      method: 'GET',
      params,
      ...config,
    },
    {
      afHLoading: false,
      isAlertErrorMsg: false,
      returnResponseData: true,
      ...options,
    },
  );
}

/**
 * 获取用户信息
 */
export function getUserInfo(params: UserInfoRequest, config?, options?) {
  return defHttp.request<ApiResponse<UserInfoResponse>>(
    {
      url: '/api/auth/userinfo',
      method: 'GET',
      params,
      ...config,
    },
    {
      afHLoading: false,
      isAlertErrorMsg: false,
      returnResponseData: true,
      ...options,
    },
  );
}
