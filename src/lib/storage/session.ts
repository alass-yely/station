import AsyncStorage from '@react-native-async-storage/async-storage';
import { DriverSession } from '../../types/auth';

const SESSION_KEY = 'yely.driver.session';

function isValidSession(value: DriverSession | null): value is DriverSession {
  return Boolean(
    value &&
      typeof value.accessToken === 'string' &&
      value.accessToken.length > 0 &&
      typeof value.refreshToken === 'string' &&
      value.refreshToken.length > 0 &&
      value.user &&
      typeof value.user.id === 'string' &&
      value.user.id.length > 0 &&
      typeof value.user.phone === 'string' &&
      value.user.phone.length > 0 &&
      typeof value.user.role === 'string' &&
      value.user.role.length > 0,
  );
}

export async function saveSession(session: DriverSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function updateSession(session: DriverSession): Promise<void> {
  await saveSession(session);
}

export async function getSession(): Promise<DriverSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DriverSession;
    if (!isValidSession(parsed)) {
      await clearSession();
      return null;
    }

    return parsed;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
