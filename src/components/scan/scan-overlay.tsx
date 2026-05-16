import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

export const ScanOverlay = () => {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.frame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
      <Text style={styles.title}>Scannez le QR code du chauffeur.</Text>
      <Text style={styles.subtitle}>Le QR doit être bien visible.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg
  },
  frame: {
    width: 250,
    height: 250,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: colors.accent,
    borderWidth: 4
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20
  },
  title: {
    marginTop: spacing.lg,
    color: colors.primaryContrast,
    fontSize: typography.subtitle,
    fontWeight: "700",
    textAlign: "center"
  },
  subtitle: {
    marginTop: spacing.xs,
    color: "#E4EAF0",
    fontSize: typography.body,
    textAlign: "center"
  }
});
