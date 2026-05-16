import { apiRequest, ApiError } from "@/lib/api/client";
import {
  CreateStationTransactionRequest,
  CreateStationTransactionResponse,
  StationTransaction,
  StationTransactionDetails
} from "@/types/transaction";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const parseCashbackAmount = (raw: UnknownRecord): number | undefined => {
  const cashback = asRecord(raw.cashback);
  return (
    asNumber(raw.cashbackAmount) ||
    asNumber(cashback.amount) ||
    asNumber(cashback.value)
  );
};

const parseDriverName = (raw: UnknownRecord): string | undefined => {
  const driver = asRecord(raw.driver);
  const first = asString(driver.firstName) || "";
  const last = asString(driver.lastName) || "";
  const full = `${first} ${last}`.trim();

  return asString(raw.driverName) || full || undefined;
};

const parseDriverPhone = (raw: UnknownRecord): string | undefined => {
  const driver = asRecord(raw.driver);
  return asString(raw.driverPhone) || asString(driver.phone);
};

const parseReference = (raw: UnknownRecord): string | undefined =>
  asString(raw.reference) || asString(raw.transactionReference) || asString(raw.code);

const mapTransaction = (payload: unknown): StationTransaction => {
  const raw = asRecord(payload);
  return {
    id: asString(raw.id) || "",
    reference: parseReference(raw),
    driverId: asString(raw.driverId) || asString(asRecord(raw.driver).id),
    driverName: parseDriverName(raw),
    fuelType: asString(raw.fuelType),
    liters: asNumber(raw.liters),
    amount: asNumber(raw.amount),
    cashbackAmount: parseCashbackAmount(raw),
    status: asString(raw.status),
    createdAt: asString(raw.createdAt),
    confirmedAt: asString(raw.confirmedAt)
  };
};

const mapTransactionDetails = (payload: unknown): StationTransactionDetails => {
  const raw = asRecord(payload);
  const station = asRecord(raw.station);
  const organization = asRecord(raw.organization);

  return {
    id: asString(raw.id) || "",
    reference: parseReference(raw),
    driverName: parseDriverName(raw),
    driverPhone: parseDriverPhone(raw),
    fuelType: asString(raw.fuelType),
    liters: asNumber(raw.liters),
    amount: asNumber(raw.amount),
    cashbackAmount: parseCashbackAmount(raw),
    status: asString(raw.status),
    createdAt: asString(raw.createdAt),
    confirmedAt: asString(raw.confirmedAt),
    stationName: asString(raw.stationName) || asString(station.name),
    organizationName: asString(raw.organizationName) || asString(organization.name),
    pumpPhotoUrl: asString(raw.pumpPhotoUrl)
  };
};

const parseCreateTransactionResponse = (payload: unknown): CreateStationTransactionResponse => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  const transactionSource = data.transaction || root.transaction || data || root;
  const transaction = mapTransaction(transactionSource);

  if (!transaction.id) {
    throw new ApiError("Réponse backend invalide après création transaction.");
  }

  return { transaction };
};

const parseGetTransactionResponse = (payload: unknown): StationTransactionDetails => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const source = data.transaction || root.transaction || data || root;
  const transaction = mapTransactionDetails(source);

  if (!transaction.id) {
    throw new ApiError("Transaction introuvable.", 404, payload);
  }

  return transaction;
};

const humanizeCreateError = (error: ApiError): ApiError => {
  if (error.status === 404) {
    return new ApiError("Chauffeur ou station introuvable.", error.status, error.payload);
  }

  if (error.status === 403) {
    return new ApiError("Votre compte n'est pas autorisé à créer une transaction.", error.status, error.payload);
  }

  if (error.status === 400) {
    return new ApiError("Données transaction invalides. Vérifiez carburant, litres et montant.", error.status, error.payload);
  }

  return error;
};

export const createStationTransaction = async (
  payload: CreateStationTransactionRequest,
  accessToken: string
): Promise<CreateStationTransactionResponse> => {
  try {
    const response = await apiRequest<unknown>("/transactions", {
      method: "POST",
      token: accessToken,
      body: {
        driverId: payload.driverId,
        driverQrCodeToken: payload.qrCodeToken,
        stationId: payload.stationId,
        organizationId: payload.organizationId,
        liters: payload.liters,
        amount: payload.amount,
        fuelType:
          String(payload.fuelType).toUpperCase() === "ESSENCE"
            ? "GASOLINE"
            : String(payload.fuelType).toUpperCase(),
        pumpPhotoUrl: payload.pumpPhotoUrl || "/uploads/pump-photo-placeholder.jpg"
      }
    });

    return parseCreateTransactionResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw humanizeCreateError(error);
    }

    throw error;
  }
};

export const getTransactionById = async (
  id: string,
  accessToken: string
): Promise<StationTransactionDetails> => {
  try {
    const response = await apiRequest<unknown>(`/transactions/${id}`, {
      method: "GET",
      token: accessToken
    });

    return parseGetTransactionResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new ApiError("Transaction introuvable.", 404, error.payload);
      }
      throw new ApiError("Impossible de charger cette transaction.", error.status, error.payload);
    }

    throw new ApiError("Erreur réseau. Réessayez.");
  }
};
