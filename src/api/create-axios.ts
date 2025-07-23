/*
 * @Author: zby
 * @Date: 2023-07-12 17:47:50
 * @LastEditTime: 2024-07-18 13:34:54
 * @LastEditors: zby
 * @Description: 接口请求拦截配置
 */

import axios from 'axios';
import qs from 'qs';

import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

console.log(window, import.meta.env);

const isFunction = val => typeof val === 'function';

export type CustomConfig = {
  _commonOptions?: AxiosCustomOpt;
  _transformFn?: AxiosTransform;
};

export type CreateAxiosOptions = AxiosRequestConfig & CustomConfig;

export type AxiosCustomOpt = {
  isUploadFile?: boolean; //是否上传文件
  supportFormUrlencoded?: boolean; //是否支持www-form-urlencoded格式
  joinTime?: boolean; //get请求是否加时间戳

  afHLoading?: boolean; //是否显示loading
  loadingTxt?: string; //loading提示文字
  delayLoadingTime?: number; //延迟多少毫秒显示loading
  withToken?: boolean; //是否携带token
  authenticationScheme?: string; //token的前缀
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
        const { _commonOptions } = config;
        const { joinTime, isUploadFile, supportFormUrlencoded } = _commonOptions || {};
        if (supportFormUrlencoded && config.data) {
          config.data = qs.stringify(config.data);
        }
        // get请求加时间戳 防止缓存
        if (joinTime && config.method === 'get') {
          config.params = {
            ...config.params,
            _t: new Date().getTime(),
          };
        }
        if (isUploadFile && config.headers) {
          //为了兼容传入的data不是FormData格式的情况，axios检测到请求头是multipart/form-data时会自动转换成FormData格式并append数据
          config.headers['Content-Type'] = 'multipart/form-data';
        }
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
