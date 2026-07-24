import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, subtitle, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`px-6 py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center md:mb-16"
          >
            <h2 className="font-heading text-3xl font-bold tracking-tight md:text-5xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-slate-500 dark:text-slate-400 md:text-lg">
                {subtitle}
              </p>
            )}
            <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-primary" />
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
