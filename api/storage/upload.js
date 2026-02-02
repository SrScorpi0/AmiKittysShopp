import { createClient } from '@supabase/supabase-js';
import { readJson } from '../_lib/body.js';
import { requireAdmin } from '../_lib/auth.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    requireAdmin(req);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: 'Supabase storage not configured' });
    return;
  }

  const { fileName, contentType, data } = await readJson(req);
  if (!fileName || !data || !contentType) {
    res.status(400).json({ error: 'Archivo invalido' });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const buffer = Buffer.from(data, 'base64');
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `products/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  res.status(200).json({ url: publicUrl.publicUrl });
}
