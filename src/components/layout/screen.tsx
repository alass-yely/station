import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import { colors, spacing } from "@/theme";

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>; // <-- On ajoute la possibilité de passer un style personnalisé
}>;

export const Screen = ({ children, scrollable = false, style }: ScreenProps) => {
  // On fusionne le style de base avec le style personnalisé s'il existe
  const content = <View style={[styles.content, style]}>{children}</View>;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background // Prendra la couleur globale (ex: notre fond sombre #0D0F12)
  },
  scrollContent: {
    flexGrow: 1, // Permet au ScrollView de prendre toute la place pour le spacer du bouton
    paddingBottom: spacing.xl
  },
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md
  }
});