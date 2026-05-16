import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { AppHeader } from "@/components/layout/app-header";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { useAuth } from "@/lib/auth/auth-context";
import { resolveDriverByQrToken } from "@/lib/api/drivers";
import { parseDriverQrPayload } from "@/lib/utils/qr";
import { ScanOverlay } from "@/components/scan/scan-overlay";
import { ScanErrorCard } from "@/components/scan/scan-error-card";
import { colors, spacing, typography } from "@/theme";

const SCAN_ERROR_COOLDOWN_MS = 1400;

export default function ScanPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setIsProcessingScan(false);
    };
  }, []);

  const resetScan = useCallback(() => {
    setError(null);
    setIsProcessingScan(false);
  }, []);

  const handleScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isProcessingScan) return;

      setIsProcessingScan(true);
      setError(null);

      try {
        if (!session?.accessToken) {
          throw new Error("Session invalide. Reconnectez-vous.");
        }

        const { qrToken } = parseDriverQrPayload(data);
        const result = await resolveDriverByQrToken(qrToken, session.accessToken);
        const driver = result.driver;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        router.push({
          pathname: "/transaction/new",
          params: {
            driverId: driver.id,
            driverName: `${driver.firstName} ${driver.lastName}`.trim(),
            driverPhone: driver.phone,
            qrToken
          }
        });
      } catch (scanError) {
        const message = scanError instanceof Error ? scanError.message : "Scan impossible.";
        setError(message || "Scan impossible.");

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        setTimeout(() => {
          setIsProcessingScan(false);
        }, SCAN_ERROR_COOLDOWN_MS);

        return;
      }

      setIsProcessingScan(false);
    },
    [isProcessingScan, router, session?.accessToken]
  );

  if (!permission) {
    return <FullscreenLoading message="Chargement de la caméra..." />;
  }

  if (!permission.granted) {
    return (
      <Screen>
        <AppHeader title="Scanner" subtitle="QR Chauffeur" />
        <View style={styles.block}>
          <Text style={styles.title}>Autorisation caméra requise</Text>
          <Text style={styles.text}>Autorisez la caméra pour scanner le QR du chauffeur.</Text>
          <Button label="Autoriser caméra" onPress={() => void requestPermission()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={isProcessingScan ? undefined : handleScanned}
      />

      <View style={styles.topArea}>
        <AppHeader title="Scanner" subtitle="QR Chauffeur" />
      </View>

      <ScanOverlay />

      {isProcessingScan ? (
        <View style={styles.processingOverlay}>
          <ActivityIndicator color={colors.primaryContrast} size="large" />
          <Text style={styles.processingOverlayText}>Recherche du chauffeur...</Text>
        </View>
      ) : null}

      <View style={styles.bottomArea}>
        {error ? <ScanErrorCard message={error} onRetry={resetScan} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000"
  },
  topArea: {
    paddingTop: 54,
    paddingHorizontal: spacing.md
  },
  bottomArea: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    gap: spacing.sm
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    gap: spacing.sm
  },
  processingOverlayText: {
    color: colors.primaryContrast,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  block: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  text: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
