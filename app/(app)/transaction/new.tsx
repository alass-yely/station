import { useMemo, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/layout/screen";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineToast } from "@/components/ui/inline-toast";
import { Input } from "@/components/ui/input";
import { DriverSummaryCard } from "@/components/transaction/driver-summary-card";
import { FuelTypeSelector } from "@/components/transaction/fuel-type-selector";
import { TransactionSuccessCard } from "@/components/transaction/transaction-success-card";
import { useAuth } from "@/lib/auth/auth-context";
import { createStationTransaction } from "@/lib/api/transactions";
import { parseDecimalInput, parseMoneyInput } from "@/lib/utils/format";
import { CreateStationTransactionResponse, FuelType } from "@/types/transaction";
import { colors, typography } from "@/theme";

export default function NewTransactionPage() {
  const params = useLocalSearchParams<{
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    qrToken?: string;
  }>();
  const router = useRouter();
  const { session } = useAuth();

  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [litersInput, setLitersInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<CreateStationTransactionResponse | null>(null);

  const driverId = useMemo(() => (typeof params.driverId === "string" ? params.driverId : ""), [params.driverId]);
  const driverName = useMemo(
    () => (typeof params.driverName === "string" ? params.driverName : ""),
    [params.driverName]
  );
  const driverPhone = useMemo(
    () => (typeof params.driverPhone === "string" ? params.driverPhone : ""),
    [params.driverPhone]
  );
  const qrToken = useMemo(() => (typeof params.qrToken === "string" ? params.qrToken : ""), [params.qrToken]);

  const hasDriver = Boolean(driverId && qrToken);

  const resetForm = () => {
    setFuelType(null);
    setLitersInput("");
    setAmountInput("");
    setError(null);
    setSuccessData(null);
  };

  const submit = async () => {
    if (isSubmitting) return;

    setError(null);

    if (!hasDriver) {
      setError("Aucun chauffeur sélectionné. Scannez un QR avant de créer une transaction.");
      return;
    }

    if (!fuelType) {
      setError("Sélectionnez le type de carburant.");
      return;
    }

    const liters = parseDecimalInput(litersInput);
    if (!Number.isFinite(liters) || liters <= 0) {
      setError("Les litres doivent être supérieurs à 0.");
      return;
    }

    const amount = parseMoneyInput(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return;
    }

    if (!session?.accessToken) {
      setError("Session invalide. Reconnectez-vous.");
      return;
    }

    if (!session.user.stationId) {
      setError("Station non détectée sur ce compte. Contactez un administrateur.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createStationTransaction(
        {
          driverId,
          qrCodeToken: qrToken,
          fuelType,
          liters,
          amount,
          stationId: session.user.stationId,
          organizationId: session.user.organizationId
        },
        session.accessToken
      );

      setSuccessData(result);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Création transaction impossible.";
      setError(message || "Création transaction impossible.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable>
      <AppHeader title="Nouvelle transaction" subtitle="Saisie caissier" />

      {!hasDriver ? (
        <Card>
          <InlineToast
            message="Aucun chauffeur sélectionné. Scannez un QR avant de créer une transaction."
            type="error"
          />
          <Button label="Aller au scanner" onPress={() => router.push("/scan")} />
        </Card>
      ) : null}

      {hasDriver ? (
        <DriverSummaryCard
          driverId={driverId}
          driverName={driverName || "Chauffeur"}
          driverPhone={driverPhone}
          qrToken={qrToken}
        />
      ) : null}

      {successData ? (
        <TransactionSuccessCard
          transaction={successData.transaction}
          driverName={driverName || "Chauffeur"}
          onNewTransaction={resetForm}
          onScannerNext={() => {
            resetForm();
            router.replace("/scan");
          }}
          onGoHistory={() => router.push("/transactions")}
          onViewDetails={() => router.push(`/transaction/${successData.transaction.id}` as never)}
        />
      ) : (
        <Card>
          <Text style={styles.label}>Carburant</Text>
          <FuelTypeSelector value={fuelType} onChange={setFuelType} />

          <Input
            label="Litres"
            placeholder="Ex: 12,5"
            keyboardType="decimal-pad"
            value={litersInput}
            onChangeText={setLitersInput}
          />

          <Input
            label="Montant (FCFA)"
            placeholder="Ex: 32000"
            keyboardType="number-pad"
            value={amountInput}
            onChangeText={(amountInputValue) => setAmountInput(amountInputValue.replace(/[^\d.,]/g, ""))}
          />

          <Text style={styles.placeholder}>Photo pompe (bientôt disponible)</Text>

          {error ? <InlineToast message={error} type="error" /> : null}

          <Button
            label={isSubmitting ? "Création en cours..." : "Créer transaction"}
            onPress={() => void submit()}
            disabled={isSubmitting || !hasDriver}
          />
        </Card>
      )}

      <Text style={styles.helpText}>Saisissez litres et montant, puis validez.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  placeholder: {
    color: colors.textMuted,
    fontSize: typography.caption
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.caption
  }
});
