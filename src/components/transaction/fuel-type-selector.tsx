import { Pressable, StyleSheet, Text, View } from "react-native";
import { FuelType } from "@/types/transaction";
import { colors, spacing, typography } from "@/theme";

type Props = {
  value: FuelType | null;
  onChange: (value: FuelType) => void;
};

const OPTIONS: Array<{ label: string; value: FuelType }> = [
  { label: "Diesel", value: "DIESEL" },
  { label: "Essence", value: "ESSENCE" }
];

export const FuelTypeSelector = ({ value, onChange }: Props) => {
  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected ? styles.optionSelected : undefined]}
          >
            <Text style={[styles.label, selected ? styles.labelSelected : undefined]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm
  },
  option: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: "#FFF1DE"
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700"
  },
  labelSelected: {
    color: colors.accent
  }
});
