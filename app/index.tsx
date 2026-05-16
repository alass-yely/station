import { Link, Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../src/components/layout/screen';
import { Button } from '../src/components/ui/button';
import { Card } from '../src/components/ui/card';
import { LoadingState } from '../src/components/ui/loading-state';
import { YelyLogo } from '../src/components/ui/yely-logo';
import { useAuth } from '../src/lib/auth/auth-context';
import { colors, spacing, typography } from '../src/theme';

export default function HomePage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <LoadingState message="Chargement de l'application..." />
      </Screen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <YelyLogo size="lg" withSubtitle />
        <Text style={styles.title}>YELY Chauffeur</Text>
        <Text style={styles.subtitle}>
          Application mobile chauffeur V3. Connectez-vous pour acceder a votre espace professionnel.
        </Text>
      </View>

      <Card title="Demarrage" subtitle="Choisissez une action pour continuer.">
        <Link href="/login" asChild>
          <Button label="Se connecter" onPress={() => undefined} />
        </Link>
        <Link href="/register" asChild>
          <Button label="Creer un compte chauffeur" variant="secondary" onPress={() => undefined} />
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.titleLg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
