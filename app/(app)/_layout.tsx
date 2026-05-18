import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { colors, iconSizes } from "@/theme";

export default function AppLayout() {
  const { isAuthenticated, isLoading, mustSelectPump, user } = useAuth();
  const pathname = usePathname();
  const isOnPumpRoute = pathname === "/pump" || pathname.startsWith("/pump") || pathname.startsWith("/(app)/pump");
  const role = String(user?.role || "").toUpperCase();
  const isCashier = role === "CASHIER";

  if (isLoading) return <FullscreenLoading message="Chargement de l'espace station..." />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  if (mustSelectPump && !isOnPumpRoute) {
    // Workaround Expo Router typed routes pour route runtime /pump.
    return <Redirect href={"/(app)/pump" as never} />;
  }

  if (!mustSelectPump && isOnPumpRoute) {
    return <Redirect href={"/(app)/scan" as never} />;
  }

  if (isCashier && (pathname === "/dashboard" || pathname === "/(app)/dashboard")) {
    return <Redirect href={"/(app)/scan" as never} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: "700", fontSize: 12 },
        tabBarStyle: { height: 68, paddingBottom: 8, paddingTop: 8, backgroundColor: colors.surface, borderTopColor: colors.border }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: isCashier ? "Service" : "Accueil",
          href: isCashier ? "/(app)/pump" : "/dashboard",
          tabBarIcon: ({ color }) => <Ionicons name={isCashier ? "construct" : "home"} color={color} size={iconSizes.tab} />
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => <Ionicons name="scan-circle" color={color} size={iconSizes.tabScan} />
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Historique",
          href: "/(app)/transactions",
          tabBarIcon: ({ color }) => <Ionicons name="time" color={color} size={iconSizes.tab} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={iconSizes.tab} />
        }}
      />
      <Tabs.Screen name="pump/index" options={{ href: null }} />
      <Tabs.Screen name="transaction/new" options={{ href: null }} />
      <Tabs.Screen name="transaction/[id]" options={{ href: null }} />
    </Tabs>
  );
}
