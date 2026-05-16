import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDateTime,
  formatFuelType,
  formatLiters,
  formatMoney,
  formatTransactionStatus,
  getDriverDisplayName,
  getTransactionStatusTone
} from "@/lib/utils/format";
import { StationTransactionListItem } from "@/types/transaction";
import { colors, spacing, typography } from "@/theme";

export const StationTransactionCard = ({
  item,
  onPress
}: {
  item: StationTransactionListItem;
  onPress?: () => void;
}) => {
  const createdAt = item.createdAt || item.confirmedAt || "";
  const driverName = getDriverDisplayName(item);
  const driverPhone = item.driverPhone || item.driver?.phone || "-";

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.head}>
          <Text style={styles.amount}>{formatMoney(item.amount || 0, "FCFA")}</Text>
          <StatusBadge
            label={formatTransactionStatus(item.status || "pending")}
            status={getTransactionStatusTone(item.status)}
          />
        </View>

        <Text style={styles.driver}>{driverName}</Text>
        <Text style={styles.meta}>Téléphone: {driverPhone}</Text>
        <Text style={styles.meta}>Carburant: {formatFuelType(item.fuelType || "-")}</Text>
        <Text style={styles.meta}>Litres: {formatLiters(item.liters || 0)}</Text>
        <Text style={styles.meta}>Cashback: {formatMoney(item.cashbackAmount || 0, "FCFA")}</Text>
        <Text style={styles.date}>{createdAt ? formatDateTime(createdAt) : "Date inconnue"}</Text>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  amount: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "800"
  },
  driver: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  date: {
    color: colors.info,
    fontSize: typography.caption,
    fontWeight: "600"
  }
});
