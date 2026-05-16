import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";
import { colors, iconSizes } from "@/theme";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullscreenLoading message="Chargement de l'espace station..." />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontWeight: "700", fontSize: 12 },
        tabBarStyle: { height: 68, paddingBottom: 8, paddingTop: 8 }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={iconSizes.tab} />
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
      <Tabs.Screen name="transaction/new" options={{ href: null }} />
    </Tabs>
  );
}
