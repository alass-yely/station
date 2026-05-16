import { StyleSheet, Text } from "react-native";
import { Screen } from "@/components/layout/screen";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { colors, typography } from "@/theme";
import { useAuth } from "@/lib/auth/auth-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <AppHeader title="Profil" subtitle="Compte station connecté" />
      <Card>
        <Text style={styles.label}>Nom</Text>
        <Text style={styles.value}>{`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "-"}</Text>

        <Text style={styles.label}>Téléphone</Text>
        <Text style={styles.value}>{user?.phone || "-"}</Text>

        <Text style={styles.label}>Rôle</Text>
        <Text style={styles.value}>{String(user?.role || "-")}</Text>

        <Text style={styles.label}>Statut</Text>
        <Text style={styles.value}>{String(user?.status || "-")}</Text>
      </Card>

      <Button label="Se déconnecter" variant="danger" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: typography.caption
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
    marginBottom: 8
  }
});
