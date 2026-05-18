import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@/theme";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, { bg: string; fg: string; borderColor: string }> = {
  primary: { bg: colors.primary, fg: colors.primaryContrast, borderColor: colors.primary },
  secondary: { bg: colors.surface, fg: colors.text, borderColor: colors.border },
  danger: { bg: "#FEE2E2", fg: colors.danger, borderColor: "#FCA5A5" }
};

export const Button = ({ label, onPress, disabled, variant = "primary" }: ButtonProps) => {
  const palette = variantStyles[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1
        }
      ]}
    >
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  label: {
    fontSize: typography.button,
    fontWeight: "800"
  }
});
