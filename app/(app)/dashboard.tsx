import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Link, Redirect } from "expo-router";
import { AppHeader } from "@/components/layout/app-header";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { getStationTransactionsToday } from "@/lib/api/stations";
import { formatMoney } from "@/lib/utils/format";
import { StationTodaySummary } from "@/types/transaction";
import { colors, typography } from "@/theme";

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [summary, setSummary] = useState<StationTodaySummary | null>(null);
  const role = String(user?.role || "").toUpperCase();
  const isCashier = role === "CASHIER";

  useEffect(() => {
    if (isCashier) return;

    const load = async () => {
      if (!session?.accessToken) return;
      try {
        const data = await getStationTransactionsToday(session.accessToken, user?.stationId);
        setSummary(data);
      } catch {
        setSummary(null);
      }
    };

    void load();
  }, [isCashier, session?.accessToken, user?.stationId]);

  if (isCashier) {
    return <Redirect href="/(app)/scan" />;
  }

  return (
    <Screen scrollable>
      <AppHeader title={`Bonjour, ${user?.firstName || "staff"}`} subtitle="Espace station" />

      <Card>
        <Text style={styles.title}>Transactions du jour</Text>
        <Text style={styles.text}>Nombre: {summary?.totalTransactions ?? "-"}</Text>
        <Text style={styles.text}>Montant: {summary ? formatMoney(summary.totalAmount, "FCFA") : "-"}</Text>
      </Card>

      <Card>
        <Text style={styles.title}>Scanner chauffeur</Text>
        <Text style={styles.text}>Action principale pour créer une transaction.</Text>
        <Link href="/(app)/scan" asChild>
          <Button label="Scanner chauffeur" />
        </Link>
      </Card>

      <Card>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.text}>Consulter les transactions de la station.</Text>
        <Link href="/(app)/transactions" asChild>
          <Button label="Voir historique" variant="secondary" />
        </Link>
      </Card>

      <Card>
        <Text style={styles.title}>Profil connecté</Text>
        <Text style={styles.text}>Rôle: {String(user?.role || "-")}</Text>
        <Text style={styles.text}>Téléphone: {user?.phone || "-"}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  text: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
