/*
 * @Description: SSO认证API接口
 * @Author: zby
 * @Date: 2025-07-23
 * @FilePath: \sso-auth-front\src\api\modules\home.api.ts
 * @LastEditors: zby
 * @Reference: SSO后端认证中心API
 */
import { defHttp } from '@/api';

// 邀请Token仅作为JSON请求体传递，不放进后端请求URL。
export function inspectInvitation(token: string) {
  return defHttp.request<Api.Response.Base<Api.Response.InvitationInfo>>(
    { url: '/api/auth/invitations/inspect', method: 'POST', data: { token } },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}

// 接受邀请只加入组织，后续仍须登录且逐平台开通。
export function acceptInvitation(data: { token: string; code: string; name?: string }) {
  return defHttp.request<Api.Response.Base<{ id: number }>>(
    { url: '/api/auth/invitations/accept', method: 'POST', data },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}

// ==================== 认证相关接口 ====================

/**
 * 发送邮箱验证码
 */
export function sendVerificationCode(data: Api.Request.SendVerification, config?, options?) {
  return defHttp.request<Api.Response.Base<Api.Response.SendVerification>>(
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
export function register(data: Api.Request.Register, config?, options?) {
  return defHttp.request<Api.Response.Base<Api.Response.Register>>(
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
export function login(data: Api.Request.Login, config?, options?) {
  return defHttp.request<Api.Response.Base<Api.Response.Login>>(
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
  return defHttp.request<Api.Response.Base<{ message: string }>>(
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
export function authorize(params: Api.Request.Authorize, config?, options?) {
  return defHttp.request<Api.Response.Base<Api.Response.Authorize>>(
    {
      url: '/api/auth/authorize',
      method: 'POST',
      data: params,
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
 * 获取经过认证中心校验的客户端展示信息
 */
export function getClientInfo(params: Api.Request.ClientInfo, config?, options?) {
  return defHttp.request<Api.Response.Base<Api.Response.ClientInfo>>(
    {
      url: '/api/auth/client',
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
export function getUserInfo(params: Api.Request.UserInfo, config?, options?) {
  return defHttp.request<Api.Response.Base<Api.Response.UserInfo>>(
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
