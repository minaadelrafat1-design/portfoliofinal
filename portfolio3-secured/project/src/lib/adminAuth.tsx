import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'portfolio_admin_session';
const ATTEMPTS_KEY = 'portfolio_admin_attempts';
const ENV_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

// Basic brute-force throttling (client-side defense in depth only — see
// README / security notes for why this cannot be a substitute for real
// server-side authentication).
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

interface AdminAuthState {
  isUnlocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

function readAttempts(): { count: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return { count: Number(parsed.count) || 0, lockedUntil: Number(parsed.lockedUntil) || 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function writeAttempts(state: { count: number; lockedUntil: number }) {
  try {
    sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const unlock = useCallback((password: string): boolean => {
    // Fail closed: if no admin password has been configured, never allow
    // access rather than silently falling back to a known default.
    if (!ENV_PASSWORD) return false;

    const attempts = readAttempts();
    if (attempts.lockedUntil > Date.now()) return false;

    if (password && password === ENV_PASSWORD) {
      writeAttempts({ count: 0, lockedUntil: 0 });
      setIsUnlocked(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // ignore
      }
      return true;
    }

    const count = attempts.count + 1;
    const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
    writeAttempts({ count: lockedUntil ? 0 : count, lockedUntil });
    return false;
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
