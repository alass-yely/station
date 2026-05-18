export const yelyTheme = {
  colors: {
    primary: "#0F9D58",
    text: "#333333",
    background: "#F7F9F8",
    card: "#FFFFFF",
    border: "#E5E7EB",
    muted: "#6B7280",
    danger: "#DC2626",
    warning: "#F59E0B"
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18
  },
  shadow: {
    card: {
      shadowColor: "#000000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2
    }
  }
} as const;
