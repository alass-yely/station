import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";
import { Button } from "./button";

export const FullscreenError = ({
  message,
  actionLabel,
  onAction
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>Oups</Text>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    color: colors.danger,
    fontSize: typography.title,
    fontWeight: "800"
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: "center"
  }
});
