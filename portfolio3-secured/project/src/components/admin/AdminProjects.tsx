import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Copy, Search, X, Star, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchAllProjects } from '@/lib/api';
import type { Project } from '@/lib/types';
import { ImageUpload } from './ImageUpload';
import { VideoUpload } from './VideoUpload';
import { StringListInput } from './StringListInput';
import { ADMIN_INPUT_CLS as inputCls } from '@/lib/ui';

const EMPTY: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  slug: '',
  description: '',
  cover_image_url: null,
  gallery: [],
  video_url: null,
  technologies: [],
  features: [],
  category: null,
  completion_date: null,
  live_demo_url: null,
  github_url: null,
  is_featured: false,
  is_published: false,
};

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setProjects(await fetchAllProjects());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = projects.filter((p) => {
    if (filter === 'published' && !p.is_published) return false;
    if (filter === 'draft' && p.is_published) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  };

  const dup = async (p: Project) => {
    const { id, created_at, updated_at, ...rest } = p;
    await supabase.from('projects').insert({ ...rest, title: `${p.title} (copy)`, slug: null, is_published: false });
    load();
  };

  const togglePub = async (p: Project) => {
    await supabase.from('projects').update({ is_published: !p.is_published }).eq('id', p.id);
    load();
  };

  const toggleFeat = async (p: Project) => {
    await supabase.from('projects').update({ is_featured: !p.is_featured }).eq('id', p.id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Projects</h1>
        <button onClick={() => setCreating(true)} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400">No projects found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <div className="relative aspect-video bg-slate-800">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">No image</div>
                )}
                <div className="absolute right-2 top-2 flex gap-1">
                  {p.is_featured && <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-xs text-black"><Star size={10} className="inline" /></span>}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_published ? 'bg-green-500 text-black' : 'bg-slate-600 text-white'}`}>
                    {p.is_published ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{p.title || 'Untitled'}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setEditing(p)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs hover:border-primary">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => togglePub(p)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs hover:border-primary">
                    {p.is_published ? <EyeOff size={12} /> : <Eye size={12} />} {p.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => toggleFeat(p)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs hover:border-primary">
                    <Star size={12} /> Feature
                  </button>
                  <button onClick={() => dup(p)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs hover:border-primary">
                    <Copy size={12} /> Dup
                  </button>
                  <button onClick={() => del(p.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-900 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(editing || creating) && (
          <ProjectEditor
            project={editing}
            onClose={() => { setEditing(null); setCreating(false); }}
            onSaved={() => { setEditing(null); setCreating(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectEditor({ project, onClose, onSaved }: { project: Project | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...(project ?? EMPTY), id: project?.id });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = { ...form, slug: slug || null, completion_date: form.completion_date || null };
      if (form.id) {
        await supabase.from('projects').update(payload).eq('id', form.id);
      } else {
        const { id, ...rest } = payload;
        await supabase.from('projects').insert(rest);
      }
      onSaved();
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-slate-900 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
            <Field label="Category"><input value={form.category || ''} onChange={(e) => set('category', e.target.value || null)} className={inputCls} placeholder="e.g. Web App" /></Field>
          </div>
          <Field label="Slug (optional)"><input value={form.slug || ''} onChange={(e) => set('slug', e.target.value)} className={inputCls} placeholder="auto-generated from title" /></Field>
          <Field label="Description"><textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} /></Field>
          <ImageUpload label="Cover image" value={form.cover_image_url} onChange={(v) => set('cover_image_url', v)} />
          <VideoUpload label="Video" value={form.video_url} onChange={(v) => set('video_url', v)} />
          <StringListInput label="Gallery image URLs" values={form.gallery} onChange={(v) => set('gallery', v)} placeholder="Paste image URL and press Enter" />
          <StringListInput label="Technologies" values={form.technologies} onChange={(v) => set('technologies', v)} placeholder="e.g. React" />
          <StringListInput label="Features" values={form.features} onChange={(v) => set('features', v)} placeholder="e.g. User auth" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Live demo URL"><input value={form.live_demo_url || ''} onChange={(e) => set('live_demo_url', e.target.value || null)} className={inputCls} /></Field>
            <Field label="GitHub URL"><input value={form.github_url || ''} onChange={(e) => set('github_url', e.target.value || null)} className={inputCls} /></Field>
          </div>
          <Field label="Completion date"><input type="date" value={form.completion_date || ''} onChange={(e) => set('completion_date', e.target.value || null)} className={inputCls} /></Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="accent-primary" />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="accent-primary" />
              Featured
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}
