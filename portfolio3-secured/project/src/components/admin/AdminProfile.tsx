import { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/api';
import type { Profile } from '@/lib/types';
import { ImageUpload } from './ImageUpload';
import { ADMIN_INPUT_CLS as inputCls } from '@/lib/ui';

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => setProfile(await fetchProfile()))();
  }, []);

  const set = (k: keyof Profile, v: string | null) => setProfile((p) => (p ? { ...p, [k]: v } : p));

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profile').update({
      name: profile.name, title: profile.title, bio: profile.bio,
      profile_image_url: profile.profile_image_url, resume_url: profile.resume_url,
      email: profile.email, phone: profile.phone, location: profile.location,
      linkedin_url: profile.linkedin_url, fiverr_url: profile.fiverr_url,
      contra_url: profile.contra_url, github_url: profile.github_url,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!profile) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
        <button onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
          {saving ? 'Saving...' : <><Save size={16} /> Save</>}
        </button>
      </div>
      {saved && <p className="mb-4 inline-flex items-center gap-1.5 text-sm text-green-400"><CheckCircle2 size={16} /> Saved</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-heading font-semibold">Basic Info</h2>
          <Field label="Name"><input value={profile.name} onChange={(e) => set('name', e.target.value)} className={inputCls} /></Field>
          <Field label="Professional title"><input value={profile.title} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          <Field label="Bio"><textarea rows={4} value={profile.bio} onChange={(e) => set('bio', e.target.value)} className={inputCls} /></Field>
          <ImageUpload label="Profile image" value={profile.profile_image_url} onChange={(v) => set('profile_image_url', v)} />
          <Field label="Resume URL (PDF link)"><input value={profile.resume_url || ''} onChange={(e) => set('resume_url', e.target.value || null)} className={inputCls} placeholder="https://..." /></Field>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-heading font-semibold">Contact & Social</h2>
          <Field label="Email"><input value={profile.email || ''} onChange={(e) => set('email', e.target.value || null)} className={inputCls} /></Field>
          <Field label="Phone"><input value={profile.phone || ''} onChange={(e) => set('phone', e.target.value || null)} className={inputCls} /></Field>
          <Field label="Location"><input value={profile.location || ''} onChange={(e) => set('location', e.target.value || null)} className={inputCls} /></Field>
          <Field label="LinkedIn URL"><input value={profile.linkedin_url || ''} onChange={(e) => set('linkedin_url', e.target.value || null)} className={inputCls} /></Field>
          <Field label="GitHub URL"><input value={profile.github_url || ''} onChange={(e) => set('github_url', e.target.value || null)} className={inputCls} /></Field>
          <Field label="Fiverr URL"><input value={profile.fiverr_url || ''} onChange={(e) => set('fiverr_url', e.target.value || null)} className={inputCls} /></Field>
          <Field label="Contra URL"><input value={profile.contra_url || ''} onChange={(e) => set('contra_url', e.target.value || null)} className={inputCls} /></Field>
        </div>
      </div>
    </div>
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
