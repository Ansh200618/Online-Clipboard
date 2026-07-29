import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Send, Download, Inbox, Trash2, Clock } from "lucide-react";
import { getHistory, clearHistoryStore, type HistoryItem } from "../../lib/supabase";
import { toast } from "sonner";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function HistoryTab({ onRetrieve }: { onRetrieve: (code: string) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => { setHistory(getHistory()); }, []);

  const handleClear = () => { clearHistoryStore(); setHistory([]); toast.success("History cleared"); };

  const PAD = { padding: "32px 36px 28px" };

  if (history.length === 0) {
    return (
      <div style={{ ...PAD, textAlign: "center" }}>
        <div style={{ padding: "48px 0" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}><Inbox size={22} color="#6366f1" /></div>
          <p style={{ color: "#334155", fontWeight: 600, fontSize: "0.9rem", marginBottom: 6 }}>No activity yet</p>
          <p style={{ color: "#1e293b", fontSize: "0.8rem" }}>Your recent sends and retrievals will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={PAD}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ color: "#334155", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          RECENT — {history.length} ENTRIES
        </p>
        <button
          onClick={handleClear}
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)",
            color: "#f87171", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600,
          }}
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map((item, i) => (
          <motion.div
            key={`${item.code}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onRetrieve(item.code)}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.07)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: item.action === "send" ? "rgba(99,102,241,0.1)" : "rgba(168,85,247,0.1)",
              border: `1px solid ${item.action === "send" ? "rgba(99,102,241,0.2)" : "rgba(168,85,247,0.2)"}`,
            }}>
              {item.action === "send"
                ? <Send size={14} color="#818cf8" />
                : <Download size={14} color="#c084fc" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: "0.875rem", color: item.action === "send" ? "#818cf8" : "#c084fc", letterSpacing: "0.1em" }}>
                  {item.code}
                </span>
                <span style={{ padding: "1px 7px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(255,255,255,0.04)", color: "#334155" }}>
                  {item.action}
                </span>
              </div>
              <p style={{ color: "#1e293b", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.preview}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <Clock size={11} color="#1e293b" />
              <span style={{ color: "#1e293b", fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace" }}>{timeAgo(item.ts)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
