import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Card } from '../ui/card';
import { EmptyState } from '../ui/empty-state';
import { colors, spacing, typography } from '../../theme';

type DriverQrCardProps = {
  token?: string;
};

function DriverQrCardComponent({ token }: DriverQrCardProps) {
  return (
    <Card title="Mon QR Code" subtitle="Presentez ce QR code au caissier en station.">
      {!token ? (
        <EmptyState title="QR indisponible" message="Votre QR code chauffeur n'est pas encore disponible." emoji="□" />
      ) : (
        <View style={styles.qrWrapper}>
          <QRCode value={token} size={210} backgroundColor="#FFFFFF" color="#000000" />
          <Text style={styles.hint}>QR chauffeur actif</Text>
        </View>
      )}
    </Card>
  );
}

export const DriverQrCard = memo(DriverQrCardComponent);

const styles = StyleSheet.create({
  qrWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },
});
