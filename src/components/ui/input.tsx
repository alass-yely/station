import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type InputProps = TextInputProps & {
  label: string;
  hint?: string;
};

export const Input = ({ label, hint, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={styles.input} {...props} />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "600"
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 54,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "600"
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.caption
  }
});
