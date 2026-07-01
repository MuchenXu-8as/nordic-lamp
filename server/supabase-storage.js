const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.warn('[supabase-storage] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set, using local upload fallback');
      return null;
    }
    
    supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabase;
}

async function uploadFile(fileBuffer, filename, mimeType) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client not initialized');
  }

  const ext = filename.split('.').pop().toLowerCase() || 'bin';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const storagePath = `uploads/${timestamp}${random}.${ext}`;

  const { data, error } = await client.storage
    .from('nordic-lamp-uploads')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('[supabase-storage] Upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = client.storage
    .from('nordic-lamp-uploads')
    .getPublicUrl(storagePath);

  return {
    url: publicUrl,
    filename: storagePath,
    size: fileBuffer.length
  };
}

async function deleteFile(storagePath) {
  const client = getSupabase();
  if (!client) {
    return { ok: true };
  }

  const { error } = await client.storage
    .from('nordic-lamp-uploads')
    .remove([storagePath]);

  if (error) {
    console.error('[supabase-storage] Delete error:', error);
    return { ok: false, error };
  }

  return { ok: true };
}

module.exports = {
  getSupabase,
  uploadFile,
  deleteFile
};