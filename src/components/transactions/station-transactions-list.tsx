import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { StationTransactionListItem } from "@/types/transaction";
import { StationTransactionCard } from "./station-transaction-card";
import { Button } from "@/components/ui/button";
import { spacing } from "@/theme";

type Props = {
  items: StationTransactionListItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  onPressItem: (item: StationTransactionListItem) => void;
};

export const StationTransactionsList = ({
  items,
  refreshing,
  onRefresh,
  onLoadMore,
  canLoadMore,
  onPressItem
}: Props) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <StationTransactionCard item={item} onPress={() => onPressItem(item)} />}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListFooterComponent={
        canLoadMore && onLoadMore ? (
          <View style={styles.footer}>
            <Button label="Charger plus" onPress={onLoadMore} variant="secondary" />
          </View>
        ) : null
      }
      initialNumToRender={8}
      windowSize={7}
      maxToRenderPerBatch={8}
      removeClippedSubviews
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl
  },
  footer: {
    marginTop: spacing.sm
  }
});
