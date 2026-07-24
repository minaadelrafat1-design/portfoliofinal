export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  profile_image_url: string | null;
  resume_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  fiverr_url: string | null;
  contra_url: string | null;
  github_url: string | null;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string | null;
  percentage: number;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  icon: string | null;
  title: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  cover_image_url: string | null;
  gallery: string[];
  video_url: string | null;
  technologies: string[];
  features: string[];
  category: string | null;
  completion_date: string | null;
  live_demo_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Settings {
  id: string;
  theme: 'dark' | 'light';
  primary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  updated_at: string;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  service_title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteContent {
  key: string;
  value: string;
}

export type SiteContentMap = Record<string, string>;

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'UI/UX'
  | 'Databases'
  | 'AI Tools'
  | 'Deployment';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Frontend',
  'Backend',
  'UI/UX',
  'Databases',
  'AI Tools',
  'Deployment',
];
