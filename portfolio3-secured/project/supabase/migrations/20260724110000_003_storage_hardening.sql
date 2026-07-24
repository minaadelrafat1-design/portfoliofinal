/*
# Storage bucket hardening

The `portfolio-media` bucket previously accepted any file type/size from
the anon role. This constrains it at the storage layer to the same
image/video types and size limits enforced in the client, so uploads are
validated server-side too (client-side checks alone can be bypassed by
anyone calling the Supabase API directly with the public anon key).

No existing tables, columns, or policies are changed — only the bucket's
own `file_size_limit` and `allowed_mime_types` are set.
*/

UPDATE storage.buckets
SET
  file_size_limit = 104857600, -- 100MB (covers video uploads; images are far smaller)
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ]
WHERE id = 'portfolio-media';
