import { Text } from "react-native";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { colors, typography } from "@/theme";

export const ScanErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Card>
    <Text style={{ color: colors.danger, fontWeight: "700", fontSize: typography.body }}>Erreur de scan</Text>
    <Text style={{ color: colors.textMuted, fontSize: typography.body }}>{message}</Text>
    <Button label="Réessayer" onPress={onRetry} />
  </Card>
);
