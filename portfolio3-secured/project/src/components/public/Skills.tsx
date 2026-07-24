import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Section } from '@/components/Section';
import type { Skill } from '@/lib/types';
import { SKILL_CATEGORIES } from '@/lib/types';
import { useSiteContent } from '@/lib/siteContent';

function SkillBar({ skill, index }: { skill: Skill; index: number }) {
  const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[skill.icon || 'Code'] || Icons.Code;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LucideIcon size={20} />
        </div>
        <span className="font-medium">{skill.name}</span>
        <span className="ml-auto text-sm font-semibold text-primary">{skill.percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export function Skills({ skills }: { skills: Skill[] }) {
  const { t } = useSiteContent();
  return (
    <Section id="skills" title={t('skills_title', 'Skills')} subtitle={t('skills_subtitle', 'Technologies and tools I work with')}>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {SKILL_CATEGORIES.map((cat) => {
          const items = skills.filter((s) => s.category === cat);
          if (items.length === 0) return null;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-4 font-heading text-lg font-semibold text-primary">{cat}</h3>
              <div className="space-y-3">
                {items.map((s, i) => (
                  <SkillBar key={s.id} skill={s} index={i} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
