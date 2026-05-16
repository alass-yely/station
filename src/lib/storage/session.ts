import AsyncStorage from "@react-native-async-storage/async-storage";
import { StationSession } from "@/types/auth";

const SESSION_KEY = "@yely_station/session";

const isValidSession = (value: unknown): value is StationSession => {
  if (typeof value !== "object" || value === null) return false;
  const session = value as StationSession;

  return Boolean(
    session.accessToken &&
      session.refreshToken &&
      session.user?.id &&
      session.user?.phone &&
      session.user?.role
  );
};

export const saveSession = async (session: StationSession): Promise<void> => {
  if (!isValidSession(session)) {
    throw new Error("Session invalide");
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = async (): Promise<StationSession | null> => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSession(parsed)) {
      await clearSession();
      return null;
    }

    return parsed;
  } catch {
    await clearSession();
    return null;
  }
};

export const updateSession = async (session: StationSession): Promise<StationSession> => {
  await saveSession(session);
  return session;
};

export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
