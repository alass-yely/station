import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

export const InlineToast = ({
  message,
  type = "info"
}: {
  message: string;
  type?: "info" | "success" | "error" | "warning";
}) => {
  const backgroundColor =
    type === "success"
      ? `${colors.success}22`
      : type === "error"
        ? `${colors.danger}22`
        : type === "warning"
          ? `${colors.warning}22`
          : `${colors.info}22`;
  const textColor =
    type === "success"
      ? colors.success
      : type === "error"
        ? colors.danger
        : type === "warning"
          ? colors.warning
          : colors.info;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  text: {
    fontSize: typography.caption,
    fontWeight: "600"
  }
});
