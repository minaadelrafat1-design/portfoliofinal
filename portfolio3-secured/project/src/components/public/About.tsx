import { motion } from 'framer-motion';
import { Download, User } from 'lucide-react';
import { Section } from '@/components/Section';
import type { Profile } from '@/lib/types';
import { useSiteContent } from '@/lib/siteContent';

export function About({ profile }: { profile: Profile | null }) {
  const { t } = useSiteContent();
  const summary = t('about_summary', profile?.bio || 'A short professional summary goes here.');
  const resume = profile?.resume_url;

  return (
    <Section id="about" title={t('about_title', 'About')} subtitle={t('about_subtitle', 'A brief introduction')}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:p-12"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User size={26} />
        </div>
        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {summary}
        </p>
        {resume && (
          <a
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-105"
          >
            <Download size={18} /> Download CV
          </a>
        )}
      </motion.div>
    </Section>
  );
}
