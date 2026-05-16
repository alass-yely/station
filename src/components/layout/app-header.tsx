import { ReactNode, memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

function AppHeaderComponent({ title, subtitle, rightSlot }: AppHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightSlot}
    </View>
  );
}

export const AppHeader = memo(AppHeaderComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.bodySm,
    color: colors.textSecondary,
  },
});
