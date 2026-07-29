import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://luunzeonlmzvmewaucqj.supabase.co";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "wipeprotocol@copycloud.me";
const WIPE_HOURS = 24;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  // Verify the user's JWT and enforce admin-only access
  const anonClient = createClient(SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser(token);
  if (authError || !user || user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const adminClient = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const cutoff = new Date(Date.now() - WIPE_HOURS * 60 * 60 * 1000).toISOString();

  // Fetch all expired clips
  const { data: expired, error: fetchError } = await adminClient
    .from("clips")
    .select("code, content, type")
    .lt("created_at", cutoff);

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  if (!expired || expired.length === 0) {
    return res.status(200).json({ deleted: 0 });
  }

  // Collect all storage paths from file-type clips
  const storagePaths = [];
  for (const clip of expired) {
    if (clip.type === "file") {
      try {
        const paths = JSON.parse(clip.content);
        if (Array.isArray(paths)) storagePaths.push(...paths);
      } catch {
        // Skip malformed content
      }
    }
  }

  // Bulk-delete storage files (if any)
  if (storagePaths.length > 0) {
    const { error: storageError } = await adminClient.storage
      .from("uploads")
      .remove(storagePaths);
    if (storageError) {
      console.error("Storage wipe error:", storageError.message);
    }
  }

  // Delete all expired database records at once
  const { error: deleteError } = await adminClient
    .from("clips")
    .delete()
    .lt("created_at", cutoff);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(200).json({ deleted: expired.length });
}
