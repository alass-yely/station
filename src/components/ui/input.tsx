import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type InputProps = TextInputProps & {
  label: string;
};

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={styles.input} {...props} />
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
    minHeight: 50,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body
  }
});
