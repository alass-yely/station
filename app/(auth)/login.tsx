import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../src/components/layout/screen';
import { Button } from '../../src/components/ui/button';
import { Card } from '../../src/components/ui/card';
import { Input } from '../../src/components/ui/input';
import { YelyLogo } from '../../src/components/ui/yely-logo';
import { useAuth } from '../../src/lib/auth/auth-context';
import {
  isValidPhone,
  normalizePhoneForApi,
  sanitizePhoneInput,
} from '../../src/lib/utils/phone';
import { ApiError } from '../../src/types/api';
import { colors, spacing, typography } from '../../src/theme';

function normalizePin(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneError = useMemo(() => {
    if (!phone) return null;
    return isValidPhone(phone) ? null : 'Numero invalide';
  }, [phone]);

  const pinError = useMemo(() => {
    if (!pin) return null;
    return normalizePin(pin).length !== 4 ? 'Le PIN doit contenir 4 chiffres.' : null;
  }, [pin]);

  async function onSubmit() {
    setError(null);

    const cleanPhone = normalizePhoneForApi(phone);
    const cleanPin = normalizePin(pin);

    if (!cleanPhone) {
      setError('Le telephone est obligatoire.');
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setError('Numero invalide.');
      return;
    }

    if (cleanPin.length !== 4) {
      setError('Le PIN doit contenir 4 chiffres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ phone: cleanPhone, pin: cleanPin });
      router.replace('/dashboard');
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.message || 'Connexion impossible. Verifiez vos informations.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <YelyLogo size="md" withSubtitle />
      <Text style={styles.title}>Connexion chauffeur</Text>
      <Card subtitle="Entrez vos informations pour acceder a votre espace.">
        <Input
          label="Telephone"
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="telephoneNumber"
          placeholder="Ex: +2250700000000"
          value={phone}
          onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
          error={phoneError ?? undefined}
        />
        <Input
          label="PIN (4 chiffres)"
          keyboardType="numeric"
          secureTextEntry
          placeholder="••••"
          value={pin}
          onChangeText={(value) => setPin(normalizePin(value))}
          maxLength={4}
          error={pinError ?? undefined}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          onPress={onSubmit}
          disabled={isSubmitting}
        />
      </Card>

      <Link href="/register" asChild>
        <Button label="Creer un compte chauffeur" variant="ghost" onPress={() => undefined} />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  error: {
    color: colors.danger,
    fontSize: typography.bodySm,
    marginTop: spacing.xs,
  },
});
