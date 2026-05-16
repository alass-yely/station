export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions<TBody = unknown> = {
  method?: HttpMethod;
  body?: TBody;
  token?: string;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
  responseText?: string;
};
