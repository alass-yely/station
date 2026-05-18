import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { InlineToast } from "@/components/ui/inline-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { resolveDriverByQrToken } from "@/lib/api/drivers";
import { parseDriverQrPayload } from "@/lib/utils/qr";
import { ScanOverlay } from "@/components/scan/scan-overlay";
import { ScanErrorCard } from "@/components/scan/scan-error-card";
import { RuntimeBanner } from "@/components/station/runtime-banner";
import { isAuthExpiredError, mapRuntimeErrorMessage } from "@/lib/utils/runtime-errors";
import { colors, spacing } from "@/theme";

const SCAN_ERROR_COOLDOWN_MS = 1400;

export default function ScanPage() {
  const { session, closeCurrentWorkSession, hasOpenWorkSession, logout } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [isClosingService, setIsClosingService] = useState(false);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setError(null);
      setServiceMessage(null);
      setIsProcessingScan(false);
    }, [])
  );

  useEffect(() => {
    if (!session?.accessToken) return;
    if (hasOpenWorkSession) return;
    router.replace("/(app)/pump");
  }, [hasOpenWorkSession, router, session?.accessToken]);

  const resetScan = useCallback(() => {
    setError(null);
    setIsProcessingScan(false);
  }, []);

  const confirmCloseService = useCallback(() => {
    Alert.alert(
      "Terminer le service",
      "Voulez-vous vraiment clore votre session de travail actuelle ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Terminer",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsClosingService(true);
              setServiceMessage(null);
              setError(null);
              try {
                await closeCurrentWorkSession();
                router.replace("/(app)/pump");
              } catch (closeError) {
                if (isAuthExpiredError(closeError)) {
                  await logout();
                  return;
                }
                setServiceMessage(
                  mapRuntimeErrorMessage(closeError, "Impossible de fermer la session.")
                );
              } finally {
                setIsClosingService(false);
              }
            })();
          }
        }
      ]
    );
  }, [closeCurrentWorkSession, logout, router]);

  const handleScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isProcessingScan || isClosingService) return;

      setIsProcessingScan(true);
      setError(null);

      try {
        if (!session?.accessToken) throw new Error("Session invalide. Reconnectez-vous.");
        if (!hasOpenWorkSession) throw new Error("Aucune session ouverte.");

        const { qrToken } = parseDriverQrPayload(data);
        const result = await resolveDriverByQrToken(qrToken, session.accessToken);
        const driver = result.driver;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
        if (isAuthExpiredError(scanError)) {
          await logout();
          return;
        }

        const message = mapRuntimeErrorMessage(scanError, "Code QR invalide ou inconnu.");
        setError(message || "Scan impossible.");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        setTimeout(() => {
          setIsProcessingScan(false);
        }, SCAN_ERROR_COOLDOWN_MS);
        return;
      }
      setIsProcessingScan(false);
    },
    [hasOpenWorkSession, isProcessingScan, isClosingService, logout, router, session?.accessToken]
  );

  if (!permission) return <FullscreenLoading message="Initialisation caméra..." />;

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.permissionBlock}>
          <Text style={styles.permissionTitle}>Caméra requise</Text>
          <Text style={styles.permissionText}>L'accès à la caméra est nécessaire pour identifier les QR codes des chauffeurs.</Text>
          <Button label="Accorder l'autorisation" onPress={() => void requestPermission()} />
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
        onBarcodeScanned={isProcessingScan || isClosingService || !hasOpenWorkSession ? undefined : handleScanned}
      />

      {/* Overlay de visée central personnalisé */}
      <ScanOverlay />

      {/* Floating Header Area */}
      <View style={styles.floatingTopArea}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.scanTitle}>Scanner QR</Text>
            <Text style={styles.scanSubtitle}>Alignez le code du chauffeur</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.closeServiceBadge} 
            onPress={confirmCloseService}
            disabled={isClosingService}
          >
            <Text style={styles.closeServiceText}>
              {isClosingService ? "Fermeture..." : "Fin de service"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ta bannière Runtime encapsulée élégamment */}
        <View style={styles.bannerContainer}>
          <RuntimeBanner session={session} />
        </View>
      </View>

      {/* Floating Bottom Area */}
      <View style={styles.floatingBottomArea}>
        {isProcessingScan && (
          <View style={styles.loaderCard}>
            <ActivityIndicator color="#0F9D58" size="small" />
            <Text style={styles.loaderText}>Analyse du profil chauffeur...</Text>
          </View>
        )}

        {serviceMessage && <InlineToast message={serviceMessage} type="info" />}
        {!hasOpenWorkSession && (
          <InlineToast message="Session inactive. Sélectionnez une pompe." type="error" />
        )}
        
        {error && (
          <View style={styles.errorWrapper}>
            <ScanErrorCard message={error} onRetry={resetScan} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000"
  },
  floatingTopArea: {
    position: "absolute",
    top: 60,
    left: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)", // Verre dépoli blanc très élégant
    padding: spacing.md,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  scanSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  closeServiceBadge: {
    backgroundColor: "#FEE2E2", // Rouge ultra doux (Light Fintech)
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  closeServiceText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerContainer: {
    opacity: 0.95,
  },
  floatingBottomArea: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 40,
    gap: spacing.sm,
    zIndex: 10,
  },
  loaderCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  loaderText: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 14,
  },
  errorWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  permissionBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  permissionText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});