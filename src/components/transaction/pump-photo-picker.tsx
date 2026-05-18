import { Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineToast } from "@/components/ui/inline-toast";
import { colors, spacing, typography } from "@/theme";

type Props = {
  photoUri?: string;
  onPick: (uri: string) => void;
  onClear: () => void;
  error?: string | null;
};

export const PumpPhotoPicker = ({ photoUri, onPick, onClear, error }: Props) => {
  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Impossible d'ouvrir la caméra.");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (uri) onPick(uri);
  };

  return (
    <Card>
      <Text style={styles.title}>Photo pompe</Text>

      {photoUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
          <View style={styles.actions}>
            <Button label="Changer" variant="secondary" onPress={() => void pickFromCamera()} />
            <Button label="Retirer" variant="danger" onPress={onClear} />
          </View>
        </View>
      ) : (
        <Button label="Prendre une photo" onPress={() => void pickFromCamera()} />
      )}

      {error ? <InlineToast message={error} type="error" /> : null}
      <Text style={styles.help}>Ajoutez une photo de la pompe pour valider la transaction.</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  previewWrap: {
    gap: spacing.sm
  },
  preview: {
    width: "100%",
    height: 190,
    borderRadius: 12
  },
  actions: {
    gap: spacing.sm
  },
  help: {
    color: colors.textMuted,
    fontSize: typography.caption
  }
});
