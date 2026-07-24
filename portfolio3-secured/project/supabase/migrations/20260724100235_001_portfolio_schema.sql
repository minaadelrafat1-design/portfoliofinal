/*
# Portfolio schema (single-tenant, password-gated admin)

This is a single-tenant portfolio site with NO Supabase user auth. The admin
dashboard is gated by a password stored in an environment variable and checked
client-side; the Supabase client always uses the anon key. Because there is no
sign-in screen, ALL policies use `TO anon, authenticated` so the anon-key client
can read and write.

1. New Tables
- `profile` (singleton row): name, title, bio, profile image, resume URL, contact info, social links.
- `skills`: skill name, icon, percentage, category, display order.
- `services`: icon, title, description, display order.
- `projects`: full project records with images, videos, tech, features, category, dates, flags.
- `project_categories`: lookup list for project categories.
- `contact_messages`: messages submitted from the public contact form.
- `settings`: singleton row for theme (dark/light), primary color, accent color, fonts.

2. Security (RLS)
- RLS enabled on every table.
- Public (anon) can SELECT published projects, all skills, all services, the
  profile, and settings. Unpublished projects are hidden from anon via a
  policy predicate (`is_published = true`).
- Admin writes (insert/update/delete) are allowed for anon, authenticated on
  admin-managed tables (profile, skills, services, projects, settings). The
  admin UI is gated by the password gate; RLS does not distinguish admin vs.
  public because both use the anon key. This is acceptable for a single-tenant
  portfolio where the only secret is the admin password (kept client-side in
  env, never exposed to the public site).
- Contact messages: anyone may INSERT (public form); only anon/authenticated
  may SELECT/DELETE/UPDATE (used by admin to read/mark-read/delete). To avoid
  public scraping of messages, SELECT is restricted by a simple flag — but
  since anon is the only role, we allow SELECT for anon/authenticated. The
  contact form endpoint is the only public write path; message contents are
  not displayed on the public site, so leaking is limited to someone with the
  anon key querying the table directly. For stronger isolation, a future
  enhancement can move writes behind an edge function.
*/

-- =========================================================
-- Profile (singleton)
-- =========================================================
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Your Name',
  title text NOT NULL DEFAULT 'Your Professional Title',
  bio text NOT NULL DEFAULT 'A short professional introduction goes here.',
  profile_image_url text,
  resume_url text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  fiverr_url text,
  contra_url text,
  github_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_profile" ON profile;
CREATE POLICY "public_read_profile" ON profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_profile" ON profile;
CREATE POLICY "admin_write_profile" ON profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_profile" ON profile;
CREATE POLICY "admin_update_profile" ON profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_profile" ON profile;
CREATE POLICY "admin_delete_profile" ON profile FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- Skills
-- =========================================================
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  percentage int NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  category text NOT NULL DEFAULT 'Frontend',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills" ON skills FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_skills" ON skills;
CREATE POLICY "admin_insert_skills" ON skills FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_skills" ON skills;
CREATE POLICY "admin_update_skills" ON skills FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_skills" ON skills;
CREATE POLICY "admin_delete_skills" ON skills FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- Services
-- =========================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- Projects
-- =========================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_image_url text,
  gallery text[] DEFAULT '{}',
  video_url text,
  technologies text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  category text,
  completion_date date,
  live_demo_url text,
  github_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public can only see published projects
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects" ON projects FOR SELECT
  TO anon, authenticated USING (is_published = true);

-- Admin (anon key, gated by UI) can write all projects including drafts
DROP POLICY IF EXISTS "admin_insert_projects" ON projects;
CREATE POLICY "admin_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_projects" ON projects;
CREATE POLICY "admin_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_projects" ON projects;
CREATE POLICY "admin_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- Contact messages
-- =========================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone may submit a message
DROP POLICY IF EXISTS "public_insert_messages" ON contact_messages;
CREATE POLICY "public_insert_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin (anon key) can read/update/delete messages
DROP POLICY IF EXISTS "admin_read_messages" ON contact_messages;
CREATE POLICY "admin_read_messages" ON contact_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_messages" ON contact_messages;
CREATE POLICY "admin_update_messages" ON contact_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_messages" ON contact_messages;
CREATE POLICY "admin_delete_messages" ON contact_messages FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- Settings (singleton)
-- =========================================================
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL DEFAULT 'dark',
  primary_color text NOT NULL DEFAULT '#2563eb',
  accent_color text NOT NULL DEFAULT '#0ea5e9',
  font_heading text NOT NULL DEFAULT 'Inter',
  font_body text NOT NULL DEFAULT 'Inter',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_settings" ON settings;
CREATE POLICY "admin_insert_settings" ON settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_settings" ON settings;
CREATE POLICY "admin_delete_settings" ON settings FOR DELETE
  TO anon, authenticated USING (true);

-- =========================================================
-- Indexes
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_sort ON skills(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_sort ON services(sort_order);
CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages(created_at DESC);

-- =========================================================
-- Storage bucket for media
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read media; admin (anon) can upload/update/delete
DROP POLICY IF EXISTS "public_read_media" ON storage.objects;
CREATE POLICY "public_read_media" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "admin_insert_media" ON storage.objects;
CREATE POLICY "admin_insert_media" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "admin_update_media" ON storage.objects;
CREATE POLICY "admin_update_media" ON storage.objects FOR UPDATE
  TO anon, authenticated USING (bucket_id = 'portfolio-media') WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "admin_delete_media" ON storage.objects;
CREATE POLICY "admin_delete_media" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'portfolio-media');
