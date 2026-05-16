import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusTone, statusColors, spacing, typography } from '../../theme';

type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
  size?: 'sm' | 'md';
};

function StatusBadgeComponent({ label, tone, size = 'sm' }: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: statusColors[tone].bg, borderColor: statusColors[tone].border },
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'sm' ? styles.labelSm : styles.labelMd,
          { color: statusColors[tone].text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export const StatusBadge = memo(StatusBadgeComponent);

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  label: {
    fontWeight: '600',
  },
  labelSm: {
    fontSize: typography.caption,
  },
  labelMd: {
    fontSize: typography.bodySm,
  },
});
