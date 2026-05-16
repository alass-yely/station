import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../src/components/layout/app-header';
import { Screen } from '../../src/components/layout/screen';
import { Card } from '../../src/components/ui/card';
import { DriverQrCard } from '../../src/components/dashboard/driver-qr-card';
import { DashboardStatCard } from '../../src/components/dashboard/dashboard-stat-card';
import { RecentTransactionsList } from '../../src/components/dashboard/recent-transactions-list';
import { FullscreenError } from '../../src/components/ui/fullscreen-error';
import { FullscreenLoading } from '../../src/components/ui/fullscreen-loading';
import {
  getDriverDashboard,
  getDriverQr,
  getDriverReferralSummary,
} from '../../src/lib/api/drivers';
import { useAuth } from '../../src/lib/auth/auth-context';
import { formatMoney } from '../../src/lib/utils/format';
import { DriverDashboardData } from '../../src/types/driver';
import { ReferralSummary } from '../../src/types/referral';
import { ApiError } from '../../src/types/api';
import { colors, spacing, typography } from '../../src/theme';

export default function DashboardPage() {
  const { session, user } = useAuth();
  const [dashboard, setDashboard] = useState<DriverDashboardData | null>(null);
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null);
  const [qrToken, setQrToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (!session?.accessToken) return;

    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError(null);

    try {
      const [dashboardResult, qrResult, referralResult] = await Promise.allSettled([
        getDriverDashboard(session.accessToken),
        getDriverQr(session.accessToken),
        getDriverReferralSummary(session.accessToken),
      ]);

      if (dashboardResult.status === 'fulfilled') {
        const dashboardData = dashboardResult.value;
        setDashboard(dashboardData);
        const tokenFromDashboard = dashboardData.qr?.token || dashboardData.driver?.qrCodeToken;
        setQrToken((prev) => prev || tokenFromDashboard);
      } else {
        throw dashboardResult.reason;
      }

      if (qrResult.status === 'fulfilled' && qrResult.value?.token) {
        setQrToken(qrResult.value.token);
      }

      if (referralResult.status === 'fulfilled') {
        setReferralSummary(referralResult.value);
      } else {
        setReferralSummary(null);
      }
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.message || 'Impossible de charger le dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  const effectiveReferral = referralSummary || dashboard?.referralSummary;
  const recentTransactions = dashboard?.recentTransactions ?? [];

  const cashbackTotal = formatMoney(dashboard?.cashback?.totalEarned);
  const referralBonus = formatMoney(effectiveReferral?.availableBonusAmount);
  const referralsCount = String(effectiveReferral?.totalReferralsCount ?? 0);
  const txCount = String(recentTransactions.length);

  if (isLoading) {
    return <FullscreenLoading message="Chargement du dashboard..." />;
  }

  if (error) {
    return (
      <FullscreenError
        title="Erreur dashboard"
        message={error}
        retryLabel="Reessayer"
        onRetry={() => void loadDashboard(false)}
      />
    );
  }

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadDashboard(true)} />}
    >
      <AppHeader
        title={`Bonjour, ${user?.firstName ?? dashboard?.driver?.firstName ?? 'Chauffeur'}`}
        subtitle={dashboard?.driver?.phone || user?.phone || '-'}
      />

      <DriverQrCard token={qrToken} />

      <View style={styles.statsGrid}>
        <DashboardStatCard label="Cashback total" value={cashbackTotal} />
        <DashboardStatCard label="Bonus disponible" value={referralBonus} />
        <DashboardStatCard label="Filleuls" value={referralsCount} />
        <DashboardStatCard label="Transactions" value={txCount} />
      </View>

      <RecentTransactionsList transactions={recentTransactions} />

      <Card title="Parrainage" subtitle="Le bonus est debloque apres 3 transactions confirmees du filleul.">
        <Text style={styles.metaLine}>Code parrainage: {dashboard?.driver?.referralCode || '-'}</Text>
        <Text style={styles.metaLine}>Filleuls totaux: {referralsCount}</Text>
        <Text style={styles.metaLine}>Bonus disponible: {referralBonus}</Text>
        <Text style={styles.metaLine}>Bonus en attente: {formatMoney(effectiveReferral?.pendingBonusAmount)}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    gap: spacing.sm,
  },
  metaLine: {
    fontSize: typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
