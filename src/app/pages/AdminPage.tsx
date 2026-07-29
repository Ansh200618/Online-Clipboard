import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  Trash2,
  RefreshCw,
  LogOut,
  Shield,
  Database,
  Flame,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  File,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "wipeprotocol@copycloud.me";

interface Clip {
  id?: string;
  code: string;
  content: string;
  type: "text" | "file";
  created_at: string;
}

function getSnippet(clip: Clip): string {
  if (clip.type === "file") {
    try {
      const paths: string[] = JSON.parse(clip.content);
      if (Array.isArray(paths) && paths.length > 0) {
        const name = paths[0].split("-").slice(2).join("-") || paths[0];
        return paths.length > 1 ? `${name} +${paths.length - 1} more` : name;
      }
    } catch {
      return clip.content.slice(0, 60);
    }
  }
  return clip.content.slice(0, 60) + (clip.content.length > 60 ? "…" : "");
}

function getExpiry(createdAt: string): string {
  const exp = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000);
  return exp.toLocaleString();
}

function isExpired(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() > 24 * 60 * 60 * 1000;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

/* ─── Stat card ─── */
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.04))",
        border: "1px solid rgba(99,102,241,0.15)",
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#818cf8" }}>{icon}</span>
        <span
          style={{
            color: "#475569",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          color: "#f1f5f9",
          fontSize: "1.8rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ color: "#334155", fontSize: "0.72rem" }}>{sub}</div>
      )}
    </div>
  );
}

/* ─── Login Form ─── */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user?.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        toast.error("Access denied. Unauthorised user.");
        navigate("/");
        return;
      }
      onSuccess();
    } catch {
      toast.error("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#030307",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(10,10,20,0.9)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 0 80px rgba(99,102,241,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 30px rgba(99,102,241,0.15)",
            }}
          >
            <Shield size={24} color="#a5b4fc" />
          </div>
          <h1
            style={{
              color: "#f1f5f9",
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            Admin Access
          </h1>
          <p style={{ color: "#334155", fontSize: "0.82rem" }}>
            Restricted to authorised personnel only
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                color: "#475569",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@copycloud.me"
              required
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "12px 16px",
                color: "#f1f5f9",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                color: "#475569",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "12px 44px 12px 16px",
                  color: "#f1f5f9",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#334155",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "13px 0",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
              opacity: loading ? 0.75 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Authenticating…
              </>
            ) : (
              <>
                <Shield size={16} />
                Authenticate
              </>
            )}
          </motion.button>
        </form>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.12)",
          }}
        >
          <AlertTriangle size={13} color="#ef4444" />
          <span style={{ color: "#ef4444", fontSize: "0.72rem", fontWeight: 600 }}>
            Unauthorised access attempts are logged.
          </span>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
