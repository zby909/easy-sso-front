/*
 * @Description:
 * @Author: zby
 * @Date: 2022-04-26 15:51:22
 * @FilePath: \tfl-client\src\api\modules\tfl-list.api.js
 * @LastEditors: zby
 * @Reference:
 */
import { defHttp } from '@/api/index';

/**
 * @description: ping
 */
export function ping(params?, config?, options?) {
  return defHttp.request<Api.Request.Result<{ abc: string }>>(
    {
      url: '/ping',
      method: 'GET',
      params,
      ...config,
    },
    {
      afHLoading: true,
      joinTime: true,
      ...options,
    },
  );
}
