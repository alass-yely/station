import { ReactElement } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { CashbackEntry } from '../../types/cashback';
import { EmptyState } from '../ui/empty-state';
import { CashbackEntryCard } from './cashback-entry-card';
import { spacing } from '../../theme';

type CashbackListProps = {
  entries: CashbackEntry[];
  refreshing: boolean;
  onRefresh: () => void;
  header?: ReactElement | null;
};

export function CashbackList({ entries, refreshing, onRefresh, header }: CashbackListProps) {
  const renderItem: ListRenderItem<CashbackEntry> = ({ item }) => <CashbackEntryCard entry={item} />;

  return (
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyState
          title="Aucun gain cashback"
          message="Vos gains cashback apparaitront ici apres confirmation des transactions."
          emoji="💸"
        />
      }
      contentContainerStyle={[
        styles.content,
        entries.length === 0 ? styles.emptyContent : null,
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
  },
});
