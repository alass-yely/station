import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DriverTransaction } from '../../types/transaction';
import {
  formatDateTime,
  formatFuelType,
  formatLiters,
  formatMoney,
  formatTransactionStatus,
  getTransactionStationName,
  getTransactionStatusTone,
} from '../../lib/utils/format';
import { Card } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import { colors, spacing, typography } from '../../theme';

type TransactionCardProps = {
  transaction: DriverTransaction;
};

function TransactionCardComponent({ transaction }: TransactionCardProps) {
  const stationName = getTransactionStationName(transaction);
  const tone = getTransactionStatusTone(transaction.status);

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={styles.station}>{stationName}</Text>
        <Text style={styles.amount}>{formatMoney(transaction.amount)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatDateTime(transaction.confirmedAt || transaction.createdAt)}</Text>
        <StatusBadge label={formatTransactionStatus(transaction.status)} tone={tone} size="sm" />
      </View>

      <Text style={styles.details}>
        {formatLiters(transaction.liters)} | {formatFuelType(transaction.fuelType)}
      </Text>
      <Text style={styles.cashback}>Cashback: {formatMoney(transaction.cashbackAmount)}</Text>
    </Card>
  );
}

export const TransactionCard = memo(TransactionCardComponent);

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  station: {
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
  details: {
    marginTop: spacing.xs,
    fontSize: typography.bodySm,
    color: colors.textSecondary,
  },
  cashback: {
    marginTop: 2,
    fontSize: typography.bodySm,
    color: colors.success,
    fontWeight: '600',
  },
});
