import {
  DriverRegisterRequest,
  DriverRegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '../../types/auth';
import { ApiError } from '../../types/api';
import { request } from './client';

function pickAuthPayload(payload: unknown): Partial<LoginResponse> {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const root = payload as Record<string, unknown>;
  const nested =
    (root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null) ??
    (root.result && typeof root.result === 'object'
      ? (root.result as Record<string, unknown>)
      : null);

  const source = nested ?? root;

  return {
    accessToken:
      (source.accessToken as string | undefined) ??
      (source.token as string | undefined) ??
      (source.access_token as string | undefined),
    refreshToken:
      (source.refreshToken as string | undefined) ??
      (source.refresh_token as string | undefined) ??
      '',
    user:
      (source.user as User | undefined) ??
      (source.driver as User | undefined) ??
      (source.profile as User | undefined),
  };
}

function assertAuthPayload(payload: Partial<LoginResponse>): LoginResponse {
  if (!payload.accessToken || !payload.user?.id) {
    const error: ApiError = {
      status: 0,
      message: "Reponse d'authentification invalide. Veuillez reessayer.",
      details: payload,
    };
    throw error;
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken ?? '',
    user: payload.user,
  };
}

export async function loginDriver(payload: LoginRequest): Promise<LoginResponse> {
  const raw = await request<unknown, LoginRequest>('/auth/login', {
    method: 'POST',
    body: payload,
    timeoutMs: 30000,
  });
  return assertAuthPayload(pickAuthPayload(raw));
}

export async function registerDriver(payload: DriverRegisterRequest): Promise<DriverRegisterResponse> {
  const raw = await request<unknown, DriverRegisterRequest>('/auth/drivers/register', {
    method: 'POST',
    body: payload,
    timeoutMs: 30000,
  });
  return assertAuthPayload(pickAuthPayload(raw));
}

export async function getMe(accessToken: string): Promise<User> {
  return request<User>('/auth/me', {
    method: 'GET',
    token: accessToken,
  });
}
