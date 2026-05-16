import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type EmptyStateProps = {
  title: string;
  message: string;
  emoji?: string;
};

export function EmptyState({ title, message, emoji }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: typography.titleSm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
