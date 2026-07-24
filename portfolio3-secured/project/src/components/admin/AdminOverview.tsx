import { useEffect, useState } from 'react';
import { FolderGit2, Mail, Sparkles, Briefcase, Eye, ShoppingBag } from 'lucide-react';
import { fetchAllProjects, fetchMessages, fetchSkills, fetchServices, fetchOrders } from '@/lib/api';
import type { AdminTab } from '@/components/admin/AdminLayout';

export function AdminOverview({ onNavigate }: { onNavigate: (t: AdminTab) => void }) {
  const [stats, setStats] = useState({ projects: 0, published: 0, messages: 0, unread: 0, skills: 0, services: 0, orders: 0, unreadOrders: 0 });

  useEffect(() => {
    (async () => {
      const [p, m, s, sv, o] = await Promise.all([
        fetchAllProjects().catch(() => []),
        fetchMessages().catch(() => []),
        fetchSkills().catch(() => []),
        fetchServices().catch(() => []),
        fetchOrders().catch(() => []),
      ]);
      setStats({
        projects: p.length,
        published: p.filter((x) => x.is_published).length,
        messages: m.length,
        unread: m.filter((x) => !x.is_read).length,
        skills: s.length,
        services: sv.length,
        orders: o.length,
        unreadOrders: o.filter((x) => !x.is_read).length,
      });
    })();
  }, []);

  const cards = [
    { label: 'Total Projects', value: stats.projects, sub: `${stats.published} published`, icon: FolderGit2, tab: 'projects' as AdminTab },
    { label: 'Messages', value: stats.messages, sub: `${stats.unread} unread`, icon: Mail, tab: 'messages' as AdminTab },
    { label: 'Orders', value: stats.orders, sub: `${stats.unreadOrders} new`, icon: ShoppingBag, tab: 'orders' as AdminTab },
    { label: 'Skills', value: stats.skills, icon: Sparkles, tab: 'skills' as AdminTab },
    { label: 'Services', value: stats.services, icon: Briefcase, tab: 'services' as AdminTab },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => onNavigate(c.tab)}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition-colors hover:border-primary"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">{c.label}</span>
                <Icon size={18} className="text-primary" />
              </div>
              <p className="font-heading text-3xl font-bold">{c.value}</p>
              {c.sub && <p className="mt-1 text-xs text-slate-500">{c.sub}</p>}
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('projects')} className="btn-primary rounded-xl px-4 py-2 text-sm font-medium">
            Manage Projects
          </button>
          <button onClick={() => onNavigate('profile')} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium hover:border-primary">
            Edit Profile
          </button>
          <button onClick={() => onNavigate('content')} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium hover:border-primary">
            Edit Site Content
          </button>
          <button onClick={() => onNavigate('settings')} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium hover:border-primary">
            Theme Settings
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium hover:border-primary">
            <Eye size={16} /> View Site
          </a>
        </div>
      </div>
    </div>
  );
}
