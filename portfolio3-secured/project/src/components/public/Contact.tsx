import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Send, CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/Section';
import type { Profile } from '@/lib/types';
import { insertMessage } from '@/lib/api';
import { useSiteContent } from '@/lib/siteContent';
import { validateContactForm, MAX_NAME_LENGTH, MAX_EMAIL_LENGTH, MAX_SUBJECT_LENGTH, MAX_MESSAGE_LENGTH } from '@/lib/validation';

export function Contact({ profile }: { profile: Profile | null }) {
  const { t } = useSiteContent();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
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
      await insertMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const socials = [
    { label: 'Email', href: profile?.email ? `mailto:${profile.email}` : null, icon: Mail },
    { label: 'LinkedIn', href: profile?.linkedin_url, icon: Linkedin },
    { label: 'GitHub', href: profile?.github_url, icon: Github },
    { label: 'Fiverr', href: profile?.fiverr_url, icon: Send },
    { label: 'Contra', href: profile?.contra_url, icon: Send },
  ].filter((s) => s.href);

  return (
    <Section id="contact" title={t('contact_title', 'Contact')} subtitle={t('contact_subtitle', 'Let\'s start a conversation')}>
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center gap-4"
        >
          <h3 className="font-heading text-2xl font-bold">{t('contact_heading', 'Get in touch')}</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {t('contact_body', 'Have a project in mind or a question about my services? Send a message and I\'ll respond promptly.')}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary dark:border-slate-700"
                >
                  <Icon size={16} /> {s.label}
                </a>
              );
            })}
          </div>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <CheckCircle2 size={48} className="text-primary" />
              <p className="font-heading text-lg font-semibold">Message sent!</p>
              <p className="text-sm text-slate-500">{t('contact_success', 'Thank you for reaching out. I will reply to you shortly.')}</p>
              <button type="button" onClick={() => setSent(false)} className="mt-2 text-sm font-medium text-primary">
                Send another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
                />
                <input
                  required
                  type="email"
                  maxLength={MAX_EMAIL_LENGTH}
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
                />
              </div>
              <input
                maxLength={MAX_SUBJECT_LENGTH}
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
              />
              <textarea
                required
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Your message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
              >
                <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </Section>
  );
}
