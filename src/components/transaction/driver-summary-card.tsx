import { StyleSheet, Text } from "react-native";
import { Card } from "@/components/ui/card";
import { colors, typography } from "@/theme";

type Props = {
  driverName: string;
  driverPhone?: string;
  driverId: string;
  qrToken: string;
};

export const DriverSummaryCard = ({ driverName, driverPhone, driverId, qrToken }: Props) => {
  return (
    <Card>
      <Text style={styles.title}>Chauffeur résolu</Text>
      <Text style={styles.info}>Nom: {driverName}</Text>
      <Text style={styles.info}>Téléphone: {driverPhone || "-"}</Text>
      <Text style={styles.info}>ID: {driverId}</Text>
      <Text style={styles.info}>QR validé: {qrToken ? "Oui" : "Non"}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  info: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
