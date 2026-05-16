import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../ui/card';
import { formatMoney } from '../../lib/utils/format';
import { ReferralSummary } from '../../types/referral';
import { colors, spacing, typography } from '../../theme';

type ReferralSummaryCardProps = {
  summary: ReferralSummary;
};

export function ReferralSummaryCard({ summary }: ReferralSummaryCardProps) {
  const inProgress =
    summary.pendingReferralsCount ??
    Math.max((summary.totalReferralsCount ?? 0) - (summary.eligibleReferralsCount ?? 0), 0);

  return (
    <Card title="Resume bonus">
      <View style={styles.grid}>
        <View style={styles.kpi}>
          <Text style={styles.label}>Bonus disponible</Text>
          <Text style={styles.value}>{formatMoney(summary.availableBonusAmount)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.label}>Bonus en attente</Text>
          <Text style={styles.value}>{formatMoney(summary.pendingBonusAmount)}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.label}>Filleuls eligibles</Text>
          <Text style={styles.value}>{summary.eligibleReferralsCount ?? 0}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.label}>En progression</Text>
          <Text style={styles.value}>{inProgress}</Text>
        </View>
      </View>
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
});
