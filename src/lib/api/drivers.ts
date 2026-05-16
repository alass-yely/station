import { apiRequest, ApiError } from "@/lib/api/client";
import { DriverResolutionResponse, ResolvedDriver } from "@/types/driver";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const mapResolvedDriver = (payload: unknown): ResolvedDriver => {
  const raw = asRecord(payload);

  return {
    id: asString(raw.id),
    firstName: asString(raw.firstName),
    lastName: asString(raw.lastName),
    phone: asString(raw.phone),
    qrCodeToken: asString(raw.qrCodeToken || raw.qr_code_token) || undefined,
    referralCode: asString(raw.referralCode || raw.referral_code) || undefined,
    status: asString(raw.status) || undefined
  };
};

export const resolveDriverByQrToken = async (
  qrToken: string,
  accessToken: string
): Promise<DriverResolutionResponse> => {
  try {
    const encodedToken = encodeURIComponent(qrToken);
    const response = await apiRequest<unknown>(`/drivers/resolve-by-qr/${encodedToken}`, {
      method: "GET",
      token: accessToken
    });

    const root = asRecord(response);
    const data = asRecord(root.data);
    const driver = mapResolvedDriver(data.driver || data);

    if (!driver.id) {
      throw new ApiError("Chauffeur introuvable.", 404, response);
    }

    return { driver };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      throw new ApiError("Chauffeur introuvable.", error.status, error.payload);
    }

    throw error;
  }
};
