import type { Profile } from '@/lib/types';
import { useSiteContent } from '@/lib/siteContent';

export function Footer({ profile }: { profile: Profile | null }) {
  const { t } = useSiteContent();
  const year = new Date().getFullYear();
  const name = profile?.name || 'Your Name';
  return (
    <footer className="border-t border-slate-200 px-6 py-8 dark:border-slate-800">
      <div className="mx-auto max-w-6xl text-center text-sm text-slate-500 dark:text-slate-400">
        &copy; {year} {name}. {t('footer_rights', 'All rights reserved.')}
      </div>
    </footer>
  );
}
