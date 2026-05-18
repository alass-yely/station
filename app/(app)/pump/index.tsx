import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { AppHeader } from "@/components/layout/app-header";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FullscreenError } from "@/components/ui/fullscreen-error";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { InlineToast } from "@/components/ui/inline-toast";
import { ApiError } from "@/lib/api/client";
import { getStationPumps } from "@/lib/api/pumps";
import { getCurrentWorkSession, startWorkSession } from "@/lib/api/work-sessions";
import { useAuth } from "@/lib/auth/auth-context";
import { mapRuntimeErrorMessage, isAuthExpiredError } from "@/lib/utils/runtime-errors";
import { StationPump } from "@/types/pump";
import { colors, spacing } from "@/theme";

export default function PumpSelectionPage() {
  const router = useRouter();
  const { session, isLoading, isAuthenticated, mustSelectPump, applyWorkSessionRuntime, logout } = useAuth();

  const [pumps, setPumps] = useState<StationPump[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [startingPumpId, setStartingPumpId] = useState<string | null>(null);

  const stationId = session?.station?.id || session?.user.stationId || "";

  const isCashierAlreadyHasOpenSessionError = (error: ApiError): boolean => {
    const payload = (error.payload || {}) as { message?: string; error?: string };
    const raw = `${payload.message || ""} ${payload.error || ""} ${error.message || ""}`.toLowerCase();
    return raw.includes("cashier already has an open work session");
  };

  const isPumpAlreadyOpenSessionError = (error: ApiError): boolean => {
    const payload = (error.payload || {}) as { message?: string; error?: string };
    const raw = `${payload.message || ""} ${payload.error || ""} ${error.message || ""}`.toLowerCase();
    return raw.includes("pump already has an open work session");
  };

  const stationDisplay = useMemo(() => {
    const name = session?.station?.name;
    const code = session?.station?.stationCode;
    if (name && code) return `${name} • ${code}`;
    return name || code || "Station Id";
  }, [session?.station?.name, session?.station?.stationCode]);

  const hydrate = useCallback(async () => {
    if (!session?.accessToken) return;
    setActionError(null);

    const current = await getCurrentWorkSession(session.accessToken);
    if (current?.id) {
      await applyWorkSessionRuntime(current, false);
      router.replace("/(app)/scan");
      return;
    }

    if (!stationId) {
      throw new Error("Aucune station associée à ce compte.");
    }

    const activePumps = await getStationPumps(stationId, session.accessToken);
    setPumps(activePumps);
  }, [session?.accessToken, stationId, applyWorkSessionRuntime, router]);

  const loadInitial = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      await hydrate();
    } catch (loadError) {
      if (isAuthExpiredError(loadError)) {
        await logout();
        return;
      }
      setError(mapRuntimeErrorMessage(loadError, "Impossible de charger les pompes."));
    } finally {
      setIsInitialLoading(false);
    }
  }, [hydrate, logout]);

  useEffect(() => {
    if (!isLoading) {
      void loadInitial();
    }
  }, [isLoading, loadInitial]);

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setError(null);
    try {
      await hydrate();
    } catch (refreshError) {
      if (isAuthExpiredError(refreshError)) {
        await logout();
        return;
      }
      setError(mapRuntimeErrorMessage(refreshError, "Impossible d'actualiser."));
    } finally {
      setIsRefreshing(false);
    }
  }, [hydrate, isRefreshing, logout]);

  const onSelectPump = useCallback(
    async (pump: StationPump) => {
      if (!session?.accessToken || !stationId || startingPumpId) return;

      setStartingPumpId(pump.id);
      setActionError(null);

      try {
        const startedSession = await startWorkSession(
          { stationId, pumpId: pump.id },
          session.accessToken
        );

        let runtimeSession = startedSession?.id ? startedSession : await getCurrentWorkSession(session.accessToken);
        if (!runtimeSession?.id) {
          await sleep(400);
          runtimeSession = await getCurrentWorkSession(session.accessToken);
        }

        if (!runtimeSession?.id) {
          throw new Error("Session créée, mais non encore synchronisée. Réessayez.");
        }

        const resolvedWorkSession = {
          ...runtimeSession,
          pumpLabel: runtimeSession.pumpLabel || pump.label,
          pumpCode: runtimeSession.pumpCode || pump.pumpCode,
          fuelType: runtimeSession.fuelType || pump.fuelType,
          stationName: runtimeSession.stationName || session?.station?.name
        };

        await applyWorkSessionRuntime(resolvedWorkSession, false);
        router.replace("/(app)/scan");
      } catch (startError) {
        if (isAuthExpiredError(startError)) {
          await logout();
          return;
        }

        if (startError instanceof ApiError && startError.status === 409) {
          if (isCashierAlreadyHasOpenSessionError(startError)) {
            const current = await getCurrentWorkSession(session.accessToken);
            if (current?.id) {
              await applyWorkSessionRuntime(current, false);
              router.replace("/(app)/scan");
              return;
            }
            setActionError("Impossible de restaurer la session. Réessayez.");
            return;
          }

          if (isPumpAlreadyOpenSessionError(startError)) {
            setActionError("Cette pompe est déjà utilisée. Choisissez une autre pompe.");
            await onRefresh();
            return;
          }
        }
        setActionError(mapRuntimeErrorMessage(startError, "Impossible d'ouvrir la session."));
      } finally {
        setStartingPumpId(null);
      }
    },
    [session?.accessToken, session?.station?.name, stationId, startingPumpId, applyWorkSessionRuntime, router, onRefresh, logout]
  );

  // Helper pour styliser les badges de carburant
  const getFuelBadgeStyle = (fuelType: string = "") => {
    const type = fuelType.toLowerCase();
    if (type.includes("super") || type.includes("essence") || type.includes("gasoline")) return styles.badgeSuper;
    if (type.includes("gasoil") || type.includes("diesel")) return styles.badgeGasoil;
    return styles.badgeDefault;
  };

  if (isLoading || isInitialLoading) {
    return <FullscreenLoading message="Chargement des pompes actives..." />;
  }

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (!mustSelectPump) return <Redirect href="/(app)/scan" />;
  if (error) return <FullscreenError message={error} actionLabel="Réessayer" onAction={() => void loadInitial()} />;

  return (
    <Screen>
      {/* Header épuré */}
      <View style={styles.headerContainer}>
        <AppHeader title="Sélection de Pompe" subtitle={stationDisplay} />
      </View>

      {actionError && (
        <View style={styles.toastWrapper}>
          <InlineToast
            message={actionError}
            type={actionError.toLowerCase().includes("déjà utilisée") ? "warning" : "error"}
          />
          {actionError.toLowerCase().includes("déjà utilisée") && (
            <Button label="Actualiser la liste" variant="secondary" onPress={() => void onRefresh()} />
          )}
        </View>
      )}

      {pumps.length === 0 ? (
        <EmptyState title="Aucune pompe disponible" description="Toutes les pompes de cette station sont hors ligne ou occupées." />
      ) : (
        <FlatList
          data={pumps}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.rowGrid}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void onRefresh()} />}
          renderItem={({ item }) => {
            const isCurrentStarting = startingPumpId === item.id;
            return (
              <TouchableOpacity
                style={[styles.pumpCard, isCurrentStarting && styles.pumpCardDisabled]}
                onPress={() => void onSelectPump(item)}
                disabled={Boolean(startingPumpId)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.pumpCodeText}>{item.pumpCode || "-"}</Text>
                  <View style={[styles.fuelBadge, getFuelBadgeStyle(item.fuelType)]}>
                    <Text style={styles.fuelBadgeText}>{item.fuelType || "-"}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.pumpLabelText} numberOfLines={1}>
                    {item.label || "Pompe"}
                  </Text>
                  {isCurrentStarting ? (
                    <ActivityIndicator size="small" color="#0F9D58" style={styles.loader} />
                  ) : (
                    <Text style={styles.actionText}>Activer →</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.footerContainer}>
        <Text style={styles.helpText}>Sélectionnez votre pompe pour ouvrir votre session de distribution.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.sm,
  },
  toastWrapper: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  listContainer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  rowGrid: {
    justifyContent: "space-between",
    gap: spacing.md,
  },
  pumpCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: spacing.md,
    height: 125,
    justifyContent: "space-between",
    // Ombres élégantes style iOS / Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0", // Border grise très claire subtile
  },
  pumpCardDisabled: {
    opacity: 0.6,
    borderColor: "#0F9D58", // Bordure verte YELY quand elle s'active
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pumpCodeText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
  },
  fuelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fuelBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  // Couleurs des badges de carburant dynamiques
  badgeSuper: {
    backgroundColor: "#FEF3C7", // Orange/Ambre ultra-léger
  },
  badgeGasoil: {
    backgroundColor: "#E0F2FE", // Bleu ciel ultra-léger
  },
  badgeDefault: {
    backgroundColor: "#F1F5F9",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  pumpLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F9D58", // Ton vert YELY en signature d'action
  },
  loader: {
    transform: [{ scale: 0.8 }],
  },
  footerContainer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  helpText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
