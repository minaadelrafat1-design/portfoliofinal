import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderGit2, User, Briefcase, Mail, Settings as SettingsIcon,
  LogOut, Menu, X, ExternalLink, ShoppingBag, FileText,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/adminAuth';

export type AdminTab = 'overview' | 'projects' | 'profile' | 'services' | 'messages' | 'orders' | 'content' | 'settings';

const NAV: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'content', label: 'Site Content', icon: FileText },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

interface AdminLayoutProps {
  active: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  children: ReactNode;
  unreadMessages: number;
  unreadOrders: number;
}

export function AdminLayout({ active, onNavigate, children, unreadMessages, unreadOrders }: AdminLayoutProps) {
  const { lock } = useAdminAuth();
  const [open, setOpen] = useState(false);

  const NavList = () => (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const Icon = n.icon;
        return (
          <button
            key={n.id}
            onClick={() => {
              onNavigate(n.id);
              setOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              active === n.id
                ? 'bg-primary text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Icon size={18} />
            {n.label}
            {n.id === 'messages' && unreadMessages > 0 && (
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {unreadMessages}
              </span>
            )}
            {n.id === 'orders' && unreadOrders > 0 && (
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {unreadOrders}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-800 bg-slate-900 p-4 md:flex">
        <div className="mb-8 px-2 font-heading text-lg font-bold">
          Portfolio<span className="text-primary"> Admin</span>
        </div>
        <NavList />
        <div className="mt-auto flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-800"
          >
            <ExternalLink size={16} /> View site
          </a>
          <button
            onClick={lock}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <span className="font-heading font-bold">Portfolio<span className="text-primary"> Admin</span></span>
        <button onClick={() => setOpen((v) => !v)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-slate-800 bg-slate-900 px-4 py-2 md:hidden"
          >
            <NavList />
            <button onClick={lock} className="mt-2 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-400">
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="md:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
