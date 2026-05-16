export type ParsedDriverQrPayload = {
  qrToken: string;
};

const safeJsonParse = (raw: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, unknown>;
    }

    return null;
  } catch {
    return null;
  }
};

const readTokenFromObject = (payload: Record<string, unknown>): string => {
  const candidates = [
    payload.qrToken,
    payload.token,
    payload.qr_code_token,
    payload.qrCodeToken,
    payload.driverQrCodeToken
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
};

export const parseDriverQrPayload = (raw: string): ParsedDriverQrPayload => {
  const value = raw.trim();
  if (!value) {
    throw new Error("QR invalide.");
  }

  const asJson = safeJsonParse(value);
  if (asJson) {
    const jsonToken = readTokenFromObject(asJson);
    if (jsonToken) return { qrToken: jsonToken };
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const token =
        url.searchParams.get("token") ||
        url.searchParams.get("qrToken") ||
        url.searchParams.get("qr_code_token") ||
        "";

      if (token.trim()) {
        return { qrToken: token.trim() };
      }

      const pathPart = url.pathname.split("/").filter(Boolean).pop();
      if (pathPart) {
        return { qrToken: decodeURIComponent(pathPart) };
      }
    } catch {
      throw new Error("QR invalide.");
    }
  }

  return { qrToken: value };
};
