import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://luunzeonlmzvmewaucqj.supabase.co";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "wipeprotocol@copycloud.me";

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

  const { code } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: "Missing clip code" });
  }

  const adminClient = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch the clip first to check if it has storage files
  const { data: clip, error: fetchError } = await adminClient
    .from("clips")
    .select("content, type")
    .eq("code", code)
    .single();

  if (fetchError || !clip) {
    return res.status(404).json({ error: "Clip not found" });
  }

  // If it's a file clip, delete the associated storage objects
  if (clip.type === "file") {
    try {
      const paths = JSON.parse(clip.content);
      if (Array.isArray(paths) && paths.length > 0) {
        const { error: storageError } = await adminClient.storage
          .from("uploads")
          .remove(paths);
        if (storageError) {
          console.error("Storage delete error:", storageError.message);
        }
      }
    } catch {
      // Content is not valid JSON — skip storage deletion
    }
  }

  // Delete the database record
  const { error: deleteError } = await adminClient
    .from("clips")
    .delete()
    .eq("code", code);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(200).json({ success: true });
}
