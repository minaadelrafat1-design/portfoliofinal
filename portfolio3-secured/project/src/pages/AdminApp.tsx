import { useState } from 'react';
import { useAdminAuth } from '@/lib/adminAuth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminLayout, type AdminTab } from '@/components/admin/AdminLayout';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminProjects } from '@/components/admin/AdminProjects';
import { AdminProfile } from '@/components/admin/AdminProfile';
import { AdminSkills } from '@/components/admin/AdminSkills';
import { AdminServices } from '@/components/admin/AdminServices';
import { AdminMessages } from '@/components/admin/AdminMessages';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminContent } from '@/components/admin/AdminContent';
import { AdminSettings } from '@/components/admin/AdminSettings';

export function AdminApp() {
  const { isUnlocked } = useAdminAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadOrders, setUnreadOrders] = useState(0);

  if (!isUnlocked) return <AdminLogin />;

  return (
    <AdminLayout active={tab} onNavigate={setTab} unreadMessages={unreadMessages} unreadOrders={unreadOrders}>
      {tab === 'overview' && <AdminOverview onNavigate={setTab} />}
      {tab === 'projects' && <AdminProjects />}
      {tab === 'profile' && <AdminProfile />}
      {tab === 'skills' && <AdminSkills />}
      {tab === 'services' && <AdminServices />}
      {tab === 'content' && <AdminContent />}
      {tab === 'messages' && <AdminMessages onReadChange={setUnreadMessages} />}
      {tab === 'orders' && <AdminOrders onReadChange={setUnreadOrders} />}
      {tab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
}
