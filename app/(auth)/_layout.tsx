import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, mustSelectPump } = useAuth();

  if (isLoading) return <FullscreenLoading message="Vérification de session..." />;
  if (isAuthenticated) {
    // Workaround Expo Router typed routes pour routes runtime.
    return <Redirect href={(mustSelectPump ? "/(app)/pump" : "/(app)/scan") as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
