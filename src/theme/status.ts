import { colors } from "./colors";

export const statusColors = {
  pending: colors.warning,
  approved: colors.success,
  rejected: colors.danger,
  cancelled: colors.textMuted
} as const;
