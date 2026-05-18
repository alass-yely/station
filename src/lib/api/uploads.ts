import { ApiError } from "@/lib/api/client";
import { env } from "@/lib/config/env";
import { UploadPumpPhotoResponse } from "@/types/upload";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const safeParseJson = (raw: string): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const extractUploadUrl = (payload: unknown): string => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  return (
    asString(root.url) ||
    asString(root.fileUrl) ||
    asString(root.path) ||
    asString(data.url) ||
    asString(data.fileUrl) ||
    asString(data.path)
  );
};

const buildFile = (uri: string) => {
  const fileName = uri.split("/").pop() || `pump_${Date.now()}.jpg`;
  const lower = fileName.toLowerCase();
  const isPng = lower.endsWith(".png");
  const isWebp = lower.endsWith(".webp");
  const mimeType = isWebp ? "image/webp" : isPng ? "image/png" : "image/jpeg";

  return {
    uri,
    name: fileName,
    type: mimeType
  } as unknown as Blob;
};

export const uploadPumpPhoto = async (
  uri: string,
  accessToken: string
): Promise<UploadPumpPhotoResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", buildFile(uri));

    const response = await fetch(`${env.apiBaseUrl}/uploads/pump-photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: formData
    });

    const text = await response.text();
    const payload = safeParseJson(text);

    if (!response.ok) {
      throw new ApiError("Impossible d'envoyer la photo pompe.", response.status, payload);
    }

    const url = extractUploadUrl(payload);
    if (!url) {
      throw new ApiError("Impossible d'envoyer la photo pompe.", 500, payload);
    }

    return { url, raw: payload };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Impossible d'envoyer la photo pompe.");
  }
};
