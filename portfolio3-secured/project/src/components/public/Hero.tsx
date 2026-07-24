import { motion } from 'framer-motion';
import { FolderGit2, Mail } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { useSiteContent } from '@/lib/siteContent';

export function Hero({ profile }: { profile: Profile | null }) {
  const { t } = useSiteContent();
  const name = profile?.name || 'Your Name';
  const title = profile?.title || 'Your Professional Title';
  const bio = profile?.bio || 'A short professional introduction goes here.';
  const image = profile?.profile_image_url;

  const go = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="order-2 md:order-1"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
          >
            {t('hero_badge', 'Available for new projects')}
          </motion.span>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Hi, I&apos;m <span className="gradient-text">{name}</span>
          </h1>
          <p className="mt-3 font-heading text-xl font-medium text-slate-600 dark:text-slate-300 md:text-2xl">
            {title}
          </p>
          <p className="mt-5 max-w-lg text-slate-600 dark:text-slate-400 md:text-lg">
            {bio}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => go('#projects')}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            >
              <FolderGit2 size={18} /> {t('cta_projects', 'View Projects')}
            </button>
            <button
              onClick={() => go('#contact')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:hover:border-primary dark:hover:text-primary"
            >
              <Mail size={18} /> {t('cta_contact', 'Contact Me')}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="order-1 flex justify-center md:order-2"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-primary to-accent opacity-20 blur-2xl" />
            <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white shadow-2xl dark:border-slate-800 md:h-80 md:w-80">
              {image ? (
                <img src={image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/20 to-accent/20">
                  <span className="font-heading text-6xl font-bold text-primary">
                    {name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
