import { request } from './client';
import { DriverDashboardData, DriverQr } from '../../types/driver';
import { ReferralItem, ReferralSummary } from '../../types/referral';
import {
  DriverTransaction,
  DriverTransactionsQuery,
  DriverTransactionsResponse,
  PaginationMeta,
} from '../../types/transaction';
import { CashbackEntry, CashbackSummary, DriverCashbackResponse } from '../../types/cashback';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function unwrapPayload(value: unknown): Record<string, unknown> {
  const root = asRecord(value) ?? {};
  const nestedData = asRecord(root.data);
  const nestedResult = asRecord(root.result);
  return nestedData ?? nestedResult ?? root;
}

function extractToken(value: unknown): string | undefined {
  const source = unwrapPayload(value);

  const direct =
    (source.token as string | undefined) ??
    (source.qrToken as string | undefined) ??
    (source.qr_code_token as string | undefined) ??
    (source.qrCodeToken as string | undefined);

  if (direct) {
    return direct;
  }

  const qrObj = asRecord(source.qr);
  if (!qrObj) {
    return undefined;
  }

  return (
    (qrObj.token as string | undefined) ??
    (qrObj.qrToken as string | undefined) ??
    (qrObj.qr_code_token as string | undefined) ??
    (qrObj.qrCodeToken as string | undefined)
  );
}

function normalizeMeta(value: unknown): PaginationMeta | undefined {
  const meta = asRecord(value);
  if (!meta) {
    return undefined;
  }

  const page = Number(meta.page ?? meta.currentPage);
  const limit = Number(meta.limit ?? meta.perPage);
  const total = Number(meta.total ?? meta.totalItems);
  const totalPages = Number(meta.totalPages ?? meta.lastPage);

  const normalized: PaginationMeta = {
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    total: Number.isFinite(total) ? total : undefined,
    totalPages: Number.isFinite(totalPages) ? totalPages : undefined,
    hasNextPage:
      typeof meta.hasNextPage === 'boolean'
        ? meta.hasNextPage
        : typeof meta.nextPage === 'number'
          ? meta.nextPage > (Number.isFinite(page) ? page : 0)
          : undefined,
  };

  return normalized;
}

function stableTransactionId(source: Record<string, unknown>): string {
  const directId = source.id ?? source._id ?? source.reference;
  if (directId) {
    return String(directId);
  }

  const stableDate = String(source.confirmedAt ?? source.createdAt ?? 'no-date');
  const stableAmount = String(source.amount ?? 'no-amount');
  const stableStation = String(source.stationName ?? 'no-station');
  return `tx-${stableDate}-${stableAmount}-${stableStation}`;
}

function normalizeTransaction(input: unknown): DriverTransaction {
  const source = asRecord(input) ?? {};
  const station = asRecord(source.station);
  const organization = asRecord(source.organization);

  return {
    id: stableTransactionId(source),
    reference: source.reference?.toString(),
    stationName: (source.stationName as string | undefined) ?? (station?.name as string | undefined),
    station: station
      ? {
          id: station.id?.toString(),
          name: station.name?.toString(),
        }
      : undefined,
    organizationName:
      (source.organizationName as string | undefined) ?? (organization?.name as string | undefined),
    organization: organization
      ? {
          id: organization.id?.toString(),
          name: organization.name?.toString(),
        }
      : undefined,
    fuelType: source.fuelType?.toString(),
    liters: source.liters as number | string | undefined,
    amount: source.amount as number | string | undefined,
    cashbackAmount:
      (source.cashbackAmount as number | string | undefined) ??
      (source.cashback as number | string | undefined),
    status: source.status?.toString(),
    confirmedAt: source.confirmedAt?.toString(),
    createdAt: source.createdAt?.toString(),
  };
}

function normalizeCashbackSummary(payload: Record<string, unknown>, entries: CashbackEntry[]): CashbackSummary {
  const summaryCandidate = asRecord(payload.summary) ?? payload;

  return {
    totalEarned:
      (summaryCandidate.totalEarned as number | string | undefined) ??
      (summaryCandidate.total as number | string | undefined),
    availableBalance:
      (summaryCandidate.availableBalance as number | string | undefined) ??
      (summaryCandidate.available as number | string | undefined),
    pendingBalance:
      (summaryCandidate.pendingBalance as number | string | undefined) ??
      (summaryCandidate.pending as number | string | undefined),
    totalEntries:
      Number(summaryCandidate.totalEntries ?? summaryCandidate.entriesCount ?? entries.length) || entries.length,
    lastEarnedAt:
      (summaryCandidate.lastEarnedAt as string | undefined) ??
      (entries[0]?.createdAt as string | undefined),
  };
}

function normalizeCashbackEntry(input: unknown): CashbackEntry {
  const source = asRecord(input) ?? {};
  const station = asRecord(source.station);

  const fallbackId = `cb-${String(source.createdAt ?? 'no-date')}-${String(source.amount ?? '0')}-${String(source.transactionId ?? source.reference ?? 'x')}`;

  return {
    id: String(source.id ?? source._id ?? source.transactionId ?? source.reference ?? fallbackId),
    amount: (source.amount as number | string | undefined) ?? 0,
    source: (source.source as string | undefined) ?? (source.type as string | undefined),
    transactionId: source.transactionId?.toString(),
    transactionReference:
      (source.transactionReference as string | undefined) ?? source.reference?.toString(),
    stationName: (source.stationName as string | undefined) ?? station?.name?.toString(),
    status: source.status?.toString(),
    createdAt: source.createdAt?.toString(),
  };
}

