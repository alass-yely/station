import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReferralItem } from '../../types/referral';
import {
  formatDate,
  formatMoney,
  formatProgress,
  formatReferralBonusStatus,
  getReferralBonusStatusTone,
} from '../../lib/utils/format';
import { Card } from '../ui/card';
import { StatusBadge } from '../ui/status-badge';
import { colors, spacing, typography } from '../../theme';

type ReferralItemCardProps = {
  item: ReferralItem;
};

function ReferralItemCardComponent({ item }: ReferralItemCardProps) {
  const tone = getReferralBonusStatusTone(item.bonusStatus);
  const fullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || 'Filleul';

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={styles.name}>{fullName}</Text>
        <StatusBadge label={formatReferralBonusStatus(item.bonusStatus)} tone={tone} size="sm" />
      </View>

      <Text style={styles.meta}>{item.phone || '-'}</Text>
      <Text style={styles.meta}>{formatProgress(item.confirmedTransactionsCount)}</Text>
      <Text style={styles.meta}>Bonus: {formatMoney(item.bonusAmount)}</Text>
      <Text style={styles.meta}>Invite le: {formatDate(item.affiliatedAt || item.createdAt)}</Text>
    </Card>
  );
}

export const ReferralItemCard = memo(ReferralItemCardComponent);

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
