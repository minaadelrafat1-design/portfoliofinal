import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, X, Calendar, Tag } from 'lucide-react';
import { Section } from '@/components/Section';
import type { Project } from '@/lib/types';
import { useSiteContent } from '@/lib/siteContent';

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useSiteContent();
  const [active, setActive] = useState<Project | null>(null);

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))) as string[]];
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  return (
    <Section id="projects" title={t('projects_title', 'Projects')} subtitle={t('projects_subtitle', 'A selection of recent work')}>
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === c
                ? 'btn-primary'
                : 'border border-slate-300 text-slate-600 hover:border-primary dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <motion.button
            key={p.id}
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            onClick={() => setActive(p)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
              {p.cover_image_url ? (
                <img
                  src={p.cover_image_url}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <Tag size={32} />
                </div>
              )}
              {p.is_featured && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                  Featured
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-heading text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {p.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </Section>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white backdrop-blur hover:bg-black/40"
        >
          <X size={18} />
        </button>

        {project.cover_image_url && (
          <img src={project.cover_image_url} alt={project.title} className="h-64 w-full object-cover" />
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-bold">{project.title}</h3>
            {project.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Tag size={12} /> {project.category}
              </span>
            )}
          </div>

          <p className="mt-3 text-slate-600 dark:text-slate-300">{project.description}</p>

          {project.completion_date && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar size={14} /> Completed {new Date(project.completion_date).toLocaleDateString()}
            </p>
          )}

          {project.video_url && (
            <div className="mt-6">
              <h4 className="mb-2 font-heading font-semibold">Video</h4>
              <video src={project.video_url} controls className="w-full rounded-xl" />
            </div>
          )}

          {project.gallery.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 font-heading font-semibold">Screenshots</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.gallery.map((g, i) => (
                  <img key={i} src={g} alt={`Screenshot ${i + 1}`} loading="lazy" className="rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}

          {project.features.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 font-heading font-semibold">Features</h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {project.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.technologies.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 font-heading font-semibold">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-md bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">{tech}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {project.live_demo_url && (
              <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
                <ExternalLink size={16} /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:border-primary dark:border-slate-700">
                <Github size={16} /> GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
