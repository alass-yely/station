import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

type YelyLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  withSubtitle?: boolean;
};

function YelyLogoComponent({ size = 'md', withSubtitle = false }: YelyLogoProps) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require('../../../assets/Dark-version.png')}
        resizeMode="contain"
        style={[styles.logo, sizeStyles[size]]}
      />
      {withSubtitle ? <Text style={styles.subtitle}>Chauffeur</Text> : null}
    </View>
  );
}

export const YelyLogo = memo(YelyLogoComponent);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    gap: 6,
  },
  logo: {
    height: 44,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    width: 100,
    height: 34,
  },
  md: {
    width: 136,
    height: 44,
  },
  lg: {
    width: 170,
    height: 56,
  },
});
