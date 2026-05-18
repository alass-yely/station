import { ApiError } from "@/lib/api/client";

const extractRawMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const payload = (error.payload || {}) as { message?: string; error?: string };
    return `${payload.message || ""} ${payload.error || ""} ${error.message || ""}`.trim();
  }

  if (error instanceof Error) return error.message;
  return "";
};

export const isAuthExpiredError = (error: unknown): boolean => {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return true;
  }

  const msg = extractRawMessage(error).toLowerCase();
  return msg.includes("token") && (msg.includes("expired") || msg.includes("invalid"));
};

export const mapRuntimeErrorMessage = (error: unknown, fallback: string): string => {
  if (isAuthExpiredError(error)) return "Votre session a expiré.";

  const msg = extractRawMessage(error).toLowerCase();
  if (msg.includes("no open work session")) {
    return "Aucune session ouverte. Sélectionnez une pompe.";
  }
  if (msg.includes("pump must be active")) {
    return "Pompe indisponible. Choisissez une autre pompe.";
  }
  if (msg.includes("already used") || msg.includes("occupied") || msg.includes("already occupied")) {
    return "Cette pompe est déjà utilisée. Choisissez une autre pompe.";
  }
  if (msg.includes("network") || msg.includes("connexion réseau") || msg.includes("impossible de contacter")) {
    return "Réseau indisponible. Réessayez.";
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
