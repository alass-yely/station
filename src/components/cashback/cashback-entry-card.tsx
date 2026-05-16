import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CashbackEntry } from '../../types/cashback';
import {
  formatCashbackStatus,
  formatDateTime,
  formatMoney,
  getCashbackStatusTone,
} from '../../lib/utils/format';
import { Card } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import { colors, spacing, typography } from '../../theme';

type CashbackEntryCardProps = {
  entry: CashbackEntry;
};

function CashbackEntryCardComponent({ entry }: CashbackEntryCardProps) {
  const tone = getCashbackStatusTone(entry.status);

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={styles.source}>{entry.stationName || entry.source || 'Source inconnue'}</Text>
        <Text style={styles.amount}>{formatMoney(entry.amount)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatDateTime(entry.createdAt)}</Text>
        {entry.status ? (
          <StatusBadge label={formatCashbackStatus(entry.status)} tone={tone} size="sm" />
        ) : null}
      </View>

      {entry.transactionReference ? (
        <Text style={styles.reference}>Ref: {entry.transactionReference}</Text>
      ) : null}
    </Card>
  );
}

export const CashbackEntryCard = memo(CashbackEntryCardComponent);

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  source: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  amount: {
    fontSize: typography.titleSm,
    fontWeight: '800',
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  metaText: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  reference: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
