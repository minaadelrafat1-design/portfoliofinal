import { useEffect, useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchSkills } from '@/lib/api';
import type { Skill } from '@/lib/types';
import { SKILL_CATEGORIES } from '@/lib/types';
import { ADMIN_INPUT_CLS as inputCls } from '@/lib/ui';

export function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setSkills(await fetchSkills());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    await supabase.from('skills').insert({
      name: 'New Skill', icon: 'Code', percentage: 0, category: 'Frontend', sort_order: skills.length,
    });
    load();
  };

  const update = async (id: string, patch: Partial<Skill>) => {
    setSkills((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await supabase.from('skills').update(patch).eq('id', id);
  };

  const del = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    load();
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Skills</h1>
        <button onClick={add} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={16} /> Add Skill
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SKILL_CATEGORIES.map((cat) => (
          <div key={cat} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 font-heading font-semibold text-primary">{cat}</h2>
            <div className="space-y-3">
              {skills.filter((s) => s.category === cat).map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-slate-600" />
                    <input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} className={inputCls} placeholder="Skill name" />
                    <button onClick={() => del(s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input value={s.icon || ''} onChange={(e) => update(s.id, { icon: e.target.value })} className={inputCls} placeholder="Lucide icon name" />
                    <input type="number" min={0} max={100} value={s.percentage} onChange={(e) => update(s.id, { percentage: Number(e.target.value) })} className={inputCls} />
                  </div>
                  <input type="number" value={s.sort_order} onChange={(e) => update(s.id, { sort_order: Number(e.target.value) })} className={`${inputCls} mt-2`} placeholder="Order" />
                </div>
              ))}
              {skills.filter((s) => s.category === cat).length === 0 && (
                <p className="text-xs text-slate-500">No skills in this category.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
