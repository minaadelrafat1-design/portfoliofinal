import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SettingsProvider } from '@/lib/settings';
import { SiteContentProvider } from '@/lib/siteContent';
import { AdminAuthProvider } from '@/lib/adminAuth';
import { PublicSite } from '@/pages/PublicSite';
import { LoadingScreen } from '@/components/LoadingScreen';

const AdminApp = lazy(() => import('@/pages/AdminApp').then((m) => ({ default: m.AdminApp })));

export default function App() {
  return (
    <SettingsProvider>
      <SiteContentProvider>
        <AdminAuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PublicSite />} />
              <Route path="/admin" element={<Suspense fallback={<LoadingScreen />}><AdminApp /></Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
        </AdminAuthProvider>
      </SiteContentProvider>
    </SettingsProvider>
  );
}
