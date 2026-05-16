import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AppHeader } from "@/components/layout/app-header";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { FullscreenError } from "@/components/ui/fullscreen-error";
import { TodaySummaryCard } from "@/components/station/today-summary-card";
import { StationTransactionsList } from "@/components/transactions/station-transactions-list";
import { useAuth } from "@/lib/auth/auth-context";
import { getStationTransactions, getStationTransactionsToday } from "@/lib/api/stations";
import { StationTodaySummary, StationTransactionListItem, StationTransactionsResponse } from "@/types/transaction";
import { colors, typography } from "@/theme";

const PAGE_LIMIT = 20;

const computeSummaryFromItems = (items: StationTransactionListItem[]): StationTodaySummary =>
  items.reduce<StationTodaySummary>(
    (acc, item) => ({
      totalTransactions: acc.totalTransactions + 1,
      totalAmount: acc.totalAmount + (item.amount || 0),
      totalLiters: acc.totalLiters + (item.liters || 0),
      totalCashbackAmount: acc.totalCashbackAmount + (item.cashbackAmount || 0)
    }),
    {
      totalTransactions: 0,
      totalAmount: 0,
      totalLiters: 0,
      totalCashbackAmount: 0
    }
  );

export default function TransactionsPage() {
  const { session } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<StationTransactionListItem[]>([]);
  const [summary, setSummary] = useState<StationTodaySummary | null>(null);
  const [meta, setMeta] = useState<StationTransactionsResponse["meta"]>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    if (typeof meta.hasNextPage === "boolean") return meta.hasNextPage;
    if (meta.page && meta.totalPages) return meta.page < meta.totalPages;
    return false;
  }, [meta]);

  const loadSummary = useCallback(async (): Promise<boolean> => {
    if (!session?.accessToken) return false;

    try {
      const data = await getStationTransactionsToday(session.accessToken, session.user.stationId);
      setSummary(data);
      return true;
    } catch {
      setSummary(null);
      return false;
    }
  }, [session?.accessToken, session?.user.stationId]);

  const loadPage = useCallback(
    async (page: number, mode: "replace" | "append") => {
      if (!session?.accessToken) return;

      const response = await getStationTransactions(
        session.accessToken,
        { page, limit: PAGE_LIMIT },
        session.user.stationId
      );

      setMeta(response.meta);
      setItems((prev) => (mode === "append" ? [...prev, ...response.items] : response.items));

      return response;
    },
    [session?.accessToken, session?.user.stationId]
  );

  const loadInitial = useCallback(async () => {
    if (!session?.accessToken) {
      setError("Session invalide. Reconnectez-vous.");
      setIsInitialLoading(false);
      return;
    }

    setError(null);
    setIsInitialLoading(true);

    try {
      const response = await loadPage(1, "replace");
      const hasServerSummary = await loadSummary();
      if (!hasServerSummary && response?.items) {
        setSummary(computeSummaryFromItems(response.items));
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Impossible de charger les transactions.";
      setError(message || "Impossible de charger les transactions.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [loadPage, loadSummary, session?.accessToken]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await loadPage(1, "replace");
      const hasServerSummary = await loadSummary();
      if (!hasServerSummary && response?.items) {
        setSummary(computeSummaryFromItems(response.items));
      }
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Impossible d'actualiser.";
      setError(message || "Impossible d'actualiser.");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadPage, loadSummary]);

  const onLoadMore = useCallback(async () => {
    if (isLoadingMore || !canLoadMore) return;

    const nextPage = (meta?.page || 1) + 1;
    setIsLoadingMore(true);

    try {
      await loadPage(nextPage, "append");
    } catch (loadMoreError) {
      const message = loadMoreError instanceof Error ? loadMoreError.message : "Impossible de charger plus.";
      setError(message || "Impossible de charger plus.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [canLoadMore, isLoadingMore, loadPage, meta?.page]);

  if (isInitialLoading) {
    return <FullscreenLoading message="Chargement des transactions..." />;
  }

  if (error && items.length === 0) {
    return <FullscreenError message={error} actionLabel="Réessayer" onAction={() => void loadInitial()} />;
  }

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <AppHeader title="Historique" subtitle="Transactions station" />
      </View>

      {summary ? (
        <View style={styles.summaryWrap}>
          <TodaySummaryCard summary={summary} />
        </View>
      ) : null}

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Aucune transaction"
            description="Aucune transaction trouvée pour cette station pour le moment."
          />
          <Link href="/transaction/new" asChild>
            <Button label="Nouvelle transaction" />
          </Link>
        </View>
      ) : (
        <StationTransactionsList
          items={items}
          refreshing={isRefreshing}
          onRefresh={() => void onRefresh()}
          canLoadMore={canLoadMore && !isLoadingMore}
          onLoadMore={() => void onLoadMore()}
          onPressItem={(item) => router.push(`/transaction/${item.id}` as never)}
        />
      )}

      {error && items.length > 0 ? <Text style={styles.inlineError}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  summaryWrap: {
    paddingHorizontal: 16,
    paddingTop: 8
  },
  emptyWrap: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  inlineError: {
    color: colors.danger,
    fontSize: typography.caption,
    paddingHorizontal: 16,
    paddingBottom: 8
  }
});
