/*
 * @Description:
 * @Author: zby
 * @Date: 2024-03-06 17:49:55
 * @LastEditors: zby
 * @Reference:
 */
import { CreateAxios } from './create-axios';
import type { AxiosTransform, CustomConfig } from './create-axios';
import { ElMessage, ElLoading } from 'element-plus';

const baseServiceUrl = import.meta.env.VITE_SERVICE_BASE_URL;
let loadingStatus; //loading实例
let loadingApiLength = 0; //记录需要loading提示的接口 (为了保证需要loading时间最长的那个接口完成后再close)
let showLoadingTimer;
function toLoading(msg = 'Loading...', delayLoadingTime = 300) {
  loadingApiLength++;
  clearTimeout(showLoadingTimer);
  showLoadingTimer = setTimeout(() => {
    loadingStatus = ElLoading.service({ lock: true, text: msg, background: 'rgba(0, 0, 0, 0.6)' });
  }, delayLoadingTime);
}
function completeLoading() {
  loadingApiLength--;
  if (loadingApiLength === 0) {
    clearTimeout(showLoadingTimer);
    loadingStatus?.close();
  }
}

const transformFn: AxiosTransform = {
  //请求之前的拦截器
  requestInterceptors: config => {
    const { _commonOptions } = config;
    const { withToken, authenticationScheme } = _commonOptions || {};
    const { afHLoading, loadingTxt, delayLoadingTime } = _commonOptions || {};
    if (afHLoading) toLoading(loadingTxt, delayLoadingTime);
    // const token = getToken();
    const token = 'token';
    if (withToken && token) {
      // jwt token
      config.headers.Authorization = authenticationScheme ? `${authenticationScheme} ${token}` : token;
    }
    return config;
  },
  //请求之后的拦截器
  responseInterceptors: res => {
    const { _commonOptions } = res.config as typeof res.config & CustomConfig;
    const { afHLoading, returnResponseData } = _commonOptions || {};
    if (afHLoading) completeLoading();
    let result = res;
    if (returnResponseData) {
      result = res.data;
    }
    //如果后端返回的数据为{code,data,msg}格式，可以在这里进行统一处理,如处理code，展示msg等
    return result;
  },
  //请求之后的拦截器错误处理
  responseInterceptorsCatch: error => {
    const { _commonOptions } = error.config as typeof error.config & CustomConfig;
    const { isAlertErrorMsg, afHLoading } = _commonOptions || {};
    if (afHLoading) completeLoading();
    if (isAlertErrorMsg) {
      ElMessage.error(error.message);
    }
    return Promise.reject(error);
  },
};

export const defHttp = new CreateAxios<Api.Request.Result>({
  baseURL: baseServiceUrl,
  timeout: 2 * 60 * 1000, // 2分钟超时
  _transformFn: transformFn,
  _commonOptions: {
    isAlertErrorMsg: true,
  },
});
