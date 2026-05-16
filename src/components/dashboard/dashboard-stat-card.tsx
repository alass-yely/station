import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card } from '../ui/card';
import { colors, spacing, typography } from '../../theme';

type DashboardStatCardProps = {
  label: string;
  value: string;
};

function DashboardStatCardComponent({ label, value }: DashboardStatCardProps) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
}

export const DashboardStatCard = memo(DashboardStatCardComponent);

const styles = StyleSheet.create({
  label: {
    fontSize: typography.bodySm,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
