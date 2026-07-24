import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/Section';
import type { Service } from '@/lib/types';
import { useSiteContent } from '@/lib/siteContent';
import { insertOrder } from '@/lib/api';
import { validateContactForm, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH } from '@/lib/validation';

export function Services({ services }: { services: Service[] }) {
  const { t } = useSiteContent();
  const [orderService, setOrderService] = useState<Service | null>(null);

  return (
    <Section id="services" title={t('services_title', 'Services')} subtitle={t('services_subtitle', 'How I can help your business')}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => {
          const LucideIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon || 'Star'] || Icons.Star;
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => setOrderService(s)}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                <LucideIcon size={24} />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{s.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t('services_order_button', 'Request Service')}
                <Icons.ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {orderService && (
          <OrderModal service={orderService} onClose={() => setOrderService(null)} />
        )}
      </AnimatePresence>
    </Section>
  );
}

function OrderModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const { t } = useSiteContent();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateContactForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await insertOrder({
        name: form.name.trim(),
        email: form.email.trim(),
        service_title: service.title,
        message: form.message.trim(),
      });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold">{t('services_order_heading', 'Request this service')}</h2>
            <p className="mt-1 text-sm text-primary font-medium">{service.title}</p>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={48} className="text-primary" />
            <p className="font-heading text-lg font-semibold">Request sent!</p>
            <p className="text-sm text-slate-500">{t('contact_success', 'Thank you for reaching out. I will reply to you shortly.')}</p>
            <button type="button" onClick={onClose} className="mt-2 text-sm font-medium text-primary">Close</button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {t('services_order_subheading', 'Tell me about your project and I will get back to you within 24 hours.')}
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <input required maxLength={MAX_NAME_LENGTH} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              <input required type="email" maxLength={MAX_EMAIL_LENGTH} placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              <textarea required rows={4} maxLength={MAX_MESSAGE_LENGTH} placeholder="Tell me about your project..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={sending} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60">
                <Send size={16} /> {sending ? 'Sending...' : t('services_order_button', 'Request Service')}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
