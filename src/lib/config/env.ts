const fallbackApiBaseUrl = 'https://api.yely.tech/api/v1';

export const env = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    fallbackApiBaseUrl,
} as const;

export function assertEnv() {
  if (!env.apiBaseUrl) {
    throw new Error('Missing API base URL in environment variables.');
  }
}
