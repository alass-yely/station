import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatDateTime,
  formatFuelType,
  formatLiters,
  formatMoney,
  formatTransactionStatus,
  getTransactionStatusTone
} from "@/lib/utils/format";
import { StationTransaction } from "@/types/transaction";
import { colors, spacing, typography } from "@/theme";

type Props = {
  transaction: StationTransaction;
  driverName: string;
  onNewTransaction: () => void;
  onScannerNext: () => void;
  onGoHistory: () => void;
  onViewDetails: () => void;
};

export const TransactionSuccessCard = ({
  transaction,
  driverName,
  onNewTransaction,
  onScannerNext,
  onGoHistory,
  onViewDetails
}: Props) => {
  return (
    <Card>
      <Text style={styles.title}>Transaction validée</Text>
      <View style={styles.row}>
        <Text style={styles.reference}>Référence: {transaction.reference || transaction.id}</Text>
        <StatusBadge
          label={formatTransactionStatus(transaction.status || "pending")}
          status={getTransactionStatusTone(transaction.status)}
        />
      </View>
      <Text style={styles.info}>Chauffeur: {driverName}</Text>
      <Text style={styles.info}>Montant: {formatMoney(transaction.amount || 0, "FCFA")}</Text>
      <Text style={styles.info}>Litres: {formatLiters(transaction.liters || 0)}</Text>
      <Text style={styles.info}>Carburant: {formatFuelType(transaction.fuelType || "-")}</Text>
      {transaction.stationName ? <Text style={styles.info}>Station: {transaction.stationName}</Text> : null}
      {transaction.pumpName || transaction.pumpCode ? (
        <Text style={styles.info}>
          Pompe: {[transaction.pumpName, transaction.pumpCode].filter(Boolean).join(" - ")}
        </Text>
      ) : null}
      {transaction.workSessionId ? <Text style={styles.info}>Session: {transaction.workSessionId}</Text> : null}
      {transaction.cashierName ? <Text style={styles.info}>Pompiste: {transaction.cashierName}</Text> : null}
      {transaction.createdAt ? <Text style={styles.info}>Créée le: {formatDateTime(transaction.createdAt)}</Text> : null}
      {typeof transaction.cashbackAmount === "number" ? (
        <View style={styles.cashbackWrap}>
          <Text style={styles.cashbackLabel}>Cashback</Text>
          <Text style={styles.cashbackValue}>{formatMoney(transaction.cashbackAmount, "FCFA")}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Voir détail" onPress={onViewDetails} />
        <Button label="Scanner un autre chauffeur" onPress={onScannerNext} variant="secondary" />
        <Button label="Voir historique" onPress={onGoHistory} variant="secondary" />
        <Button label="Nouvelle transaction" onPress={onNewTransaction} variant="secondary" />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.success,
    fontSize: typography.subtitle,
    fontWeight: "800"
  },
  reference: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  info: {
    color: colors.text,
    fontSize: typography.body
  },
  actions: {
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  cashbackWrap: {
    marginTop: spacing.xs,
    backgroundColor: `${colors.success}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.success}33`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  cashbackLabel: {
    color: colors.textMuted,
    fontSize: typography.caption
  },
  cashbackValue: {
    color: colors.success,
    fontSize: typography.subtitle,
    fontWeight: "800"
  }
});
