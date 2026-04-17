/**
 * HTTP 封装（基于 Node 18+ 内置 fetch）
 * - 带超时
 * - 带简单重试（指数退避）
 * - 统一错误格式
 */

/**
 * fetch 带超时
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 带重试的 JSON HTTP 请求
 *
 * @param {string} url
 * @param {object} options fetch options + { retries?, timeoutMs? }
 * @returns {Promise<{status:number, ok:boolean, data:any, text:string}>}
 */
export async function request(url, options = {}) {
  const {
    retries = 2,
    timeoutMs = 15000,
    headers = {},
    ...rest
  } = options;

  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          headers: { 'Accept': 'application/json', ...headers },
          ...rest,
        },
        timeoutMs
      );
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* 非 JSON */ }
      return {
        status: res.status,
        ok: res.ok,
        data,
        text,
        headers: Object.fromEntries(res.headers.entries()),
      };
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delayMs = 200 * Math.pow(2, attempt); // 200ms, 400ms, 800ms
        console.error(`  ⚠️  请求失败（第 ${attempt + 1}/${retries + 1} 次）: ${err.message}，${delayMs}ms 后重试`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw new Error(`HTTP 请求失败（已重试 ${retries} 次）: ${lastErr?.message}`);
}

/**
 * 辅助: 构建 Basic Auth header
 */
export function basicAuth(username, password) {
  const encoded = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * 辅助: Bearer Token header
 */
export function bearerAuth(token) {
  return `Bearer ${token}`;
}
