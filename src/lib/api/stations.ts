import { apiRequest, ApiError } from "@/lib/api/client";
import {
  PaginationMeta,
  StationTodaySummary,
  StationTransactionListItem,
  StationTransactionsQuery,
  StationTransactionsResponse
} from "@/types/transaction";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const mapItem = (payload: unknown): StationTransactionListItem => {
  const raw = asRecord(payload);
  const driver = asRecord(raw.driver);

  return {
    id: asString(raw.id) || "",
    reference: asString(raw.reference),
    driverId: asString(raw.driverId),
    driverName: asString(raw.driverName),
    driverPhone: asString(raw.driverPhone),
    driver:
      Object.keys(driver).length > 0
        ? {
            id: asString(driver.id),
            firstName: asString(driver.firstName),
            lastName: asString(driver.lastName),
            phone: asString(driver.phone)
          }
        : undefined,
    fuelType: asString(raw.fuelType),
    liters: asNumber(raw.liters),
    amount: asNumber(raw.amount),
    cashbackAmount: asNumber(raw.cashbackAmount),
    status: asString(raw.status),
    createdAt: asString(raw.createdAt),
    confirmedAt: asString(raw.confirmedAt)
  };
};

const mapMeta = (rawMeta: unknown, itemCount: number, fallbackPage?: number, fallbackLimit?: number): PaginationMeta | undefined => {
  const meta = asRecord(rawMeta);
  if (Object.keys(meta).length === 0) {
    if (!fallbackPage || !fallbackLimit) return undefined;

    return {
      page: fallbackPage,
      limit: fallbackLimit,
      total: itemCount,
      totalPages: 1,
      hasNextPage: false
    };
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

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage
  };
};

const parseListResponse = (
  payload: unknown,
  fallbackPage?: number,
  fallbackLimit?: number
): StationTransactionsResponse => {
  const root = asRecord(payload);
  const data = asRecord(root.data);

  const possibleArray =
    (Array.isArray(data.items) && data.items) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(data.transactions) && data.transactions) ||
    (Array.isArray(root.transactions) && root.transactions) ||
    (Array.isArray(data) ? data : undefined) ||
    (Array.isArray(payload) ? payload : []);

  const items = possibleArray.map(mapItem).filter((item) => item.id);
  const meta = mapMeta(data.meta || root.meta, items.length, fallbackPage, fallbackLimit);

  return { items, meta };
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

export const getStationTransactions = async (
  accessToken: string,
  params?: StationTransactionsQuery,
  fallbackStationId?: string
): Promise<StationTransactionsResponse> => {
  const query = buildQuery(params);

  try {
    const response = await apiRequest<unknown>(`/station-dashboard/me/transactions${query}`, {
      method: "GET",
      token: accessToken
    });

    return parseListResponse(response, params?.page, params?.limit);
  } catch (error) {
    if (!(error instanceof ApiError) || ![400, 404].includes(error.status || 0)) {
      throw error;
    }

    if (!fallbackStationId) {
      throw new ApiError("Aucune station associée à ce compte.", 400);
    }

    const response = await apiRequest<unknown>(`/stations/${fallbackStationId}/transactions`, {
      method: "GET",
      token: accessToken
    });

    return parseListResponse(response, params?.page, params?.limit);
  }
};

export const getStationTransactionsToday = async (
  accessToken: string,
  stationId?: string
): Promise<StationTodaySummary> => {
  if (!stationId) {
    throw new ApiError("Aucune station associée à ce compte.", 400);
  }

  const response = await apiRequest<unknown>(`/stations/${stationId}/transactions/today`, {
    method: "GET",
    token: accessToken
  });

  const parsed = parseListResponse(response, 1, 1000);

  return parsed.items.reduce<StationTodaySummary>(
    (acc, item) => ({
      totalTransactions: acc.totalTransactions + 1,
      totalAmount: acc.totalAmount + (item.amount || 0),
      totalLiters: acc.totalLiters + (item.liters || 0),
      totalCashbackAmount: acc.totalCashbackAmount + (item.cashbackAmount || 0)
    }),
    {
      totalTransactions: 0,
      totalAmount: 0,
      totalLiters: 0,
      totalCashbackAmount: 0
    }
  );
};
