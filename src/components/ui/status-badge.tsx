import { StyleSheet, Text, View } from "react-native";
import { statusColors } from "@/theme";

export const StatusBadge = ({ label, status }: { label: string; status: keyof typeof statusColors }) => (
  <View style={[styles.badge, { backgroundColor: `${statusColors[status]}22` }]}>
    <Text style={[styles.text, { color: statusColors[status] }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  text: {
    fontWeight: "700",
    fontSize: 12
  }
});
