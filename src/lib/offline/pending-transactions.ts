import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreateStationTransactionRequest } from "@/types/transaction";

type RuntimeSnapshot = {
  stationId?: string;
  workSessionId?: string;
};

export type PendingStationTransaction = {
  id: string;
  payload: CreateStationTransactionRequest;
  photoUri?: string;
  runtimeSnapshot?: RuntimeSnapshot;
  createdAt: string;
  status: "PENDING_SYNC" | "FAILED_SYNC";
};

const PENDING_TRANSACTIONS_KEY = "@yely_station/pending_transactions";

const readAll = async (): Promise<PendingStationTransaction[]> => {
  const raw = await AsyncStorage.getItem(PENDING_TRANSACTIONS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PendingStationTransaction[]) : [];
  } catch {
    return [];
  }
};

const writeAll = async (items: PendingStationTransaction[]): Promise<void> => {
  await AsyncStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(items));
};

export const savePendingTransaction = async (item: PendingStationTransaction): Promise<void> => {
  const all = await readAll();
  await writeAll([item, ...all]);
};

export const getPendingTransactions = async (): Promise<PendingStationTransaction[]> => readAll();

export const removePendingTransaction = async (id: string): Promise<void> => {
  const all = await readAll();
  await writeAll(all.filter((item) => item.id !== id));
};

export const clearPendingTransactions = async (): Promise<void> => {
  await AsyncStorage.removeItem(PENDING_TRANSACTIONS_KEY);
};
