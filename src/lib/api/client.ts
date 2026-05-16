import { env } from '../config/env';
import { ApiError, ApiRequestOptions } from '../../types/api';

const DEFAULT_TIMEOUT_MS = 15000;

function buildHeaders(token?: string, extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders ?? {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

function parseResponseBody(text: string): unknown {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function resolveErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }
    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error;
    }
  }

  return fallback;
}

export async function request<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const {
    method = 'GET',
    body,
    token,
    headers,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: buildHeaders(token, headers),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    const data = parseResponseBody(text);

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: resolveErrorMessage(data, `HTTP ${response.status} on ${method} ${path}`),
        details: data,
        responseText: text,
      };
      throw error;
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: ApiError = {
        status: 0,
        message: `La requete a expire apres ${timeoutMs}ms.`,
      };
      throw timeoutError;
    }

    if (typeof error === 'object' && error !== null && 'status' in error) {
      throw error;
    }

    const networkError: ApiError = {
      status: 0,
      message: 'Erreur reseau. Verifiez votre connexion puis reessayez.',
      details: error,
    };
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}
