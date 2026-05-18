import { Image, StyleSheet, Text } from "react-native";
import { Card } from "@/components/ui/card";
import { colors, typography } from "@/theme";

export const PumpPhotoPreview = ({ url }: { url?: string }) => {
  if (!url) {
    return (
      <Card>
        <Text style={styles.title}>Photo pompe</Text>
        <Text style={styles.info}>Photo pompe non disponible.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>Photo pompe</Text>
      <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  info: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 8
  }
});
