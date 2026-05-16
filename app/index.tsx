import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { colors, spacing, typography } from "@/theme";

export default function HomePage() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>YELY Station</Text>
        <Text style={styles.subtitle}>Application caisse/station pour scanner et traiter les transactions chauffeur.</Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Bienvenue</Text>
        <Text style={styles.cardText}>Connectez-vous avec un compte station staff pour accéder au tableau de bord.</Text>
      </Card>

      <Link href="/login" asChild>
        <Button label="Connexion station" />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    color: colors.primaryContrast,
    fontSize: typography.title,
    fontWeight: "800"
  },
  subtitle: {
    color: "#DDEBFF",
    fontSize: typography.body,
    lineHeight: 22
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: typography.subtitle
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
