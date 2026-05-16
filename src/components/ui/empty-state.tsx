import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
