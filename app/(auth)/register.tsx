import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [affiliationCode, setAffiliationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);

    if (!firstName.trim()) {
      setError('Le prenom est obligatoire.');
      return;
    }

    if (!lastName.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }

    const cleanPhone = normalizePhoneForApi(phone);
    if (!cleanPhone) {
      setError('Le telephone est obligatoire.');
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setError('Numero invalide.');
      return;
    }

    if (normalizePin(pin).length !== 4) {
      setError('Le PIN doit contenir 4 chiffres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: cleanPhone,
        pin: normalizePin(pin),
        referralCode: referralCode.trim() || undefined,
        affiliationCode: affiliationCode.trim() || undefined,
      });
      router.replace('/dashboard');
    } catch (e) {
      const apiError = e as ApiError;
      setError(apiError?.message || 'Inscription impossible pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <YelyLogo size="md" withSubtitle />
      <Text style={styles.title}>Creation de compte chauffeur</Text>
      <Card subtitle="Creez votre compte pour acceder aux services YELY Chauffeur.">
        <Input label="Prenom" value={firstName} onChangeText={setFirstName} placeholder="Ex: Koffi" />
        <Input label="Nom" value={lastName} onChangeText={setLastName} placeholder="Ex: Yao" />
        <Input
          label="Telephone"
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Ex: +2250700000000"
          value={phone}
          onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
        />
        <Input
          label="PIN (4 chiffres)"
          keyboardType="numeric"
          secureTextEntry
          placeholder="••••"
          value={pin}
          onChangeText={(value) => setPin(normalizePin(value))}
          maxLength={4}
        />
        <Input
          label="Code parrain (optionnel)"
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
        />
        <Input
          label="Code affiliation (optionnel)"
          value={affiliationCode}
          onChangeText={setAffiliationCode}
          autoCapitalize="characters"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={isSubmitting ? 'Creation en cours...' : 'Creer mon compte'}
          onPress={onSubmit}
          disabled={isSubmitting}
        />
      </Card>

      <Link href="/login" asChild>
        <Button label="Deja un compte ? Se connecter" variant="ghost" onPress={() => undefined} />
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
