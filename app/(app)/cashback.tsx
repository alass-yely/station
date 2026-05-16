import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../src/components/layout/app-header';
import { CashbackList } from '../../src/components/cashback/cashback-list';
import { CashbackSummaryCard } from '../../src/components/cashback/cashback-summary-card';
import { Button } from '../../src/components/ui/button';
import { FullscreenError } from '../../src/components/ui/fullscreen-error';
import { FullscreenLoading } from '../../src/components/ui/fullscreen-loading';
import { InlineToast } from '../../src/components/ui/inline-toast';
import { getDriverCashback } from '../../src/lib/api/drivers';
import { useAuth } from '../../src/lib/auth/auth-context';
import { ApiError } from '../../src/types/api';
import { CashbackEntry, CashbackSummary, DriverCashbackResponse } from '../../src/types/cashback';
import { colors, spacing, typography } from '../../src/theme';

export default function CashbackPage() {
  const { session } = useAuth();

  const [summary, setSummary] = useState<CashbackSummary>({});
  const [entries, setEntries] = useState<CashbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCashback = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!session?.accessToken) return;

    if (mode === 'initial') setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);
    setError(null);

    try {
      const response: DriverCashbackResponse = await getDriverCashback(session.accessToken);
      setSummary(response.summary);
      setEntries(response.entries);
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.message || 'Impossible de charger le cashback.');
    } finally {
      if (mode === 'initial') setIsLoading(false);
      if (mode === 'refresh') setIsRefreshing(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void loadCashback('initial');
  }, [loadCashback]);

  const header = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <AppHeader title="Cashback" subtitle="Suivez vos gains carburant." />
        <CashbackSummaryCard summary={summary} />
        <Text style={styles.note}>
          Le cashback est calcule uniquement sur les transactions confirmees.
        </Text>
      </View>
    ),
    [summary],
  );

  if (isLoading) {
    return <FullscreenLoading message="Chargement du cashback..." />;
  }

  if (error && entries.length === 0) {
    return (
      <FullscreenError
        title="Erreur"
        message={error}
        retryLabel="Reessayer"
        onRetry={() => void loadCashback('initial')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topToast}>
        <InlineToast message={error ?? ''} tone="danger" visible={Boolean(error && entries.length > 0)} />
      </View>
      <CashbackList
        entries={entries}
        refreshing={isRefreshing}
        onRefresh={() => void loadCashback('refresh')}
        header={header}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  note: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  topToast: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
