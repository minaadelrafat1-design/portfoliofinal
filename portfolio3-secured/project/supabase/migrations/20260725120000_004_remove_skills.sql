/*
# Remove Skills feature

The Skills section (public site) and Skills manager (admin dashboard) have
been removed from the app. This drops the now-unused `skills` table and its
policies.
*/

DROP POLICY IF EXISTS "public_read_skills" ON skills;
DROP POLICY IF EXISTS "admin_insert_skills" ON skills;
DROP POLICY IF EXISTS "admin_update_skills" ON skills;
DROP POLICY IF EXISTS "admin_delete_skills" ON skills;

DROP TABLE IF EXISTS skills;
