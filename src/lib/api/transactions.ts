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

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseCashbackAmount = (raw: UnknownRecord): number | undefined => {
  const cashback = asRecord(raw.cashback);
  return asNumber(raw.cashbackAmount) || asNumber(cashback.amount) || asNumber(cashback.value);
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

const parsePumpName = (raw: UnknownRecord): string | undefined => {
  const pump = asRecord(raw.pump);
  return asString(raw.pumpName) || asString(pump.label) || asString(pump.name);
};

const parsePumpCode = (raw: UnknownRecord): string | undefined => {
  const pump = asRecord(raw.pump);
  return asString(raw.pumpCode) || asString(pump.pumpCode) || asString(pump.code);
};

const parseWorkSessionId = (raw: UnknownRecord): string | undefined => {
  const workSession = asRecord(raw.workSession);
  return asString(raw.workSessionId) || asString(workSession.id);
};

const parseCashierName = (raw: UnknownRecord): string | undefined => {
  const cashier = asRecord(raw.cashier);
  const first = asString(cashier.firstName) || "";
  const last = asString(cashier.lastName) || "";
  const full = `${first} ${last}`.trim();
  return asString(raw.cashierName) || full || undefined;
};

const parseStationName = (raw: UnknownRecord): string | undefined => {
  const station = asRecord(raw.station);
  return asString(raw.stationName) || asString(station.name);
};

const parseOrganizationName = (raw: UnknownRecord): string | undefined => {
  const organization = asRecord(raw.organization);
  return asString(raw.organizationName) || asString(organization.name);
};

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
    confirmedAt: asString(raw.confirmedAt),
    stationName: parseStationName(raw),
    pumpName: parsePumpName(raw),
    pumpCode: parsePumpCode(raw),
    workSessionId: parseWorkSessionId(raw),
    cashierName: parseCashierName(raw)
  };
};

const mapTransactionDetails = (payload: unknown): StationTransactionDetails => {
  const raw = asRecord(payload);

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
    stationName: parseStationName(raw),
    organizationName: parseOrganizationName(raw),
    pumpPhotoUrl: asString(raw.pumpPhotoUrl),
    pumpName: parsePumpName(raw),
    pumpCode: parsePumpCode(raw),
    workSessionId: parseWorkSessionId(raw),
    cashierName: parseCashierName(raw)
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
  const payload = asRecord(error.payload);
  const message =
    asString(payload.message) ||
    asString(payload.error) ||
    asString(asRecord(payload.data).message) ||
    "";
  const normalized = message.toLowerCase();

  if (normalized.includes("no open work session")) {
    return new ApiError("Aucune session ouverte. Sélectionnez une pompe.", error.status, error.payload);
  }

  if (normalized.includes("pump must be active")) {
    return new ApiError("Pompe indisponible. Choisissez une autre pompe.", error.status, error.payload);
  }

  if (error.status === 404) {
    return new ApiError("Chauffeur introuvable.", error.status, error.payload);
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
  if (!payload.pumpPhotoUrl) {
    throw new ApiError("Photo pompe obligatoire.", 400);
  }

  if (!payload.driverId && !payload.qrCodeToken) {
    throw new ApiError("Chauffeur obligatoire.", 400);
  }

  try {
    const response = await apiRequest<unknown>("/transactions", {
      method: "POST",
      token: accessToken,
      body: {
        ...(payload.driverId ? { driverId: payload.driverId } : {}),
        ...(payload.qrCodeToken ? { driverQrCodeToken: payload.qrCodeToken } : {}),
        ...(payload.organizationId ? { organizationId: payload.organizationId } : {}),
        liters: payload.liters,
        amount: payload.amount,
        fuelType:
          String(payload.fuelType).toUpperCase() === "ESSENCE"
            ? "GASOLINE"
            : String(payload.fuelType).toUpperCase(),
        pumpPhotoUrl: payload.pumpPhotoUrl
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
