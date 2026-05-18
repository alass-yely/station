import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/layout/screen";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { FullscreenError } from "@/components/ui/fullscreen-error";
import { StatusBadge } from "@/components/ui/status-badge";
import { PumpPhotoPreview } from "@/components/transaction/pump-photo-preview";
import { useAuth } from "@/lib/auth/auth-context";
import { getTransactionById } from "@/lib/api/transactions";
import {
  formatDateTime,
  formatFuelType,
  formatLiters,
  formatMoney,
  formatTransactionStatus,
  getTransactionStatusTone
} from "@/lib/utils/format";
import { StationTransactionDetails } from "@/types/transaction";
import { colors, typography } from "@/theme";

export default function TransactionDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [item, setItem] = useState<StationTransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || typeof id !== "string") {
      setError("Transaction introuvable.");
      setIsLoading(false);
      return;
    }

    if (!session?.accessToken) {
      setError("Erreur réseau. Réessayez.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTransactionById(id, session.accessToken);
      setItem(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Impossible de charger cette transaction.";
      setError(message || "Impossible de charger cette transaction.");
    } finally {
      setIsLoading(false);
    }
  }, [id, session?.accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return <FullscreenLoading message="Chargement transaction..." />;
  }

  if (error || !item) {
    return (
      <FullscreenError
        message={error || "Transaction introuvable."}
        actionLabel="Réessayer"
        onAction={() => void load()}
      />
    );
  }

  return (
    <Screen scrollable>
      <AppHeader title="Détail transaction" subtitle={item.reference || item.id} />

      <Card>
        <View style={styles.row}>
          <Text style={styles.amount}>{formatMoney(item.amount || 0, "FCFA")}</Text>
          <StatusBadge
            label={formatTransactionStatus(item.status || "pending")}
            status={getTransactionStatusTone(item.status)}
          />
        </View>
        <Text style={styles.info}>Chauffeur: {item.driverName || "-"}</Text>
        <Text style={styles.info}>Téléphone: {item.driverPhone || "-"}</Text>
        <Text style={styles.info}>Carburant: {formatFuelType(item.fuelType || "-")}</Text>
        <Text style={styles.info}>Litres: {formatLiters(item.liters || 0)}</Text>
        <Text style={styles.info}>Cashback: {formatMoney(item.cashbackAmount || 0, "FCFA")}</Text>
        <Text style={styles.info}>Créée le: {item.createdAt ? formatDateTime(item.createdAt) : "-"}</Text>
        <Text style={styles.info}>Confirmée le: {item.confirmedAt ? formatDateTime(item.confirmedAt) : "-"}</Text>
        <Text style={styles.info}>Station: {item.stationName || "-"}</Text>
        <Text style={styles.info}>Pompe: {[item.pumpName, item.pumpCode].filter(Boolean).join(" - ") || "-"}</Text>
        <Text style={styles.info}>Session: {item.workSessionId || "-"}</Text>
        <Text style={styles.info}>Pompiste: {item.cashierName || "-"}</Text>
      </Card>

      <PumpPhotoPreview url={item.pumpPhotoUrl} />

      <Button label="Retour historique" variant="secondary" onPress={() => router.push("/(app)/transactions")} />
      <Button label="Scanner un autre chauffeur" onPress={() => router.push("/(app)/scan")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  amount: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800"
  },
  info: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
