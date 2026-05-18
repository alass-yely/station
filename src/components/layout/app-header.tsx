import { Image, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export const AppHeader = ({ title, subtitle, rightSlot }: AppHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={require("../../../assets/Dark-version.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  left: {
    gap: 2,
    flexShrink: 1
  },
  logo: {
    width: 68,
    height: 20,
    marginBottom: 2
  },
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.caption
  }
});
