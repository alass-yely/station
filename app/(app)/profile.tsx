import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../src/components/layout/screen';
import { Button } from '../../src/components/ui/button';
import { Card } from '../../src/components/ui/card';
import { useAuth } from '../../src/lib/auth/auth-context';
import { colors, spacing, typography } from '../../src/theme';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <Screen>
      <Text style={styles.title}>Profil chauffeur</Text>
      <Card title={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}>
        <Text style={styles.line}>Telephone: {user?.phone ?? '-'}</Text>
        <Text style={styles.line}>Role: {user?.role ?? '-'}</Text>
        <Text style={styles.line}>Statut: {user?.status ?? '-'}</Text>
      </Card>

      <Button label="Se deconnecter" variant="danger" onPress={onLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  line: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