function Dashboard({
  session,
  onSignOut,
}: {
  session: any;
  onSignOut: () => void;
}) {
  const [transfers, setTransfers] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [wiping, setWiping] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const authToken = session?.access_token ?? "";

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-transfers", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fetch failed");
      setTransfers(json.data ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleDelete = async (code: string) => {
    setDeletingCode(code);
    try {
      const res = await fetch("/api/admin-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setTransfers((prev) => prev.filter((t) => t.code !== code));
      toast.success(`Transfer ${code} deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeletingCode(null);
    }
  };

  const handleWipe = async () => {
    setWiping(true);
    setConfirmWipe(false);
    try {
      const res = await fetch("/api/admin-wipe", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Wipe failed");
      toast.success(`Wipe complete — ${json.deleted} record(s) removed.`);
      await fetchTransfers();
    } catch (err: any) {
      toast.error(err.message || "Wipe failed");
    } finally {
      setWiping(false);
    }
  };

  const activeCount = transfers.filter((t) => !isExpired(t.created_at)).length;
  const expiredCount = transfers.filter((t) => isExpired(t.created_at)).length;
  const fileCount = transfers.filter((t) => t.type === "file").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#030307",
        color: "#f1f5f9",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── Header ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: 64,
          background: "rgba(3,3,7,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="CopyCloud Logo" style={{ height: 28, width: "auto" }} />
          <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>
            Copy<span style={{ color: "#818cf8" }}>Cloud</span>
          </span>
          <div
            style={{
              marginLeft: 8,
              padding: "3px 10px",
              borderRadius: 99,
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#818cf8",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ADMIN
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#334155", fontSize: "0.78rem" }}>
            {session?.user?.email}
          </span>
          <button
            onClick={onSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.04)",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f1f5f9";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* ─── Page title + actions ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 4,
              }}
            >
              Active Transfers
            </h2>
            <p style={{ color: "#334155", fontSize: "0.82rem" }}>
              All records in the Supabase <code style={{ color: "#818cf8", fontFamily: "'JetBrains Mono', monospace" }}>clips</code> table
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={fetchTransfers}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#94a3b8",
                cursor: loading ? "wait" : "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
                transition: "all 0.15s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
              Refresh
            </button>

            <button
              onClick={() => setConfirmWipe(true)}
              disabled={wiping}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.25)",
                background: "rgba(239,68,68,0.08)",
                color: "#fca5a5",
                cursor: wiping ? "wait" : "pointer",
                fontSize: "0.82rem",
                fontWeight: 700,
                transition: "all 0.15s",
                opacity: wiping ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.14)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
              }}
            >
              <Flame size={14} />
              Clear Expired Data
            </button>
          </div>
        </div>

        {/* ─── Stats ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard label="TOTAL" value={transfers.length} sub="all time records" icon={<Database size={14} />} />
          <StatCard label="ACTIVE" value={activeCount} sub="within 24h window" icon={<Shield size={14} />} />
          <StatCard label="EXPIRED" value={expiredCount} sub="pending wipe" icon={<Flame size={14} />} />
          <StatCard label="FILE CLIPS" value={fileCount} sub="with storage objects" icon={<File size={14} />} />
        </div>

        {/* ─── Table ─── */}
        <div
          style={{
            background: "rgba(10,10,20,0.7)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 160px 160px 90px 56px",
              gap: 0,
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            {["ID / CODE", "CONTENT SNIPPET", "CREATED AT", "EXPIRES AT", "TYPE", ""].map(
              (h) => (
                <span
                  key={h}
                  style={{
                    color: "#334155",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {h}
                </span>
              )
            )}
          </div>

          {/* Rows */}
          {loading ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "#334155",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "2px solid rgba(99,102,241,0.2)",
                  borderTopColor: "#6366f1",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              Loading transfers…
            </div>
          ) : transfers.length === 0 ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                color: "#334155",
                fontSize: "0.875rem",
              }}
            >
              No transfers found.
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {transfers.map((clip, i) => {
                const expired = isExpired(clip.created_at);
                const deleting = deletingCode === clip.code;
                return (
                  <motion.div
                    key={clip.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.18, delay: i * 0.02 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 160px 160px 90px 56px",
                      gap: 0,
                      padding: "14px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      alignItems: "center",
                      background: expired
                        ? "rgba(239,68,68,0.03)"
                        : i % 2 === 0
                        ? "transparent"
                        : "rgba(255,255,255,0.01)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(99,102,241,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = expired
                        ? "rgba(239,68,68,0.03)"
                        : i % 2 === 0
                        ? "transparent"
                        : "rgba(255,255,255,0.01)")
                    }
                  >
                    {/* Code */}
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#a5b4fc",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {clip.code}
                    </span>

                    {/* Snippet */}
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingRight: 12,
                      }}
                      title={clip.type === "file" ? clip.content : clip.content.slice(0, 200)}
                    >
                      {getSnippet(clip)}
                    </span>

                    {/* Created At */}
                    <span style={{ color: "#475569", fontSize: "0.75rem" }}>
                      {formatDate(clip.created_at)}
                    </span>

                    {/* Expires At */}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: expired ? "#ef4444" : "#475569",
                      }}
                    >
                      {expired ? "⚠ Expired" : getExpiry(clip.created_at)}
                    </span>

                    {/* Type badge */}
                    <span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "3px 10px",
                          borderRadius: 99,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: "0.06em",
                          background:
                            clip.type === "file"
                              ? "rgba(168,85,247,0.12)"
                              : "rgba(99,102,241,0.1)",
                          border:
                            clip.type === "file"
                              ? "1px solid rgba(168,85,247,0.25)"
                              : "1px solid rgba(99,102,241,0.2)",
                          color:
                            clip.type === "file" ? "#d8b4fe" : "#a5b4fc",
                        }}
                      >
                        {clip.type === "file" ? (
                          <><File size={9} />FILE</>
                        ) : (
                          <><FileText size={9} />TEXT</>
                        )}
                      </span>
                    </span>

                    {/* Delete button */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => handleDelete(clip.code)}
                        disabled={deleting}
                        title={`Delete transfer ${clip.code}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid rgba(239,68,68,0.2)",
                          background: "rgba(239,68,68,0.06)",
                          color: "#f87171",
                          cursor: deleting ? "wait" : "pointer",
                          transition: "all 0.15s",
                          opacity: deleting ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.06)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                        }}
                      >
                        {deleting ? (
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              border: "2px solid rgba(248,113,113,0.3)",
                              borderTopColor: "#f87171",
                              animation: "spin 0.7s linear infinite",
                            }}
                          />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer note */}
        <p
          style={{
            marginTop: 16,
            color: "#1e293b",
            fontSize: "0.72rem",
            textAlign: "center",
          }}
        >
          All mutations are performed server-side via Supabase service_role. Data auto-wipes every 24h.
        </p>
      </main>

      {/* ─── Wipe confirm modal ─── */}
      <AnimatePresence>
        {confirmWipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 24,
            }}
            onClick={() => setConfirmWipe(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(10,10,20,0.98)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 20,
                padding: "32px 28px",
                maxWidth: 400,
                width: "100%",
                boxShadow: "0 0 60px rgba(239,68,68,0.1)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Flame size={22} color="#ef4444" />
              </div>
              <h3
                style={{
                  color: "#f1f5f9",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Confirm Wipe
              </h3>
              <p
                style={{
                  color: "#475569",
                  fontSize: "0.82rem",
                  textAlign: "center",
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                This will permanently delete all transfers older than 24 hours,
                including any associated storage files. This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setConfirmWipe(false)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#64748b",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleWipe}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "1px solid rgba(239,68,68,0.3)",
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))",
                    color: "#fca5a5",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Flame size={14} />
                  Wipe Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── AdminPage — top-level auth gate ─── */
export default function AdminPage() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "authenticated">("loading");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s && s.user?.email === ADMIN_EMAIL) {
        setSession(s);
        setAuthState("authenticated");
      } else {
        if (s) supabase.auth.signOut(); // sign out wrong user silently
        setAuthState("unauthenticated");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s && s.user?.email === ADMIN_EMAIL) {
        setSession(s);
        setAuthState("authenticated");
      } else {
        setSession(null);
        setAuthState("unauthenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (authState === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030307",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "3px solid rgba(99,102,241,0.2)",
            borderTopColor: "#6366f1",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(12, 12, 20, 0.95)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#f1f5f9",
            backdropFilter: "blur(12px)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          },
        }}
      />
      {authState === "unauthenticated" ? (
        <LoginForm onSuccess={() => {}} />
      ) : (
        <Dashboard session={session} onSignOut={handleSignOut} />
      )}
    </>
  );
}
