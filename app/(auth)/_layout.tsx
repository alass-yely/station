import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/auth-context";
import { FullscreenLoading } from "@/components/ui/fullscreen-loading";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullscreenLoading message="Vérification de session..." />;
  if (isAuthenticated) return <Redirect href="/dashboard" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
