import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import type { Settings } from './types';

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  apply: (s: Settings) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

const DEFAULTS: Settings = {
  id: '',
  theme: 'dark',
  primary_color: '#2563eb',
  accent_color: '#0ea5e9',
  font_heading: 'Inter',
  font_body: 'Inter',
  updated_at: '',
};

function applyToDocument(s: Settings) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', s.primary_color);
  root.style.setProperty('--color-accent', s.accent_color);
  root.style.setProperty('--font-heading', `'${s.font_heading}', sans-serif`);
  root.style.setProperty('--font-body', `'${s.font_body}', sans-serif`);
  if (s.theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .maybeSingle();
      if (active) {
        const s = data ?? DEFAULTS;
        setSettings(s);
        applyToDocument(s);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const apply = (s: Settings) => {
    setSettings(s);
    applyToDocument(s);
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, apply }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
