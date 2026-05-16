import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@/theme";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: colors.accent, fg: colors.primaryContrast },
  secondary: { bg: colors.primary, fg: colors.primaryContrast },
  danger: { bg: colors.danger, fg: colors.primaryContrast }
};

export const Button = ({ label, onPress, disabled, variant = "primary" }: ButtonProps) => {
  const palette = variantStyles[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }
      ]}
    >
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  label: {
    fontSize: typography.button,
    fontWeight: "800"
  }
});
