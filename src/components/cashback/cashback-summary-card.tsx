import { StyleSheet, Text, View } from 'react-native';
import { CashbackSummary } from '../../types/cashback';
import { formatDate, formatMoney } from '../../lib/utils/format';
import { Card } from '../ui/card';
import { colors, spacing, typography } from '../../theme';

type CashbackSummaryCardProps = {
  summary: CashbackSummary;
};

export function CashbackSummaryCard({ summary }: CashbackSummaryCardProps) {
  return (
    <Card title="Resume cashback">
      <View style={styles.grid}>
        <View style={styles.kpi}>
          <Text style={styles.label}>Total gagne</Text>
          <Text style={styles.value}>{formatMoney(summary.totalEarned)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.label}>Disponible</Text>
          <Text style={styles.value}>{formatMoney(summary.availableBalance)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.label}>En attente</Text>
          <Text style={styles.value}>{formatMoney(summary.pendingBalance)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.label}>Entrees</Text>
          <Text style={styles.value}>{summary.totalEntries ?? 0}</Text>
        </View>
      </View>
      <Text style={styles.lastEarned}>Dernier gain: {formatDate(summary.lastEarnedAt)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  kpi: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  value: {
    marginTop: 2,
    fontSize: typography.titleSm,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  lastEarned: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
});
