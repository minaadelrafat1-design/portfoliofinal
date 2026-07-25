import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';

const STORAGE_KEY = 'portfolio_admin_session';

interface AdminAuthState {
  isUnlocked: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  // The password itself is never sent to or stored by the client — only the
  // result of the check. Verification (including hashing and lockout after
  // repeated failures) happens server-side in Postgres via the
  // verify_admin_password() function, so the real password never ships in
  // the built JS bundle.
  const unlock = useCallback(async (password: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('verify_admin_password', {
      p_password: password,
    });

    if (error || !data) return false;

    setIsUnlocked(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    return true;
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
