import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { getMe, loginStationStaff } from "@/lib/api/auth";
import { clearSession, getSession, saveSession, updateSession } from "@/lib/storage/session";
import { LoginRequest, StationSession, StationStaffUser, UserRole } from "@/types/auth";

type AuthContextValue = {
  session: StationSession | null;
  user: StationStaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const isAllowedRole = (role: UserRole): boolean => {
  const normalized = String(role).toUpperCase();
  return ["CASHIER", "STATION_MANAGER", "STATION_OWNER", "YELY_ADMIN"].includes(normalized);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<StationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!session?.accessToken) return;

    const me = await getMe(session.accessToken);
    const next = { ...session, user: me };
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
        const me = await getMe(stored.accessToken);
        const refreshed = { ...stored, user: me };
        await updateSession(refreshed);
        setSession(refreshed);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          await clearSession();
          setSession(null);
          return;
        }

        setSession(stored);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginStationStaff(payload);

    if (!isAllowedRole(response.user.role)) {
      throw new Error("Ce compte n'est pas autorise a utiliser l'application station.");
    }

    const nextSession: StationSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user
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
      login,
      logout,
      restoreSession,
      refreshMe
    }),
    [session, isLoading, login, logout, restoreSession, refreshMe]
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
