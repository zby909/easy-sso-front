/*
 * @Author: zby
 * @Date: 2023-07-12 17:47:50
 * @LastEditTime: 2024-07-18 13:34:54
 * @LastEditors: zby
 * @Description: 接口请求拦截配置
 */

import axios from 'axios';

import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const isFunction = val => typeof val === 'function';

// 优先展示后端可操作的业务提示，未知响应回退为通用错误。
export function getErrorMessage(error: any, fallback: string): string {
  const message = error?.response?.data?.msg;
  if (typeof message === 'string' && message) return message;
  return typeof error?.message === 'string' && error.message ? error.message : fallback;
}

export type CustomConfig = {
  _sessionGeneration?: number;
  _commonOptions?: AxiosCustomOpt;
  _transformFn?: AxiosTransform;
};

export type CreateAxiosOptions = AxiosRequestConfig & CustomConfig;

export type AxiosCustomOpt = {
  afHLoading?: boolean; //是否显示loading
  loadingTxt?: string; //loading提示文字
  delayLoadingTime?: number; //延迟多少毫秒显示loading
  isAlertErrorMsg?: boolean; //是否弹出错误提示
  returnResponseData?: boolean; //是否转换响应数据
};

export abstract class AxiosTransform {
  /**
   * @description: 请求之前的拦截器
   */
  requestInterceptors?: (config: InternalAxiosRequestConfig & CustomConfig) => InternalAxiosRequestConfig;

  /**
   * @description: 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error) => Promise<never>;

  /**
   * @description: 请求之后的拦截器
   */
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;

  /**
   * @description: 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (error) => Promise<never>;
}

export class CreateAxios<R = any> {
  private axiosInstance: AxiosInstance;
  private readonly createAxiosOptions: CreateAxiosOptions;

  constructor(opt: CreateAxiosOptions) {
    this.axiosInstance = axios.create(opt);
    this.createAxiosOptions = opt;
    this.setupInterceptors();
  }

  /**
   * @description: Interceptor configuration 拦截器配置
   */
  private setupInterceptors() {
    const {
      createAxiosOptions: { _transformFn },
    } = this;
    if (!_transformFn) return;
    const { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch } = _transformFn;

    // Request interceptor
    this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig & CustomConfig) => {
      if (requestInterceptors && isFunction(requestInterceptors)) {
        config = requestInterceptors(config);
      }
      return config;
    }, undefined);
    // Request interceptor error capture
    this.axiosInstance.interceptors.request.use(undefined, error => {
      if (requestInterceptorsCatch && isFunction(requestInterceptorsCatch)) {
        return requestInterceptorsCatch(error);
      }
      return Promise.reject(error);
    });

    // Response result interceptor
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res);
      }
      return res;
    }, undefined);
    // Response result interceptor error capture
    this.axiosInstance.interceptors.response.use(undefined, error => {
      if (responseInterceptorsCatch && isFunction(responseInterceptorsCatch)) {
        return responseInterceptorsCatch(error);
      }
      return Promise.reject(error);
    });
  }

  request<T = R>(config: AxiosRequestConfig, options?: AxiosCustomOpt): Promise<T> {
    const allConfig: CreateAxiosOptions = Object.assign({}, this.createAxiosOptions, config);
    const { _commonOptions } = allConfig;
    const allOpt: AxiosCustomOpt = Object.assign({}, _commonOptions, options);
    allConfig._commonOptions = allOpt;
    return this.axiosInstance.request(allConfig);
  }
}
