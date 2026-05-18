import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/layout/app-header";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InlineToast } from "@/components/ui/inline-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { normalizePhoneForApi, sanitizePhoneInput, isValidPhone } from "@/lib/utils/phone";
import { mapRuntimeErrorMessage } from "@/lib/utils/runtime-errors";
import { colors, spacing, typography } from "@/theme";

export default function LoginPage() {
  const { login, isAuthenticated, mustSelectPump, authNotice, consumeAuthNotice } = useAuth();
  const [stationCode, setStationCode] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authNotice) return;
    const timeout = setTimeout(() => consumeAuthNotice(), 5000);
    return () => clearTimeout(timeout);
  }, [authNotice, consumeAuthNotice]);

  if (isAuthenticated) {
    // Workaround Expo Router typed routes pour routes runtime.
    return <Redirect href={(mustSelectPump ? "/(app)/pump" : "/(app)/scan") as never} />;
  }

  const onSubmit = async () => {
    setError(null);

    const normalizedStationCode = stationCode.trim().toUpperCase();
    const normalizedPhone = normalizePhoneForApi(phone);
    const normalizedPin = pin.trim();

    if (!normalizedStationCode) {
      setError("Le code station est obligatoire.");
      return;
    }

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
        stationCode: normalizedStationCode,
        phone: normalizedPhone,
        pin: normalizedPin
      });
    } catch (submitError) {
      const message = mapRuntimeErrorMessage(submitError, "Échec de la connexion.");
      setError(message || "Échec de la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <Image source={require("../../assets/Light-version.png")} style={styles.logo} resizeMode="contain" />
        <AppHeader title="Connexion station" subtitle="Connectez-vous avec le code de votre station." />
      </View>

      <Card>
        <View style={styles.inputGroup}>
          <Input
            label="Code station"
            placeholder="Ex: ST-COC-001"
            value={stationCode}
            onChangeText={setStationCode}
            autoCapitalize="characters"
            autoCorrect={false}
            hint="Format habituel: ST-XXX-001"
          />

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
            hint="PIN à 4 chiffres"
          />
        </View>

        {authNotice ? <InlineToast message={authNotice} type="info" /> : null}
        {error ? <InlineToast message={error} type="error" /> : null}
        <Button
          label={isSubmitting ? "Connexion..." : "Se connecter"}
          onPress={() => void onSubmit()}
          disabled={isSubmitting}
        />
      </Card>

      <Text style={styles.helpText}>Connexion dédiée pompiste terrain.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm
  },
  logo: {
    width: 92,
    height: 30
  },
  inputGroup: {
    gap: spacing.md
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: "center"
  }
});