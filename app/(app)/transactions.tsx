import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../src/components/layout/app-header';
import { TransactionsList } from '../../src/components/transactions/transactions-list';
import { Button } from '../../src/components/ui/button';
import { FullscreenError } from '../../src/components/ui/fullscreen-error';
import { FullscreenLoading } from '../../src/components/ui/fullscreen-loading';
import { InlineToast } from '../../src/components/ui/inline-toast';
import { getDriverTransactions } from '../../src/lib/api/drivers';
import { useAuth } from '../../src/lib/auth/auth-context';
import {
  DriverTransaction,
  DriverTransactionsResponse,
  PaginationMeta,
} from '../../src/types/transaction';
import { ApiError } from '../../src/types/api';
import { colors, spacing } from '../../src/theme';

const PAGE_LIMIT = 20;

function hasNextPage(meta: PaginationMeta | undefined): boolean {
  if (!meta) return false;
  if (typeof meta.hasNextPage === 'boolean') return meta.hasNextPage;
  if (typeof meta.page === 'number' && typeof meta.totalPages === 'number') {
    return meta.page < meta.totalPages;
  }
  if (typeof meta.page === 'number' && typeof meta.limit === 'number' && typeof meta.total === 'number') {
    return meta.page * meta.limit < meta.total;
  }
  return false;
}

export default function TransactionsPage() {
  const { session } = useAuth();

  const [transactions, setTransactions] = useState<DriverTransaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canLoadMore = useMemo(() => hasNextPage(meta), [meta]);

  const loadTransactions = useCallback(async (page: number, mode: 'initial' | 'refresh' | 'more') => {
    if (!session?.accessToken) return;

    if (mode === 'initial') setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);
    if (mode === 'more') setIsLoadingMore(true);
    if (mode !== 'more') setError(null);

    try {
      const response: DriverTransactionsResponse = await getDriverTransactions(session.accessToken, {
        page,
        limit: PAGE_LIMIT,
      });

      setMeta(response.meta);
      setTransactions((prev) => (mode === 'more' ? [...prev, ...response.items] : response.items));
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.message || "Impossible de charger l'historique.");
    } finally {
      if (mode === 'initial') setIsLoading(false);
      if (mode === 'refresh') setIsRefreshing(false);
      if (mode === 'more') setIsLoadingMore(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void loadTransactions(1, 'initial');
  }, [loadTransactions]);

  const handleRefresh = useCallback(() => {
    void loadTransactions(1, 'refresh');
  }, [loadTransactions]);

  const handleLoadMore = useCallback(() => {
    if (!canLoadMore || isLoadingMore) return;
    const nextPage = (meta?.page ?? 1) + 1;
    void loadTransactions(nextPage, 'more');
  }, [canLoadMore, isLoadingMore, loadTransactions, meta?.page]);

  if (isLoading) {
    return <FullscreenLoading message="Chargement de l'historique..." />;
  }

  if (error && transactions.length === 0) {
    return (
      <FullscreenError
        title="Erreur"
        message={error}
        retryLabel="Reessayer"
        onRetry={() => void loadTransactions(1, 'initial')}
      />
    );
  }

  const footer = canLoadMore ? (
    <View style={styles.footer}>
      <Button
        label={isLoadingMore ? 'Chargement...' : 'Charger plus'}
        onPress={handleLoadMore}
        disabled={isLoadingMore}
      />
    </View>
  ) : (
    <View style={styles.footerSpacing} />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerWrap}>
        <AppHeader title="Historique" subtitle="Retrouvez toutes vos transactions recentes." />
        <InlineToast message={error ?? ''} tone="danger" visible={Boolean(error && transactions.length > 0)} />
      </View>
      <TransactionsList
        transactions={transactions}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        footer={footer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  footerSpacing: {
    height: spacing.lg,
  },
});
