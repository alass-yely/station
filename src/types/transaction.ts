export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'confirmed' | string;

export type PaginationMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
};

export type DriverTransactionsQuery = {
  page?: number;
  limit?: number;
};

export type DriverTransaction = {
  id: string;
  reference?: string;
  stationName?: string;
  station?: {
    id?: string;
    name?: string;
  };
  organizationName?: string;
  organization?: {
    id?: string;
    name?: string;
  };
  fuelType?: string;
  liters?: number | string;
  amount?: number | string;
  cashbackAmount?: number | string;
  status?: TransactionStatus;
  confirmedAt?: string;
  createdAt?: string;
};

export type DriverTransactionsResponse = {
  items: DriverTransaction[];
  meta?: PaginationMeta;
};

export type RecentTransaction = DriverTransaction;
