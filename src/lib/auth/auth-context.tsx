import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getMe, loginDriver, registerDriver } from '../api/auth';
import { ApiError } from '../../types/api';
import {
  DriverRegisterRequest,
  DriverSession,
  LoginRequest,
  User,
} from '../../types/auth';
import { clearSession, getSession, saveSession, updateSession } from '../storage/session';

type AuthContextValue = {
  session: DriverSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: DriverRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DriverSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const refreshed: DriverSession = {
          ...stored,
          user: me,
        };
        setSession(refreshed);
        await updateSession(refreshed);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError?.status === 401 || apiError?.status === 403) {
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

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (payload: LoginRequest) => {
    const result = await loginDriver(payload);
    const nextSession: DriverSession = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
    await saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const register = useCallback(async (payload: DriverRegisterRequest) => {
    const result = await registerDriver(payload);
    const nextSession: DriverSession = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
    await saveSession(nextSession);
    setSession(nextSession);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    const me = await getMe(session.accessToken);
    const nextSession: DriverSession = {
      ...session,
      user: me,
    };
    await updateSession(nextSession);
    setSession(nextSession);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      login,
      register,
      logout,
      restoreSession,
      refreshMe,
    }),
    [isLoading, login, logout, refreshMe, register, restoreSession, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
