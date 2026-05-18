import { StyleSheet, Text, View } from "react-native";
import { StationSession } from "@/types/auth";
import { colors, spacing, typography } from "@/theme";

type RuntimeBannerProps = {
  session: StationSession | null;
};

export const RuntimeBanner = ({ session }: RuntimeBannerProps) => {
  const stationName = session?.station?.name || session?.currentWorkSession?.stationName || "Station";
  const stationCode = session?.station?.stationCode || "Code inconnu";
  const pumpLabel = session?.currentWorkSession?.pumpLabel || "Pompe";
  const pumpCode = session?.currentWorkSession?.pumpCode || "-";
  const fuelType = session?.currentWorkSession?.fuelType || "Carburant";
  const cashierName = session?.user?.firstName || session?.currentWorkSession?.cashierFirstName || "";

  return (
    <View style={styles.container}>
      <Text style={styles.stationName}>{stationName}</Text>
      <Text style={styles.stationCode}>Code: {stationCode}</Text>
      <Text style={styles.pumpText}>
        {pumpLabel} {pumpCode !== "-" ? `(${pumpCode})` : ""} - {fuelType}
      </Text>
      {cashierName ? <Text style={styles.cashier}>Pompiste: {cashierName}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15, 157, 88, 0.9)",
    borderColor: "rgba(255, 255, 255, 0.45)",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2
  },
  stationName: {
    color: colors.primaryContrast,
    fontSize: typography.subtitle,
    fontWeight: "800"
  },
  stationCode: {
    color: colors.primaryContrast,
    opacity: 0.9,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  pumpText: {
    color: colors.primaryContrast,
    fontSize: typography.body,
    fontWeight: "700"
  },
  cashier: {
    color: colors.primaryContrast,
    opacity: 0.9,
    fontSize: typography.caption
  }
});
