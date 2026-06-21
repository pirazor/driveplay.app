import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SafetyState {
  /** Has the user confirmed (via hold-to-confirm) they are a passenger? */
  confirmed: boolean;
  confirmPassenger: () => void;
  reset: () => void;
}

const SafetyContext = createContext<SafetyState | null>(null);

const STORAGE_KEY = 'car_passenger_confirmed_at';
/** Re-prompt after this long, so confirmation isn't permanent. */
const CONFIRM_TTL_MS = 1000 * 60 * 60 * 4;

function readInitial(): boolean {
  try {
    const ts = Number(sessionStorage.getItem(STORAGE_KEY));
    return Boolean(ts) && Date.now() - ts < CONFIRM_TTL_MS;
  } catch {
    return false;
  }
}

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [confirmed, setConfirmed] = useState<boolean>(readInitial);

  const confirmPassenger = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setConfirmed(true);
  }, []);

  const reset = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setConfirmed(false);
  }, []);

  return (
    <SafetyContext.Provider value={{ confirmed, confirmPassenger, reset }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety(): SafetyState {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used within SafetyProvider');
  return ctx;
}
