export type CashbackSummary = {
  totalEarned?: number | string;
  availableBalance?: number | string;
  pendingBalance?: number | string;
  totalEntries?: number;
  lastEarnedAt?: string;
};

export type CashbackEntry = {
  id: string;
  amount: number | string;
  source?: string;
  transactionId?: string;
  transactionReference?: string;
  stationName?: string;
  status?: string;
  createdAt?: string;
};

export type DriverCashbackResponse = {
  summary: CashbackSummary;
  entries: CashbackEntry[];
};

export type CashbackBalance = {
  available: number;
  pending: number;
  currency: 'XOF';
};
