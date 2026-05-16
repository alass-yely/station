import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

export const LoadingState = ({ message = "Chargement..." }: { message?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator color={colors.primary} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
