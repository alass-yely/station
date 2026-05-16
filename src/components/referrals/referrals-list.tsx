import { ReactElement } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ReferralItem } from '../../types/referral';
import { EmptyState } from '../ui/empty-state';
import { ReferralItemCard } from './referral-item-card';
import { spacing } from '../../theme';

type ReferralsListProps = {
  items: ReferralItem[];
  refreshing: boolean;
  onRefresh: () => void;
  header?: ReactElement | null;
  emptyMessage?: string;
};

export function ReferralsList({
  items,
  refreshing,
  onRefresh,
  header,
  emptyMessage,
}: ReferralsListProps) {
  const renderItem: ListRenderItem<ReferralItem> = ({ item }) => <ReferralItemCard item={item} />;

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id || item.driverId || `${item.phone ?? 'ref'}-${index}`}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Aucun filleul detaille"
            message={
              emptyMessage ||
              "Le resume est disponible. Le detail des filleuls sera ajoute bientot."
            }
          />
        </View>
      }
      contentContainerStyle={[styles.content, items.length === 0 ? styles.emptyContent : null]}
      removeClippedSubviews
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
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
  emptyWrap: {
    marginTop: spacing.sm,
  },
});
