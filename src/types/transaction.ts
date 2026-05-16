export type TransactionStatus = "pending" | "approved" | "rejected" | "cancelled" | string;

export type FuelType = "DIESEL" | "SUPER" | "ESSENCE" | string;

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
}

export interface StationTransactionListItem {
  id: string;
  reference?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driver?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  fuelType?: FuelType;
  liters?: number;
  amount?: number;
  cashbackAmount?: number;
  status?: TransactionStatus;
  createdAt?: string;
  confirmedAt?: string;
}

export interface StationTransactionsQuery {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface StationTransactionsResponse {
  items: StationTransactionListItem[];
  meta?: PaginationMeta;
}

export interface StationTodaySummary {
  totalTransactions: number;
  totalAmount: number;
  totalLiters: number;
  totalCashbackAmount: number;
}

export interface CreateStationTransactionRequest {
  driverId: string;
  qrCodeToken: string;
  fuelType: FuelType;
  liters: number;
  amount: number;
  stationId?: string;
  organizationId?: string;
  pumpPhotoUrl?: string;
}

export interface StationTransaction {
  id: string;
  reference?: string;
  driverId?: string;
  driverName?: string;
  fuelType?: FuelType;
  liters?: number;
  amount?: number;
  cashbackAmount?: number;
  status?: TransactionStatus;
  createdAt?: string;
  confirmedAt?: string;
}

export interface StationTransactionDetails {
  id: string;
  reference?: string;
  driverName?: string;
  driverPhone?: string;
  fuelType?: FuelType;
  liters?: number;
  amount?: number;
  cashbackAmount?: number;
  status?: TransactionStatus;
  createdAt?: string;
  confirmedAt?: string;
  stationName?: string;
  organizationName?: string;
  pumpPhotoUrl?: string;
}

export interface CreateStationTransactionResponse {
  transaction: StationTransaction;
}

export interface CreateTransactionDraft {
  driverId: string;
  driverName: string;
  driverPhone?: string;
  qrToken: string;
  fuelType?: FuelType;
  liters?: number;
  amount?: number;
}