function normalizeReferralItem(input: unknown): ReferralItem {
  const source = asRecord(input) ?? {};

  return {
    driverId: source.driverId?.toString(),
    id: (source.id as string | undefined) ?? source._id?.toString(),
    firstName: source.firstName?.toString(),
    lastName: source.lastName?.toString(),
    phone: source.phone?.toString(),
    confirmedTransactionsCount: Number(source.confirmedTransactionsCount ?? source.transactionsCount ?? 0),
    bonusStatus: source.bonusStatus?.toString() ?? source.status?.toString(),
    bonusAmount: (source.bonusAmount as number | string | undefined) ?? (source.rewardAmount as number | string | undefined),
    createdAt: source.createdAt?.toString(),
    affiliatedAt: source.affiliatedAt?.toString(),
  };
}

function normalizeReferralSummary(value: unknown): ReferralSummary {
  const payload = unwrapPayload(value);
  const referralsRaw = asArray(payload.referrals);

  return {
    referralCode: (payload.referralCode as string | undefined) ?? (payload.code as string | undefined),
    totalReferralsCount: Number(payload.totalReferralsCount ?? payload.totalCount ?? 0),
    activeReferralsCount: Number(payload.activeReferralsCount ?? payload.activeCount ?? 0),
    pendingReferralsCount: Number(payload.pendingReferralsCount ?? payload.pendingCount ?? 0),
    eligibleReferralsCount: Number(payload.eligibleReferralsCount ?? payload.eligibleCount ?? 0),
    availableBonusAmount: (payload.availableBonusAmount as number | string | undefined) ?? (payload.availableBonus as number | string | undefined),
    pendingBonusAmount: (payload.pendingBonusAmount as number | string | undefined) ?? (payload.pendingBonus as number | string | undefined),
    referrals: referralsRaw.map(normalizeReferralItem),
  };
}

export async function getDriverDashboard(accessToken: string): Promise<DriverDashboardData> {
  const raw = await request<unknown>('/drivers/me/dashboard', {
    method: 'GET',
    token: accessToken,
  });

  const payload = unwrapPayload(raw);
  const qrToken = extractToken(payload);

  const normalized: DriverDashboardData = {
    ...(payload as unknown as DriverDashboardData),
    qr: {
      token:
        qrToken ??
        asRecord(payload.qr)?.token?.toString() ??
        asRecord(payload.driver)?.qrCodeToken?.toString(),
    },
  };

  return normalized;
}

export async function getDriverQr(accessToken: string): Promise<DriverQr> {
  const raw = await request<unknown>('/drivers/me/qr', {
    method: 'GET',
    token: accessToken,
  });

  return { token: extractToken(raw) };
}

export async function getDriverReferralSummary(accessToken: string): Promise<ReferralSummary> {
  const raw = await request<unknown>('/drivers/me/referrals/summary', {
    method: 'GET',
    token: accessToken,
  });

  return normalizeReferralSummary(raw);
}

export async function getDriverTransactions(
  accessToken: string,
  params: DriverTransactionsQuery = {},
): Promise<DriverTransactionsResponse> {
  const query = new URLSearchParams();

  if (typeof params.page === 'number') {
    query.set('page', String(params.page));
  }
  if (typeof params.limit === 'number') {
    query.set('limit', String(params.limit));
  }

  const path = query.toString()
    ? `/drivers/me/transactions?${query.toString()}`
    : '/drivers/me/transactions';

  const raw = await request<unknown>(path, {
    method: 'GET',
    token: accessToken,
  });

  if (Array.isArray(raw)) {
    return {
      items: asArray(raw).map(normalizeTransaction),
      meta: undefined,
    };
  }

  const root = asRecord(raw) ?? {};
  const payload = unwrapPayload(raw);

  const directItems = asArray(payload.items);
  const dataItems = asArray(root.data);
  const recordsItems = asArray(payload.records);

  const candidate =
    directItems.length > 0
      ? directItems
      : dataItems.length > 0
        ? dataItems
        : recordsItems;

  return {
    items: candidate.map(normalizeTransaction),
    meta: normalizeMeta(payload.meta ?? root.meta ?? payload.pagination ?? root.pagination),
  };
}

export async function getDriverCashback(accessToken: string): Promise<DriverCashbackResponse> {
  const raw = await request<unknown>('/drivers/me/cashback', {
    method: 'GET',
    token: accessToken,
  });

  if (Array.isArray(raw)) {
    const entries = raw.map(normalizeCashbackEntry);
    return {
      summary: normalizeCashbackSummary({}, entries),
      entries,
    };
  }

  const root = asRecord(raw) ?? {};
  const payload = unwrapPayload(raw);

  const items = asArray(payload.items);
  const entriesFromData = asArray(root.data);
  const entriesFromEntries = asArray(payload.entries);

  const entriesRaw =
    items.length > 0
      ? items
      : entriesFromEntries.length > 0
        ? entriesFromEntries
        : entriesFromData;

  const entries = entriesRaw.map(normalizeCashbackEntry);
  const summary = normalizeCashbackSummary(payload, entries);

  return { summary, entries };
}
