import { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchSiteContent } from '@/lib/api';
import type { SiteContentMap } from '@/lib/types';
import { ADMIN_INPUT_CLS as inputCls } from '@/lib/ui';

const GROUPS: { label: string; keys: string[] }[] = [
  {
    label: 'Hero Section',
    keys: ['hero_badge', 'hero_intro', 'cta_projects', 'cta_contact'],
  },
  {
    label: 'About Section',
    keys: ['about_title', 'about_subtitle', 'about_summary'],
  },
  {
    label: 'Projects Section',
    keys: ['projects_title', 'projects_subtitle'],
  },
  {
    label: 'Services Section',
    keys: ['services_title', 'services_subtitle', 'services_order_heading', 'services_order_subheading', 'services_order_button'],
  },
  {
    label: 'Contact Section',
    keys: ['contact_title', 'contact_subtitle', 'contact_heading', 'contact_body', 'contact_success'],
  },
  {
    label: 'Navigation & Footer',
    keys: ['nav_home', 'nav_about', 'nav_projects', 'nav_services', 'nav_contact', 'footer_rights'],
  },
];

export function AdminContent() {
  const [content, setContent] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setContent(await fetchSiteContent());
      setLoading(false);
    })();
  }, []);

  const set = (key: string, value: string) => setContent((c) => ({ ...c, [key]: value }));

  const save = async () => {
    setSaving(true);
    const entries = Object.entries(content);
    for (const [key, value] of entries) {
      await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Site Content</h1>
          <p className="mt-1 text-sm text-slate-400">Edit all the text shown on your public website.</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
          {saving ? 'Saving...' : <><Save size={16} /> Save All</>}
        </button>
      </div>
      {saved && <p className="mb-4 inline-flex items-center gap-1.5 text-sm text-green-400"><CheckCircle2 size={16} /> Saved</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 font-heading font-semibold text-primary">{group.label}</h2>
            <div className="space-y-4">
              {group.keys.map((key) => {
                const isLong = key.includes('summary') || key.includes('body') || key.includes('subheading') || key.includes('intro') || key.includes('success');
                return (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{key}</label>
                    {isLong ? (
                      <textarea rows={3} value={content[key] ?? ''} onChange={(e) => set(key, e.target.value)} className={inputCls} />
                    ) : (
                      <input value={content[key] ?? ''} onChange={(e) => set(key, e.target.value)} className={inputCls} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
