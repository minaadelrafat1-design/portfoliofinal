import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchServices } from '@/lib/api';
import type { Service } from '@/lib/types';
import { ADMIN_INPUT_CLS as inputCls } from '@/lib/ui';

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setServices(await fetchServices());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    await supabase.from('services').insert({
      icon: 'Star', title: 'New Service', description: '', sort_order: services.length,
    });
    load();
  };

  const update = async (id: string, patch: Partial<Service>) => {
    setServices((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await supabase.from('services').update(patch).eq('id', id);
  };

  const del = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    load();
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Services</h1>
        <button onClick={add} className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium">
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2">
              <input value={s.icon || ''} onChange={(e) => update(s.id, { icon: e.target.value })} className={`${inputCls} max-w-[140px]`} placeholder="Icon name" />
              <input value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} className={inputCls} placeholder="Title" />
              <button onClick={() => del(s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
            </div>
            <textarea rows={3} value={s.description} onChange={(e) => update(s.id, { description: e.target.value })} className={`${inputCls} mt-2`} placeholder="Description" />
            <input type="number" value={s.sort_order} onChange={(e) => update(s.id, { sort_order: Number(e.target.value) })} className={`${inputCls} mt-2`} placeholder="Order" />
          </div>
        ))}
      </div>
    </div>
  );
}
