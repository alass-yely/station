import { FuelType, StationTransactionListItem, TransactionStatus } from "@/types/transaction";

export const formatMoney = (amount: number, currency = "XOF"): string => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${new Intl.NumberFormat("fr-FR").format(safeAmount)} ${currency}`;
};

export const formatLiters = (liters: number): string => {
  const safeLiters = Number.isFinite(liters) ? liters : 0;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(safeLiters)} L`;
};

export const parseDecimalInput = (value: string): number => {
  const normalized = value.replace(/\s+/g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const parseMoneyInput = (value: string): number => {
  const normalized = value.replace(/\s+/g, "").replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : NaN;
};

export const formatDateTime = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
};

export const formatFuelType = (fuelType: FuelType): string => {
  const normalized = String(fuelType).toUpperCase();
  if (normalized === "DIESEL") return "Diesel";
  if (normalized === "SUPER" || normalized === "ESSENCE" || normalized === "GASOLINE") {
    return "Essence";
  }
  return String(fuelType);
};

export const formatTransactionStatus = (status: TransactionStatus): string => {
  const normalized = String(status).toUpperCase();

  switch (normalized) {
    case "APPROVED":
    case "CONFIRMED":
      return "Confirmée";
    case "PENDING":
    case "DRAFT":
      return "En attente";
    case "REJECTED":
      return "Rejetée";
    case "CANCELLED":
      return "Annulée";
    default:
      return String(status);
  }
};

export const getTransactionStatusTone = (
  status?: TransactionStatus
): "pending" | "approved" | "rejected" | "cancelled" => {
  const normalized = String(status || "pending").toUpperCase();

  if (normalized === "APPROVED" || normalized === "CONFIRMED") return "approved";
  if (normalized === "REJECTED") return "rejected";
  if (normalized === "CANCELLED") return "cancelled";
  return "pending";
};

export const getDriverDisplayName = (item: StationTransactionListItem): string => {
  if (item.driverName) return item.driverName;

  const firstName = item.driver?.firstName || "";
  const lastName = item.driver?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Chauffeur inconnu";
};
