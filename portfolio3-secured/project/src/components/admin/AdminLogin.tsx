import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '@/lib/adminAuth';

export function AdminLogin() {
  const { unlock } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlock(password);
    if (!ok) setError(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={26} />
          </div>
          <h1 className="font-heading text-xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your password to continue</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            className={`w-full rounded-xl border bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors ${
              error ? 'border-red-500' : 'border-slate-700 focus:border-primary'
            }`}
          />
          {error && <p className="text-sm text-red-500">Incorrect password. Try again.</p>}
          <button
            type="submit"
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            Unlock <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
