import { useEffect, useState } from 'react';
import { Save, CheckCircle2, Sun, Moon, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchSettings } from '@/lib/api';
import { useSettings } from '@/lib/settings';
import type { Settings } from '@/lib/types';
import { ADMIN_INPUT_CLS as inputCls } from '@/lib/ui';

const FONTS = ['Inter', 'Poppins', 'Playfair Display', 'Space Grotesk', 'JetBrains Mono'];

export function AdminSettings() {
  const { apply } = useSettings();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    (async () => setSettings(await fetchSettings()))();
  }, []);

  const changePassword = async () => {
    setPwError('');
    setPwSuccess(false);

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setPwSaving(true);
    const { data, error } = await supabase.rpc('change_admin_password', {
      p_current: currentPassword,
      p_new: newPassword,
    });
    setPwSaving(false);

    if (error) {
      setPwError(error.message || 'Could not change password. Please try again.');
      return;
    }
    if (!data) {
      setPwError('Current password is incorrect.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const set = (k: keyof Settings, v: string) => {
    const updated = settings ? { ...settings, [k]: v } : settings;
    setSettings(updated);
    if (updated) apply(updated);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from('settings').update({
      theme: settings.theme, primary_color: settings.primary_color,
      accent_color: settings.accent_color, font_heading: settings.font_heading,
      font_body: settings.font_body, updated_at: new Date().toISOString(),
    }).eq('id', settings.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!settings) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <button onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60">
          {saving ? 'Saving...' : <><Save size={16} /> Save</>}
        </button>
      </div>
      {saved && <p className="mb-4 inline-flex items-center gap-1.5 text-sm text-green-400"><CheckCircle2 size={16} /> Saved</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 font-heading font-semibold">Theme</h2>
          <div className="flex gap-3">
            <button
              onClick={() => set('theme', 'light')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${settings.theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-700'}`}
            >
              <Sun size={16} /> Light
            </button>
            <button
              onClick={() => set('theme', 'dark')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${settings.theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-700'}`}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 font-heading font-semibold">Colors</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Primary color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.primary_color} onChange={(e) => set('primary_color', e.target.value)} className="h-10 w-14 rounded border border-slate-700 bg-transparent" />
                <input value={settings.primary_color} onChange={(e) => set('primary_color', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Accent color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.accent_color} onChange={(e) => set('accent_color', e.target.value)} className="h-10 w-14 rounded border border-slate-700 bg-transparent" />
                <input value={settings.accent_color} onChange={(e) => set('accent_color', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 font-heading font-semibold">Fonts</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Heading font</label>
              <select value={settings.font_heading} onChange={(e) => set('font_heading', e.target.value)} className={inputCls}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Body font</label>
              <select value={settings.font_body} onChange={(e) => set('font_body', e.target.value)} className={inputCls}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading font-semibold">
            <KeyRound size={18} /> Admin Password
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
            </div>
            {pwError && <p className="text-sm text-red-400">{pwError}</p>}
            {pwSuccess && (
              <p className="inline-flex items-center gap-1.5 text-sm text-green-400">
                <CheckCircle2 size={16} /> Password updated
              </p>
            )}
            <button
              onClick={changePassword}
              disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {pwSaving ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 font-heading font-semibold">Preview</h2>
          <div className="space-y-3">
            <h3 className="font-heading text-2xl font-bold gradient-text">Your Name</h3>
            <p className="text-sm text-slate-400">This is how your body text will look with the selected font and colors.</p>
            <button className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">Primary Button</button>
          </div>
        </div>
      </div>
    </div>
  );
}
