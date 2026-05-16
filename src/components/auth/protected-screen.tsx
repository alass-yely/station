import { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../lib/auth/auth-context';
import { LoadingState } from '../ui/loading-state';
import { Screen } from '../layout/screen';

type ProtectedScreenProps = {
  children: ReactNode;
};

export function ProtectedScreen({ children }: ProtectedScreenProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <LoadingState message="Restauration de la session..." />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
