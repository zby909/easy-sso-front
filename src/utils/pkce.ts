/**
 * PKCE (Proof Key for Code Exchange) 工具函数
 * 用于增强OAuth 2.0授权码流程的安全性
 */
import CryptoJS from 'crypto-js';
import type { PKCEParams } from '@/types/api-modules/api';

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns base64url编码的随机字符串
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Base64 URL编码
 * @param buffer 待编码的数据
 * @returns base64url编码字符串
 */
function base64URLEncode(buffer: Uint8Array): string {
  // 将Uint8Array转换为二进制字符串
  let binaryString = '';
  for (let i = 0; i < buffer.length; i++) {
    binaryString += String.fromCharCode(buffer[i]);
  }

  // 转换为base64然后替换字符使其符合URL安全标准
  return btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * 使用SHA256哈希
 * @param input 输入字符串
 * @returns base64url编码的哈希值
 */
function sha256(input: string): string {
  // 使用crypto-js进行SHA256哈希
  const hash = CryptoJS.SHA256(input);
  // 转换为base64url格式
  return hash.toString(CryptoJS.enc.Base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * 生成PKCE参数
 * @returns PKCE参数对象
 */
export function generatePKCEParams(): PKCEParams {
  // 生成code_verifier (43-128字符的随机字符串)
  const codeVerifier = generateRandomString(32); // 32字节 = 43字符的base64url

  // 生成code_challenge (code_verifier的SHA256哈希值)
  const codeChallenge = sha256(codeVerifier);

  // 生成state参数防止CSRF攻击
  const state = 'state_' + Date.now() + '_' + generateRandomString(16);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
    state,
  };
}

/**
 * 验证state参数
 * @param receivedState 接收到的state
 * @param originalState 原始的state
 * @returns 是否匹配
 */
export function validateState(receivedState: string, originalState: string): boolean {
  return receivedState === originalState;
}

/**
 * 存储PKCE参数到sessionStorage
 * @param params PKCE参数
 */
export function storePKCEParams(params: PKCEParams): void {
  sessionStorage.setItem('pkce_params', JSON.stringify(params));
}

/**
 * 从sessionStorage获取PKCE参数
 * @returns PKCE参数或null
 */
export function getPKCEParams(): PKCEParams | null {
  const stored = sessionStorage.getItem('pkce_params');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * 清除存储的PKCE参数
 */
export function clearPKCEParams(): void {
  sessionStorage.removeItem('pkce_params');
}

/**
 * 构建授权URL
 * @param baseUrl SSO登录页面基础URL
 * @param redirectUri 回调地址
 * @param pkceParams PKCE参数
 * @returns 完整的授权URL
 */
export function buildAuthorizationUrl(baseUrl: string, redirectUri: string, pkceParams: PKCEParams): string {
  const params = new URLSearchParams({
    redirect_uri: redirectUri,
    state: pkceParams.state,
    code_challenge: pkceParams.codeChallenge,
    code_challenge_method: pkceParams.codeChallengeMethod,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * 解析回调URL中的参数
 * @param url 回调URL
 * @returns 解析出的参数
 */
export function parseCallbackUrl(url: string): { code?: string; state?: string; error?: string; error_description?: string } {
  const urlObj = new URL(url);
  const params = urlObj.searchParams;

  return {
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    error_description: params.get('error_description') || undefined,
  };
}
