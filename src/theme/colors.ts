import { yelyTheme } from "@/constants/theme";

export const colors = {
  background: yelyTheme.colors.background,
  card: yelyTheme.colors.card,
  surface: yelyTheme.colors.card,
  surfaceMuted: "#EEF3F0",
  text: yelyTheme.colors.text,
  textMuted: yelyTheme.colors.muted,
  muted: yelyTheme.colors.muted,
  primary: yelyTheme.colors.primary,
  primaryContrast: "#FFFFFF",
  accent: yelyTheme.colors.primary,
  border: yelyTheme.colors.border,
  success: yelyTheme.colors.primary,
  warning: yelyTheme.colors.warning,
  danger: yelyTheme.colors.danger,
  info: "#1D4ED8"
} as const;
