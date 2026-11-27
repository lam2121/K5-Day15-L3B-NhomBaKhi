// Same-origin client for /api/v1. Add ?mock=1 to the page URL to use the
// synthetic mock instead (loaded as a separate chunk only in that case).

export const API_BASE = '/api/v1';
export const IS_MOCK = new URLSearchParams(window.location.search).has('mock');

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message = '',
    public requestId?: string,
  ) {
    super(message);
  }
}

export type Body = unknown;
export type Handler = (method: string, path: string, body?: Body) => Promise<unknown>;

let mockHandler: Handler | null = null;
export function setMockHandler(handler: Handler) {
  mockHandler = handler;
}

function fallbackCode(status: number): string {
  if (status === 429) return 'busy';
  if (status === 413) return 'too_large';
  if (status === 401) return 'unauthorized';
  if (status === 404) return 'quiz_unavailable';
  return 'internal_error';
}

export async function request<T>(method: string, path: string, body?: Body, isForm = false): Promise<T> {
  if (mockHandler) return (await mockHandler(method, path, body)) as T;
  const init: RequestInit = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
  if (body !== undefined) {
    if (isForm) init.body = body as FormData;
    else {
      (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }
  let res: Response;
  try {
    res = await fetch(API_BASE + path, init);
  } catch {
    throw new ApiError(0, 'network');
  }
  const text = await res.text();
  let data: { error?: { code?: string; message?: string }; request_id?: string } | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (res.ok) return data as T;
  const err = data?.error ?? {};
  throw new ApiError(res.status, err.code || fallbackCode(res.status), err.message || '', data?.request_id);
}

export function asApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError(0, 'internal_error', String(err));
}

export const pad2 = (n: number) => (n < 10 ? '0' + n : String(n));
