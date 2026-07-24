import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchSiteContent } from './api';
import type { SiteContentMap } from './types';

interface ContentState {
  content: SiteContentMap;
  loading: boolean;
  t: (key: string, fallback: string) => string;
}

const ContentContext = createContext<ContentState | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const map = await fetchSiteContent();
        if (active) {
          setContent(map);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const t = (key: string, fallback: string) => content[key] ?? fallback;

  return (
    <ContentContext.Provider value={{ content, loading, t }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useSiteContent must be used within SiteContentProvider');
  return ctx;
}
