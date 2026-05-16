import { useState } from "react";
import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/layout/app-header";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InlineToast } from "@/components/ui/inline-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { normalizePhoneForApi, sanitizePhoneInput, isValidPhone } from "@/lib/utils/phone";
import { colors, spacing, typography } from "@/theme";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  const onSubmit = async () => {
    setError(null);

    const normalizedPhone = normalizePhoneForApi(phone);
    const normalizedPin = pin.trim();

    if (!normalizedPhone) {
      setError("Le téléphone est obligatoire.");
      return;
    }

    if (!isValidPhone(normalizedPhone)) {
      setError("Numéro de téléphone invalide.");
      return;
    }

    if (!normalizedPin) {
      setError("Le PIN est obligatoire.");
      return;
    }

    if (!/^\d{4}$/.test(normalizedPin)) {
      setError("Le PIN doit contenir exactement 4 chiffres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        phone: normalizedPhone,
        pin: normalizedPin
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Échec de la connexion.";
      setError(message || "Échec de la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <AppHeader
        title="Connexion station"
        subtitle="Connectez-vous avec votre compte caissier ou manager."
      />

      <Card>
        <View style={styles.inputGroup}>
          <Input
            label="Téléphone"
            placeholder="Ex: 0700000000"
            value={phone}
            onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="telephoneNumber"
          />

          <Input
            label="PIN"
            placeholder="••••"
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            textContentType="password"
          />
        </View>

        {error ? <InlineToast message={error} type="error" /> : null}
        <Button label={isSubmitting ? "Connexion..." : "Se connecter"} onPress={() => void onSubmit()} disabled={isSubmitting} />
      </Card>

      <Text style={styles.helpText}>Utilisez vos identifiants staff station.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: spacing.md
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.caption
  }
});
