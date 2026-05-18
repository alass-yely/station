import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getMe, loginStationStaff } from "@/lib/api/auth";
import { closeWorkSession, getCurrentWorkSession } from "@/lib/api/work-sessions";
import { clearSession, getSession, saveSession, updateSession } from "@/lib/storage/session";
import { isAuthExpiredError } from "@/lib/utils/runtime-errors";
import { LoginRequest, StationSession, StationStaffUser, UserRole } from "@/types/auth";
import { WorkSessionSummary } from "@/types/work-session";

type AuthContextValue = {
  session: StationSession | null;
  user: StationStaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustSelectPump: boolean;
  hasOpenWorkSession: boolean;
  authNotice: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshMe: () => Promise<void>;
  applyWorkSessionRuntime: (workSession: WorkSessionSummary | null, mustSelectPump: boolean) => Promise<void>;
  closeCurrentWorkSession: () => Promise<void>;
  consumeAuthNotice: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isAllowedRole = (role: UserRole): boolean => {
  const normalized = String(role).toUpperCase();
  return ["CASHIER", "STATION_MANAGER", "STATION_OWNER", "YELY_ADMIN"].includes(normalized);
};

const isSessionAlreadyClosedError = (error: ApiError): boolean => {
  const payload = (error.payload || {}) as { message?: string; error?: string };
  const message = `${payload.message || ""} ${payload.error || ""}`.toLowerCase();

  return error.status === 404 || message.includes("already closed") || message.includes("not open");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<StationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const consumeAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const applyWorkSessionRuntime = useCallback(
    async (workSession: WorkSessionSummary | null, mustSelectPump: boolean) => {
      if (!session) return;

      const next = {
        ...session,
        currentWorkSession: workSession,
        mustSelectPump
      };

      await updateSession(next);
      setSession(next);
    },
    [session]
  );

  const closeCurrentWorkSession = useCallback(async () => {
    if (!session?.accessToken) {
      throw new Error("Session invalide. Reconnectez-vous.");
    }

    const currentId = session.currentWorkSession?.id;
    if (!currentId) {
      await applyWorkSessionRuntime(null, true);
      return;
    }

    try {
      await closeWorkSession(currentId, session.accessToken);
      await applyWorkSessionRuntime(null, true);
    } catch (error) {
      if (isAuthExpiredError(error)) {
        setAuthNotice("Votre session a expiré.");
        await logout();
        throw new Error("Votre session a expiré.");
      }

      if (error instanceof ApiError && isSessionAlreadyClosedError(error)) {
        await applyWorkSessionRuntime(null, true);
        return;
      }
      throw error;
    }
  }, [session, applyWorkSessionRuntime, logout]);

  const refreshMe = useCallback(async () => {
    if (!session?.accessToken) return;

    const me = await getMe(session.accessToken);
    const currentWorkSession = await getCurrentWorkSession(session.accessToken);

    const next = {
      ...session,
      user: me,
      currentWorkSession,
      mustSelectPump: !currentWorkSession
    };

    await updateSession(next);
    setSession(next);
  }, [session]);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const stored = await getSession();
      if (!stored) {
        setSession(null);
        return;
      }

      try {
        const [me, currentWorkSession] = await Promise.all([
          getMe(stored.accessToken),
          getCurrentWorkSession(stored.accessToken)
        ]);

        const refreshed = {
          ...stored,
          user: me,
          currentWorkSession,
          mustSelectPump: !currentWorkSession
        };

        await updateSession(refreshed);
        setSession(refreshed);
      } catch (error) {
        if (isAuthExpiredError(error)) {
          setAuthNotice("Votre session a expiré.");
          await logout();
          return;
        }

        setSession(stored);
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginStationStaff(payload);

    if (!isAllowedRole(response.user.role)) {
      throw new Error("Ce compte n'est pas autorise a utiliser l'application station.");
    }

    const currentWorkSession = await getCurrentWorkSession(response.accessToken);

    const nextSession: StationSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
      station: response.station,
      mustSelectPump: !currentWorkSession,
      currentWorkSession
    };

    await saveSession(nextSession);
    setSession(nextSession);
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      mustSelectPump: Boolean(session?.mustSelectPump),
      hasOpenWorkSession: Boolean(session?.currentWorkSession?.id),
      authNotice,
      login,
      logout,
      restoreSession,
      refreshMe,
      applyWorkSessionRuntime,
      closeCurrentWorkSession,
      consumeAuthNotice
    }),
    [
      session,
      isLoading,
      authNotice,
      login,
      logout,
      restoreSession,
      refreshMe,
      applyWorkSessionRuntime,
      closeCurrentWorkSession,
      consumeAuthNotice
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
