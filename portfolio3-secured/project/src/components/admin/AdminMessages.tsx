import { useEffect, useState } from 'react';
import { Trash2, Mail, MailOpen, Mail as MailIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchMessages } from '@/lib/api';
import type { ContactMessage } from '@/lib/types';

export function AdminMessages({ onReadChange }: { onReadChange: (unread: number) => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    const m = await fetchMessages();
    setMessages(m);
    onReadChange(m.filter((x) => !x.is_read).length);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markRead = async (m: ContactMessage) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', m.id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    setSelected(null);
    load();
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold">Messages</h1>
      {messages.length === 0 ? (
        <p className="text-slate-400">No messages yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-1">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); if (!m.is_read) markRead(m); }}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selected?.id === m.id ? 'border-primary bg-slate-800' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{m.name}</span>
                  {!m.is_read ? <Mail size={14} className="text-primary" /> : <MailOpen size={14} className="text-slate-500" />}
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{m.subject || m.message}</p>
                <p className="mt-1 text-xs text-slate-600">{new Date(m.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{selected.subject || '(no subject)'}</h2>
                    <p className="mt-1 text-sm text-slate-400">From: {selected.name} &lt;{selected.email}&gt;</p>
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
                Select a message to read it
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
