import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://luunzeonlmzvmewaucqj.supabase.co";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "wipeprotocol@copycloud.me";

export default async function handler(req, res) {
  if (req.method !== "GET") {
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

  // Fetch all clips with the service-role client (bypasses RLS)
  const adminClient = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data, error } = await adminClient
    .from("clips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
