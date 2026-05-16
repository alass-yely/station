import { Redirect, Stack } from 'expo-router';
import { Screen } from '../../src/components/layout/screen';
import { LoadingState } from '../../src/components/ui/loading-state';
import { useAuth } from '../../src/lib/auth/auth-context';

export default function AuthLayout() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <LoadingState message="Verification de la session..." />
      </Screen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
