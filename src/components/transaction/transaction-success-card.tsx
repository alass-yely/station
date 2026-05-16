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
      <Text style={styles.title}>Transaction créée</Text>
      <View style={styles.row}>
        <Text style={styles.info}>Référence: {transaction.reference || transaction.id}</Text>
        <StatusBadge
          label={formatTransactionStatus(transaction.status || "pending")}
          status={getTransactionStatusTone(transaction.status)}
        />
      </View>
      <Text style={styles.info}>Chauffeur: {driverName}</Text>
      <Text style={styles.info}>Montant: {formatMoney(transaction.amount || 0, "FCFA")}</Text>
      <Text style={styles.info}>Litres: {formatLiters(transaction.liters || 0)}</Text>
      <Text style={styles.info}>Carburant: {formatFuelType(transaction.fuelType || "-")}</Text>
      {transaction.createdAt ? <Text style={styles.info}>Créée le: {formatDateTime(transaction.createdAt)}</Text> : null}
      {typeof transaction.cashbackAmount === "number" ? (
        <Text style={styles.info}>Cashback: {formatMoney(transaction.cashbackAmount, "FCFA")}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button label="Voir détail" onPress={onViewDetails} />
        <Button label="Scanner suivant" onPress={onScannerNext} variant="secondary" />
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
  }
});
