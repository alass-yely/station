import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { AppHeader } from '../../src/components/layout/app-header';
import { ReferralCodeCard } from '../../src/components/referrals/referral-code-card';
import { ReferralSummaryCard } from '../../src/components/referrals/referral-summary-card';
import { ReferralsList } from '../../src/components/referrals/referrals-list';
import { Button } from '../../src/components/ui/button';
import { FullscreenError } from '../../src/components/ui/fullscreen-error';
import { FullscreenLoading } from '../../src/components/ui/fullscreen-loading';
import { InlineToast } from '../../src/components/ui/inline-toast';
import { getDriverDashboard, getDriverReferralSummary } from '../../src/lib/api/drivers';
import { useAuth } from '../../src/lib/auth/auth-context';
import { ApiError } from '../../src/types/api';
import { DriverDashboardData } from '../../src/types/driver';
import { ReferralSummary } from '../../src/types/referral';
import { colors, spacing, typography } from '../../src/theme';

export default function ReferralsPage() {
  const { session, user } = useAuth();

  const [summary, setSummary] = useState<ReferralSummary>({});
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'warning' | 'danger' | 'neutral'; visible: boolean }>({
    message: '',
    tone: 'neutral',
    visible: false,
  });
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!session?.accessToken) return;

    if (mode === 'initial') setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);
    setError(null);

    try {
      const [summaryResult, dashboardResult] = await Promise.allSettled([
        getDriverReferralSummary(session.accessToken),
        getDriverDashboard(session.accessToken),
      ]);

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        throw summaryResult.reason;
      }

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value);
      }
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.message || 'Impossible de charger le reseau.');
    } finally {
      if (mode === 'initial') setIsLoading(false);
      if (mode === 'refresh') setIsRefreshing(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void loadData('initial');
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const referralCode =
    summary.referralCode ||
    dashboard?.driver?.referralCode ||
    user?.id?.slice(0, 6)?.toUpperCase();

  const referrals = summary.referrals ?? [];
  const hasSummaryOnly = referrals.length === 0 && (summary.totalReferralsCount ?? 0) > 0;

  const showToast = useCallback((message: string, tone: 'success' | 'warning' | 'danger' | 'neutral') => {
    setToast({ message, tone, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!referralCode) {
      showToast('Code parrainage indisponible.', 'warning');
      return;
    }

    await Clipboard.setStringAsync(referralCode);
    setCopied(true);

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1800);

    showToast('Code copie', 'success');
  }, [referralCode, showToast]);

  const handleShare = useCallback(async () => {
    if (!referralCode) {
      showToast('Code parrainage indisponible.', 'warning');
      return;
    }

    await Share.share({
      message: `Rejoins YELY avec mon code parrainage: ${referralCode}`,
    });
  }, [referralCode, showToast]);

  const header = useMemo(
    () => (
      <View style={styles.headerWrap}>
        <AppHeader title="Reseau" subtitle="Invitez des chauffeurs et suivez vos bonus." />

        <ReferralCodeCard
          code={referralCode}
          onCopy={() => void handleCopy()}
          onShare={() => void handleShare()}
          copied={copied}
        />

        <ReferralSummaryCard summary={summary} />

        <View style={styles.ruleBox}>
          <Text style={styles.ruleText}>
            Le bonus de 500 FCFA est debloque apres 3 transactions confirmees du filleul.
          </Text>
        </View>
      </View>
    ),
    [copied, handleCopy, handleShare, referralCode, summary],
  );

  if (isLoading) {
    return <FullscreenLoading message="Chargement du reseau..." />;
  }

  if (error && referrals.length === 0) {
    return (
      <FullscreenError
        title="Erreur"
        message={error}
        retryLabel="Reessayer"
        onRetry={() => void loadData('initial')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.topToast}>
        <InlineToast message={toast.message} tone={toast.tone} visible={toast.visible} />
        <InlineToast message={error ?? ''} tone="danger" visible={Boolean(error && referrals.length > 0)} />
      </View>

      <ReferralsList
        items={referrals}
        refreshing={isRefreshing}
        onRefresh={() => void loadData('refresh')}
        header={header}
        emptyMessage={
          hasSummaryOnly
            ? 'Le resume est disponible. Le detail des filleuls sera ajoute bientot.'
            : undefined
        }
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
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ruleBox: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
  },
  ruleText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  topToast: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
});
