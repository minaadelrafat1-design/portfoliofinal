import { supabase, STORAGE_BUCKET } from './supabase';
import type { Profile, Service, Project, ContactMessage, Settings, Order, SiteContentMap } from './types';

export async function fetchProfile(): Promise<Profile | null> {
  const { data } = await supabase.from('profile').select('*').maybeSingle();
  return data as Profile | null;
}

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data as Service[];
}

export async function fetchPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function fetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function fetchProject(slug: string): Promise<Project | null> {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  return data as Project | null;
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ContactMessage[];
}

export async function fetchSettings(): Promise<Settings | null> {
  const { data } = await supabase.from('settings').select('*').maybeSingle();
  return data as Settings | null;
}

export async function insertMessage(
  msg: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(msg);
  if (error) throw error;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function insertOrder(
  order: Omit<Order, 'id' | 'is_read' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('orders').insert(order);
  if (error) throw error;
}

export async function fetchSiteContent(): Promise<SiteContentMap> {
  const { data, error } = await supabase.from('site_content').select('key, value');
  if (error) throw error;
  const map: SiteContentMap = {};
  (data as { key: string; value: string }[] | null)?.forEach((r) => {
    map[r.key] = r.value;
  });
  return map;
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
