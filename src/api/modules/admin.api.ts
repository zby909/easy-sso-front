import { defHttp } from '@/api';

// 邀请和准入管理复用现有请求门面，最终权限由后端判断。
export function getInvitations() {
  return defHttp.request<Api.Response.Base<Api.Response.Invitation[]>>(
    { url: '/api/admin/invitations', method: 'GET' },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}
// 生成绑定邮箱的一次性邀请链接，不自动发送邮件或开通平台。
export function createInvitation(email: string) {
  return defHttp.request<Api.Response.Base<Api.Response.InvitationCreated>>(
    { url: '/api/admin/invitations', method: 'POST', data: { email } },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}
// 仅撤销未接受的邀请，成员封禁使用单独接口。
export function revokeInvitation(id: string) {
  return defHttp.request<Api.Response.Base<null>>(
    { url: `/api/admin/invitations/${encodeURIComponent(id)}`, method: 'DELETE' },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}
// 全局封禁或恢复账号，不把恢复状态当成凭据恢复。
export function setUserBlocked(id: number, blocked: boolean) {
  return defHttp.request<Api.Response.Base<{ blocked: boolean; sessions: number; tokenClients: number }>>(
    { url: `/api/admin/users/${id}/status`, method: 'PUT', data: { blocked } },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}
// 每次从服务端读取当前准入，不依赖前端缓存的允许名单。
export function getUserAccess(id: number) {
  return defHttp.request<Api.Response.Base<Api.Response.UserAccess[]>>(
    { url: `/api/admin/users/${id}/access`, method: 'GET' },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}
// 单独开通或封禁指定用户和平台，不改变全局身份。
export function setUserAccess(id: number, clientId: string, allowed: boolean) {
  return defHttp.request<Api.Response.Base<{ allowed: boolean; revokedTokens: number }>>(
    { url: `/api/admin/users/${id}/access/${encodeURIComponent(clientId)}`, method: 'PUT', data: { allowed } },
    { returnResponseData: true, isAlertErrorMsg: false },
  );
}

export function getOverview() {
  return defHttp.request<Api.Response.Base<Api.Response.AdminOverview>>(
    {
      url: '/api/admin/overview',
      method: 'GET',
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}

export function getClients() {
  return defHttp.request<Api.Response.Base<Api.Response.AdminClient[]>>(
    {
      url: '/api/admin/clients',
      method: 'GET',
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}

export function createClient(data: { id: string; name: string; redirectUris: string[]; enabled: boolean }) {
  return defHttp.request<Api.Response.Base<Api.Response.AdminClient>>(
    {
      url: '/api/admin/clients',
      method: 'POST',
      data,
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}

export function updateClient(
  clientId: string,
  data: {
    id: string;
    name: string;
    redirectUris: string[];
    enabled: boolean;
  },
) {
  return defHttp.request<Api.Response.Base<Api.Response.AdminClient>>(
    {
      url: `/api/admin/clients/${encodeURIComponent(clientId)}`,
      method: 'PUT',
      data,
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}

export function deleteClient(clientId: string) {
  return defHttp.request<Api.Response.Base<null>>(
    {
      url: `/api/admin/clients/${encodeURIComponent(clientId)}`,
      method: 'DELETE',
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}

export function getUsers(search = '') {
  return defHttp.request<Api.Response.Base<Api.Response.AdminUser[]>>(
    {
      url: '/api/admin/users',
      method: 'GET',
      params: search ? { search } : undefined,
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}

export function forceLogout(userId: number) {
  return defHttp.request<Api.Response.Base<{ sessions: number; tokenClients: number }>>(
    {
      url: `/api/admin/users/${userId}/logout`,
      method: 'POST',
    },
    {
      returnResponseData: true,
      isAlertErrorMsg: false,
    },
  );
}
