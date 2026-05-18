import { apiRequest } from "@/lib/api/client";
import { CashierTransaction, CashierTransactionsResponse, PaginationMeta, StationTransactionsQuery } from "@/types/transaction";

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

const mapMeta = (rawMeta: unknown, itemCount: number, fallbackPage?: number, fallbackLimit?: number): PaginationMeta | undefined => {
  const meta = asRecord(rawMeta);
  if (Object.keys(meta).length === 0) {
    if (!fallbackPage || !fallbackLimit) return undefined;
    return { page: fallbackPage, limit: fallbackLimit, total: itemCount, totalPages: 1, hasNextPage: false };
  }

  const page = asNumber(meta.page) ?? asNumber(meta.currentPage) ?? fallbackPage;
  const limit = asNumber(meta.limit) ?? fallbackLimit;
  const total = asNumber(meta.total);
  const totalPages = asNumber(meta.totalPages);
  const hasNextPage =
    typeof meta.hasNextPage === "boolean"
      ? meta.hasNextPage
      : totalPages && page
        ? page < totalPages
        : Boolean(asString(meta.nextCursor));

  return { page, limit, total, totalPages, hasNextPage };
};

const mapItem = (payload: unknown): CashierTransaction => {
  const raw = asRecord(payload);
  const driver = asRecord(raw.driver);
  const station = asRecord(raw.station);
  const pump = asRecord(raw.pump);
  const workSession = asRecord(raw.workSession);

  return {
    id: asString(raw.id) || "",
    reference: asString(raw.reference),
    liters: asNumber(raw.liters),
    amount: asNumber(raw.amount),
    fuelType: asString(raw.fuelType),
    pumpPhotoUrl: asString(raw.pumpPhotoUrl),
    cashbackAmount: asNumber(raw.cashbackAmount),
    status: asString(raw.status),
    confirmedAt: asString(raw.confirmedAt),
    createdAt: asString(raw.createdAt),
    driver:
      Object.keys(driver).length > 0
        ? {
            id: asString(driver.id),
            firstName: asString(driver.firstName),
            lastName: asString(driver.lastName),
            phone: asString(driver.phone)
          }
        : undefined,
    station:
      Object.keys(station).length > 0
        ? { id: asString(station.id), name: asString(station.name) }
        : undefined,
    pump:
      Object.keys(pump).length > 0
        ? {
            id: asString(pump.id),
            name: asString(pump.name) || asString(pump.label),
            code: asString(pump.code) || asString(pump.pumpCode)
          }
        : undefined,
    workSession:
      Object.keys(workSession).length > 0
        ? {
            id: asString(workSession.id),
            status: asString(workSession.status),
            startedAt: asString(workSession.startedAt) || asString(workSession.openedAt),
            endedAt: asString(workSession.endedAt)
          }
        : undefined
  };
};

const buildQuery = (params?: StationTransactionsQuery): string => {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  const query = search.toString();
  return query ? `?${query}` : "";
};

const parseListResponse = (
  payload: unknown,
  fallbackPage?: number,
  fallbackLimit?: number
): CashierTransactionsResponse => {
  const root = asRecord(payload);
  const data = root.data;
  const dataRecord = asRecord(data);
  const possibleArray =
    (Array.isArray(dataRecord.items) && dataRecord.items) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(dataRecord.transactions) && dataRecord.transactions) ||
    (Array.isArray(root.transactions) && root.transactions) ||
    (Array.isArray(data) ? data : undefined) ||
    (Array.isArray(payload) ? payload : []);

  const items = possibleArray.map(mapItem).filter((item) => item.id);
  const meta = mapMeta(dataRecord.meta || root.meta, items.length, fallbackPage, fallbackLimit);
  return { items, meta };
};

export const getMyCashierTransactions = async (
  accessToken: string,
  params?: StationTransactionsQuery
): Promise<CashierTransactionsResponse> => {
  const query = buildQuery(params);
  const response = await apiRequest<unknown>(`/cashiers/me/transactions${query}`, {
    method: "GET",
    token: accessToken
  });

  return parseListResponse(response, params?.page, params?.limit);
};
