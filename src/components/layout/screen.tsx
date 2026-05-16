import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

export const Screen = ({ children, scrollable = false }: ScreenProps) => {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      {scrollable ? <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingBottom: spacing.xl
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md
  }
});
