import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { formatLiters, formatMoney } from "@/lib/utils/format";
import { StationTodaySummary } from "@/types/transaction";
import { colors, spacing, typography } from "@/theme";

export const TodaySummaryCard = ({ summary }: { summary: StationTodaySummary }) => {
  return (
    <Card>
      <Text style={styles.title}>Transactions du jour</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{summary.totalTransactions}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Montant total</Text>
        <Text style={styles.value}>{formatMoney(summary.totalAmount, "FCFA")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Litres vendus</Text>
        <Text style={styles.value}>{formatLiters(summary.totalLiters)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Cashback</Text>
        <Text style={styles.value}>{formatMoney(summary.totalCashbackAmount, "FCFA")}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700"
  }
});
