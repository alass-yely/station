import { StyleSheet, Text, View } from 'react-native';
import { RecentTransaction } from '../../types/transaction';
import { formatDate, formatLiters, formatMoney } from '../../lib/utils/format';
import { Card } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { colors, spacing, typography } from '../../theme';

type RecentTransactionsListProps = {
  transactions: RecentTransaction[];
};

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  if (!transactions.length) {
    return (
      <Card title="Dernieres transactions">
        <EmptyState
          title="Aucune transaction recente"
          message="Vos prochaines transactions confirmees apparaitront ici."
        />
      </Card>
    );
  }

  return (
    <Card title="Dernieres transactions">
      <View style={styles.list}>
        {transactions.slice(0, 5).map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.rowTop}>
              <Text style={styles.station}>{item.stationName || 'Station inconnue'}</Text>
              <Text style={styles.amount}>{formatMoney(item.amount)}</Text>
            </View>
            <Text style={styles.meta}>
              {formatLiters(item.liters)} | Cashback: {formatMoney(item.cashbackAmount)}
            </Text>
            <Text style={styles.meta}>{formatDate(item.confirmedAt || item.createdAt)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  station: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  amount: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  meta: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
