import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { colors, spacing, typography } from '../../theme';

type ReferralCodeCardProps = {
  code?: string;
  onCopy: () => void;
  onShare: () => void;
  copied?: boolean;
};

export function ReferralCodeCard({ code, onCopy, onShare, copied = false }: ReferralCodeCardProps) {
  return (
    <Card title="Votre code parrainage" subtitle="Partagez-le avec des chauffeurs pour gagner des bonus.">
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{code || '-'}</Text>
      </View>
      {copied ? <Text style={styles.copied}>Code copie</Text> : null}
      <View style={styles.actions}>
        <Button label="Copier" onPress={onCopy} />
        <Button label="Partager" variant="secondary" onPress={onShare} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  codeBox: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 30,
    letterSpacing: 1,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  copied: {
    fontSize: typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
  },
});
