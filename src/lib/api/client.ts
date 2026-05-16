import { env } from "@/lib/config/env";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: RequestMethod;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const buildHttpErrorMessage = (status: number, payload: unknown): string => {
  if (typeof payload === "object" && payload !== null) {
    const candidate = payload as { message?: string; error?: string };
    if (candidate.message) return candidate.message;
    if (candidate.error) return candidate.error;
  }

  return `Erreur HTTP ${status}`;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  const method = options.method ?? "GET";

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(buildHttpErrorMessage(response.status, payload), response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if ((error as Error)?.name === "AbortError") {
      throw new ApiError("La requête a expiré, veuillez réessayer.");
    }

    throw new ApiError("Impossible de contacter le serveur. Vérifiez votre connexion réseau.");
  } finally {
    clearTimeout(timeoutId);
  }
};
