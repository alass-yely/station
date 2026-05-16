import { ReactElement } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { DriverTransaction } from '../../types/transaction';
import { EmptyState } from '../ui/empty-state';
import { TransactionCard } from './transaction-card';
import { spacing } from '../../theme';

type TransactionsListProps = {
  transactions: DriverTransaction[];
  refreshing: boolean;
  onRefresh: () => void;
  footer?: ReactElement | null;
};

export function TransactionsList({
  transactions,
  refreshing,
  onRefresh,
  footer,
}: TransactionsListProps) {
  const renderItem: ListRenderItem<DriverTransaction> = ({ item }) => (
    <TransactionCard transaction={item} />
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={
        <EmptyState
          title="Aucune transaction"
          message="Vos transactions apparaitront ici apres validation en station."
          emoji="🧾"
        />
      }
      ListFooterComponent={footer}
      contentContainerStyle={[
        styles.content,
        transactions.length === 0 ? styles.emptyContent : null,
      ]}
      removeClippedSubviews
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.tabBarOffset,
    gap: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
