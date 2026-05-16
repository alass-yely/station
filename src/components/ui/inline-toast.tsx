import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusTone, statusColors, spacing, typography } from '../../theme';

type InlineToastProps = {
  message: string;
  tone?: StatusTone;
  visible: boolean;
};

function InlineToastComponent({ message, tone = 'neutral', visible }: InlineToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.box, { backgroundColor: statusColors[tone].bg, borderColor: statusColors[tone].border }]}>
      <Text style={[styles.text, { color: statusColors[tone].text }]}>{message}</Text>
    </View>
  );
}

export const InlineToast = memo(InlineToastComponent);

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: typography.bodySm,
    fontWeight: '600',
  },
});
