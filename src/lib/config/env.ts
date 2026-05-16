const FALLBACK_API_BASE_URL = "https://api.yely.tech/api/v1";

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, "");

export const env = {
  apiBaseUrl: normalizeBaseUrl(
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || FALLBACK_API_BASE_URL
  )
};
