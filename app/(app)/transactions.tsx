import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ApiError } from "@/lib/api/client";
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
import { getMyCashierTransactions } from "@/lib/api/cashiers";
import { getStationTransactions, getStationTransactionsToday } from "@/lib/api/stations";
import { StationTodaySummary, StationTransactionListItem, StationTransactionsResponse } from "@/types/transaction";
import { colors, spacing } from "@/theme";

const PAGE_LIMIT = 20;

const computeSummaryFromItems = (items: StationTransactionListItem[]): StationTodaySummary =>
  items.reduce<StationTodaySummary>(
    (acc, item) => ({
      totalTransactions: acc.totalTransactions + 1,
      totalAmount: acc.totalAmount + (item.amount || 0),
      totalLiters: acc.totalLiters + (item.liters || 0),
      totalCashbackAmount: acc.totalCashbackAmount + (item.cashbackAmount || 0)
    }),
    { totalTransactions: 0, totalAmount: 0, totalLiters: 0, totalCashbackAmount: 0 }
  );

export default function TransactionsPage() {
  const { session, user } = useAuth();
  const router = useRouter();
  const role = String(user?.role || "").toUpperCase();
  const isCashier = role === "CASHIER";

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
    if (isCashier) {
      setSummary(null);
      return false;
    }
    if (!session?.accessToken) return false;

    try {
      const data = await getStationTransactionsToday(session.accessToken, session.user.stationId);
      setSummary(data);
      return true;
    } catch {
      setSummary(null);
      return false;
    }
  }, [isCashier, session?.accessToken, session?.user.stationId]);

  const loadPage = useCallback(
    async (page: number, mode: "replace" | "append") => {
      if (!session?.accessToken) return;

      const params = { page, limit: PAGE_LIMIT };
      const response = isCashier
        ? await getMyCashierTransactions(session.accessToken, params)
        : await getStationTransactions(session.accessToken, params, session.user.stationId);

      const normalizedItems = response.items.map((item) => {
        const driverName =
          "driverName" in item && typeof item.driverName === "string"
            ? item.driverName
            : `${item.driver?.firstName || ""} ${item.driver?.lastName || ""}`.trim() || undefined;
        const driverPhone =
          "driverPhone" in item && typeof item.driverPhone === "string" ? item.driverPhone : item.driver?.phone;

        return {
          id: item.id,
          reference: item.reference,
          driverName,
          driverPhone,
          driver: item.driver,
          fuelType: item.fuelType,
          liters: item.liters,
          amount: item.amount,
          cashbackAmount: item.cashbackAmount,
          status: item.status,
          createdAt: item.createdAt,
          confirmedAt: item.confirmedAt,
          pump: item.pump,
          workSession: item.workSession
        };
      });

      setMeta(response.meta);
      setItems((prev) => (mode === "append" ? [...prev, ...normalizedItems] : normalizedItems));

      return { ...response, items: normalizedItems };
    },
    [isCashier, session?.accessToken, session?.user.stationId]
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
      if (!isCashier && !hasServerSummary && response?.items) {
        setSummary(computeSummaryFromItems(response.items));
      }
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 403) {
        setError("Vous n’avez pas accès à cet historique.");
        return;
      }
      const message = loadError instanceof Error ? loadError.message : "Impossible de charger les transactions.";
      setError(message || "Impossible de charger les transactions.");
    } finally {
      setIsInitialLoading(false);
    }
  }, [isCashier, loadPage, loadSummary, session?.accessToken]);

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
      if (!isCashier && !hasServerSummary && response?.items) {
        setSummary(computeSummaryFromItems(response.items));
      }
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 403) {
        setError("Vous n’avez pas accès à cet historique.");
        return;
      }
      const message = refreshError instanceof Error ? refreshError.message : "Impossible d'actualiser l'historique.";
      setError(message || "Impossible d'actualiser.");
    } finally {
      setIsRefreshing(false);
    }
  }, [isCashier, isRefreshing, loadPage, loadSummary]);

  const onLoadMore = useCallback(async () => {
    if (isLoadingMore || !canLoadMore) return;

    const nextPage = (meta?.page || 1) + 1;
    setIsLoadingMore(true);

    try {
      await loadPage(nextPage, "append");
    } catch (loadMoreError) {
      const message = loadMoreError instanceof Error ? loadMoreError.message : "Impossible de charger les éléments suivants.";
      setError(message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [canLoadMore, isLoadingMore, loadPage, meta?.page]);

  // Rendu de l'en-tête global de la liste (Évite les conflits de scroll)
  const renderListHeader = useMemo(() => {
    return (
      <View style={styles.headerComponentContainer}>
        <AppHeader 
          title="Historique" 
          subtitle={isCashier ? "Mes distributions de carburant" : "Activité globale de la station"} 
        />
        {summary && !isCashier && (
          <View style={styles.summaryContainer}>
            <TodaySummaryCard summary={summary} />
          </View>
        )}
      </View>
    );
  }, [isCashier, summary]);

  if (isInitialLoading) {
    return <FullscreenLoading message="Chargement de l'historique..." />;
  }

  if (error && items.length === 0) {
    return <FullscreenError message={error} actionLabel="Actualiser" onAction={() => void loadInitial()} />;
  }

  return (
    // Note l'utilisation de scrollable={false} pour laisser la FlatList interne tout gérer de manière performante
    <Screen scrollable={false} style={styles.root}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          {renderListHeader}
          <View style={styles.emptyContent}>
            <EmptyState
              title="Aucune opération"
              description={
                isCashier
                  ? "Vous n'avez pas encore enregistré de transaction aujourd'hui."
                  : "Aucune transaction n'a été détectée pour cette station aujourd'hui."
              }
            />
            {!isCashier && (
              <Link href="/transaction/new" asChild>
                <Button label="Nouvelle transaction" variant="primary" />
              </Link>
            )}
          </View>
        </View>
      ) : (
        <StationTransactionsList
          items={items}
          refreshing={isRefreshing}
          onRefresh={() => void onRefresh()}
          canLoadMore={canLoadMore && !isLoadingMore}
          onLoadMore={() => void onLoadMore()}
          onPressItem={(item) => router.push(`/transaction/${item.id}` as never)}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContent}
        />
      )}

      {error && items.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.inlineErrorText}>{error}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Fond gris ardoise ultra-léger Fintech
  },
  headerComponentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: "#F8FAFC",
  },
  summaryContainer: {
    marginTop: spacing.md,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorBanner: {
    position: "absolute",
    bottom: 20,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: "#FEE2E2",
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  inlineErrorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  }
});