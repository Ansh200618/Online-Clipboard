import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, Zap } from "lucide-react";

interface Msg { role: "ai" | "user"; text: string }

const QA: Record<string, string> = {
  how: "Paste text or upload files in the **Send** tab → click **Generate Transfer Code** → share the 6-digit PIN → enter it in the **Retrieve** tab on any device. Done in seconds.",
  security: "All data is transferred via **HTTPS** and stored in isolated Supabase storage. No accounts, no logs, no fingerprinting. Content is **permanently deleted after 24 hours**.",
  limits: "Text of any length. Files up to **40 MB per transfer**. Larger P2P transfers via WebRTC are on the roadmap.",
  roadmap: "Coming soon:\n• **E2EE** client-side encryption\n• **Self-destruct on read** toggle\n• **Browser extensions** (Chrome & Firefox)\n• **CLI tool** for developers\n• **WebRTC** for files >1 GB",
};

const QUICK = [
  { label: "How it works?", key: "how" },
  { label: "Is it secure?", key: "security" },
  { label: "File limits?", key: "limits" },
  { label: "Roadmap?", key: "roadmap" },
];

function parseMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c7d2fe">$1</strong>')
    .replace(/\n/g, "<br/>");
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi, I'm the Copy Cloud assistant. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [msgs, open]);

  const addMsg = (role: "ai" | "user", text: string) => setMsgs((p) => [...p, { role, text }]);

  const handleQuick = (key: string) => {
    const labels: Record<string, string> = { how: "How it works?", security: "Is it secure?", limits: "File limits?", roadmap: "Roadmap?" };
    addMsg("user", labels[key]);
    setTimeout(() => addMsg("ai", QA[key]), 320);
  };

  const handleSend = () => {
    const t = input.trim(); if (!t) return;
    addMsg("user", t); setInput("");
    const lower = t.toLowerCase();
    let r = "I don't know that one. Try one of the quick buttons!";
    if (/how|work/.test(lower)) r = QA.how;
    else if (/safe|secure|privac|encrypt/.test(lower)) r = QA.security;
    else if (/size|limit|large|file|mb/.test(lower)) r = QA.limits;
    else if (/next|road|update|plan|future/.test(lower)) r = QA.roadmap;
    setTimeout(() => addMsg("ai", r), 320);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            style={{
              width: 340, height: 500,
              display: "flex", flexDirection: "column",
              background: "rgba(6, 6, 14, 0.97)",
              border: "1px solid rgba(99,102,241,0.22)",
              borderRadius: 20,
              boxShadow: "0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(99,102,241,0.06), 0 0 60px rgba(99,102,241,0.08)",
              backdropFilter: "blur(24px)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              background: "rgba(99,102,241,0.05)",
              borderBottom: "1px solid rgba(99,102,241,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
                  border: "1px solid rgba(99,102,241,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={15} color="#818cf8" />
                </div>
                <div>
                  <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.85rem" }}>Assistant</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
                    <span style={{ color: "#22c55e", fontSize: "0.65rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>ONLINE</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", padding: 4, borderRadius: 8 }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scroll} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "85%", padding: "10px 14px", borderRadius: 14,
                      background: m.role === "user"
                        ? "linear-gradient(135deg, #6366f1, #a855f7)"
                        : "rgba(255,255,255,0.04)",
                      color: "#f1f5f9", fontSize: "0.82rem", lineHeight: 1.55,
                      borderBottomRightRadius: m.role === "user" ? 4 : undefined,
                      borderBottomLeftRadius: m.role === "ai" ? 4 : undefined,
                      border: m.role === "ai" ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
                  />
                </div>
              ))}

              {/* Quick actions — only after greeting */}
              {msgs.length === 1 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {QUICK.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => handleQuick(q.key)}
                      style={{
                        padding: "6px 11px", borderRadius: 8, cursor: "pointer",
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#475569", fontSize: "0.75rem", fontWeight: 500, fontFamily: "'Inter', sans-serif",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(99,102,241,0.3)"; b.style.color = "#818cf8"; }}
                      onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,0.08)"; b.style.color = "#475569"; }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              display: "flex", gap: 8, padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(0,0,0,0.25)",
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question…"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "9px 12px", outline: "none",
                  color: "#f1f5f9", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif",
                  caretColor: "#6366f1",
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                }}
              >
                <Send size={14} color="#fff" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(99,102,241,0.55), 0 0 0 1px rgba(99,102,241,0.2)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} color="#fff" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare size={20} color="#fff" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
