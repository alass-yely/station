import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
import { PumpPhotoPicker } from "@/components/transaction/pump-photo-picker";
import { TransactionSuccessCard } from "@/components/transaction/transaction-success-card";
import { useAuth } from "@/lib/auth/auth-context";
import { createStationTransaction } from "@/lib/api/transactions";
import { uploadPumpPhoto } from "@/lib/api/uploads";
import { parseDecimalInput, parseMoneyInput } from "@/lib/utils/format";
import { isAuthExpiredError, mapRuntimeErrorMessage } from "@/lib/utils/runtime-errors";
import { CreateStationTransactionResponse, FuelType } from "@/types/transaction";
import { spacing } from "@/theme";

export default function NewTransactionPage() {
  const params = useLocalSearchParams<{
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    qrToken?: string;
  }>();
  const router = useRouter();
  const { session, hasOpenWorkSession, logout } = useAuth();

  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [litersInput, setLitersInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<"idle" | "uploading" | "creating">("idle");
  const [successData, setSuccessData] = useState<CreateStationTransactionResponse | null>(null);

  const driverId = useMemo(() => (typeof params.driverId === "string" ? params.driverId : ""), [params.driverId]);
  const driverName = useMemo(() => (typeof params.driverName === "string" ? params.driverName : ""), [params.driverName]);
  const driverPhone = useMemo(() => (typeof params.driverPhone === "string" ? params.driverPhone : ""), [params.driverPhone]);
  const qrToken = useMemo(() => (typeof params.qrToken === "string" ? params.qrToken : ""), [params.qrToken]);

  const hasDriver = Boolean(driverId && qrToken);

  const resetForm = () => {
    setFuelType(null);
    setLitersInput("");
    setAmountInput("");
    setPhotoUri(undefined);
    setPhotoError(null);
    setError(null);
    setSuccessData(null);
    setSubmitStage("idle");
  };

  const submit = async () => {
    if (isSubmitting) return;
    setError(null);
    setPhotoError(null);

    if (!hasOpenWorkSession) {
      setError("Aucune session ouverte. Sélectionnez une pompe.");
      router.replace("/(app)/pump");
      return;
    }

    if (!hasDriver) {
      setError("Aucun chauffeur sélectionné. Veuillez d'abord scanner un QR.");
      return;
    }

    if (!fuelType) {
      setError("Veuillez sélectionner le type de carburant.");
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

    if (!photoUri) {
      setPhotoError("La photo de l'index de la pompe est obligatoire.");
      return;
    }

    if (!session?.accessToken) {
      setError("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    setIsSubmitting(true);

    try {
      setSubmitStage("uploading");
      const upload = await uploadPumpPhoto(photoUri, session.accessToken);

      setSubmitStage("creating");
      const result = await createStationTransaction(
        {
          driverId,
          qrCodeToken: qrToken,
          fuelType,
          liters,
          amount,
          organizationId: session.user.organizationId,
          pumpPhotoUrl: upload.url
        },
        session.accessToken
      );

      setSuccessData(result);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (submitError) {
      if (isAuthExpiredError(submitError)) {
        await logout();
        return;
      }

      const message = mapRuntimeErrorMessage(submitError, "Impossible de valider la transaction.");
      setError(message || "Impossible de valider la transaction.");

      const lowered = String(message || "").toLowerCase();
      if (lowered.includes("session ouverte") || lowered.includes("pompe indisponible")) {
        router.replace("/(app)/pump");
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
      setSubmitStage("idle");
    }
  };

  const buttonLabel = useMemo(() => {
    if (submitStage === "uploading") return "Transmission du cliché...";
    if (submitStage === "creating") return "Enregistrement du reçu...";
    if (isSubmitting) return "Validation en cours...";
    return "Valider la transaction";
  }, [submitStage, isSubmitting]);

  return (
    <Screen scrollable>
      <View style={styles.headerContainer}>
        <AppHeader title="Nouvelle Transaction" subtitle="Enregistrement des données de distribution" />
      </View>

      {!hasDriver && (
        <Card style={styles.cardWrapper}>
          <InlineToast
            message="Aucun chauffeur sélectionné. Veuillez d'abord scanner un QR."
            type="error"
          />
          <View style={styles.actionGap}>
            <Button label="Ouvrir le scanner" onPress={() => router.push("/(app)/scan")} />
          </View>
        </Card>
      )}

      {hasDriver && (
        <View style={styles.driverSection}>
          <DriverSummaryCard
            driverId={driverId}
            driverName={driverName || "Chauffeur"}
            driverPhone={driverPhone}
            qrToken={qrToken}
          />
        </View>
      )}

      {successData ? (
        <TransactionSuccessCard
          transaction={successData.transaction}
          driverName={driverName || "Chauffeur"}
          onNewTransaction={resetForm}
          onScannerNext={() => {
            resetForm();
            router.replace("/(app)/scan");
          }}
          onGoHistory={() => router.push("/(app)/transactions")}
          onViewDetails={() => router.push(`/transaction/${successData.transaction.id}` as never)}
        />
      ) : (
        hasDriver && (
          <View style={styles.formContainer}>
            {!hasOpenWorkSession && (
              <InlineToast
                message="Aucune session ouverte. Sélectionnez une pompe."
                type="error"
              />
            )}

            {/* Section Sélection Carburant */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Type de carburant</Text>
              <FuelTypeSelector value={fuelType} onChange={setFuelType} />
            </View>

            {/* Grille de Saisie Numérique Côte à Côte */}
            <View style={styles.gridRow}>
              <View style={styles.gridColumn}>
                <Input
                  label="Volume (Litres)"
                  placeholder="Ex: 12.5"
                  keyboardType="decimal-pad"
                  value={litersInput}
                  onChangeText={setLitersInput}
                />
              </View>
              <View style={styles.gridColumn}>
                <Input
                  label="Montant (FCFA)"
                  placeholder="Ex: 32000"
                  keyboardType="number-pad"
                  value={amountInput}
                  onChangeText={(val) => setAmountInput(val.replace(/[^\d.,]/g, ""))}
                />
              </View>
            </View>

            {/* Preuve Photo */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionLabel}>Justificatif de l'index</Text>
              <PumpPhotoPicker
                photoUri={photoUri}
                onPick={(uri) => {
                  setPhotoUri(uri);
                  setPhotoError(null);
                }}
                onClear={() => setPhotoUri(undefined)}
                error={photoError}
              />
            </View>

            {/* Alertes d'erreurs globales */}
            {error && (
              <View style={styles.toastMargin}>
                <InlineToast message={error} type="error" />
              </View>
            )}

            {/* Validation */}
            <View style={styles.actionContainer}>
              <Button
                label={buttonLabel}
                onPress={() => void submit()}
                disabled={isSubmitting || !hasDriver || !hasOpenWorkSession}
              />
              <Text style={styles.helpText}>
                Vérifiez les données de la pompe avant de confirmer la transaction.
              </Text>
            </View>
          </View>
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.xs,
  },
  cardWrapper: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
  },
  actionGap: {
    marginTop: spacing.xs,
  },
  driverSection: {
    marginBottom: spacing.sm,
  },
  formContainer: {
    gap: spacing.lg,
  },
  sectionBlock: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: "#475569", // Slate 600 : Lisible et pro
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  gridColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    // Ombre légère pour détacher subtilement la zone de saisie du fond
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  photoSection: {
    gap: spacing.xs,
  },
  toastMargin: {
    marginTop: spacing.xs,
  },
  actionContainer: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  helpText: {
    color: "#94A3B8", // Slate 400
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
});