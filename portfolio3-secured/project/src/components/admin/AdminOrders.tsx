import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, MailOpen, Mail as MailIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchOrders } from '@/lib/api';
import type { Order } from '@/lib/types';

export function AdminOrders({ onReadChange }: { onReadChange: (unread: number) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    const o = await fetchOrders();
    setOrders(o);
    onReadChange(o.filter((x) => !x.is_read).length);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markRead = async (o: Order) => {
    await supabase.from('orders').update({ is_read: true }).eq('id', o.id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
    setSelected(null);
    load();
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-slate-400">No orders yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => { setSelected(o); if (!o.is_read) markRead(o); }}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selected?.id === o.id ? 'border-primary bg-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{o.name}</span>
                  {!o.is_read ? <MailIcon size={14} className="text-primary" /> : <MailOpen size={14} className="text-slate-500" />}
                </div>
                <p className="mt-1 truncate text-xs text-primary">{o.service_title}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{o.message}</p>
                <p className="mt-1 text-xs text-slate-600">{new Date(o.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <ShoppingBag size={12} /> {selected.service_title}
                    </div>
                    <h2 className="font-heading text-lg font-semibold">{selected.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{selected.email}</p>
                    <p className="text-xs text-slate-600">{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:border-primary">
                      <MailIcon size={12} /> Reply
                    </a>
                    <button onClick={() => del(selected.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
                <p className="mt-6 whitespace-pre-wrap text-sm text-slate-300">{selected.message}</p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800 p-12 text-slate-500">
                Select an order to read it
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
