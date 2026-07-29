import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { Send, Download, Clock, Info, Zap, Shield, Timer } from "lucide-react";
import { PremiumBackground } from "./components/PremiumBackground";
import { WorkspaceCard } from "./components/WorkspaceCard";
import { SendTab } from "./components/SendTab";
import { RetrieveTab } from "./components/RetrieveTab";
import { HistoryTab } from "./components/HistoryTab";
import { AboutTab } from "./components/AboutTab";
import { Chatbot } from "./components/Chatbot";

type Tab = "send" | "retrieve" | "history" | "about";

const TABS: { id: Tab; label: string; icon: typeof Send }[] = [
  { id: "send", label: "Send", icon: Send },
  { id: "retrieve", label: "Retrieve", icon: Download },
  { id: "history", label: "History", icon: Clock },
  { id: "about", label: "About", icon: Info },
];

const HERO: Record<Tab, { eyebrow: string; title: string; sub: string }> = {
  send: {
    eyebrow: "INSTANT TRANSFER",
    title: "Send Anything.",
    sub: "Text, code, or files — warped to any device with a single code.",
  },
  retrieve: {
    eyebrow: "CLOUD RETRIEVAL",
    title: "Open the Portal.",
    sub: "Enter your 6-digit code to pull content from the cloud instantly.",
  },
  history: {
    eyebrow: "LOCAL LOG",
    title: "Your Trail.",
    sub: "Recent transfers on this device. Cloud data self-destructs in 24h.",
  },
  about: {
    eyebrow: "DIGITAL GHOST",
    title: "Built to Forget.",
    sub: "Anonymous, encrypted, ephemeral. Zero accounts. Zero traces.",
  },
};

export default function App() {
  const [tab, setTab] = useState<Tab>("send");
  const [prefill, setPrefill] = useState<string | undefined>();

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t !== "retrieve") setPrefill(undefined);
  };

  const handleHistoryRetrieve = (code: string) => {
    setPrefill(code);
    setTab("retrieve");
  };

  // Bug 1 fix: If the URL contains ?code=XXXXXX (or ?retrieve=XXXXXX), scanning
  // a QR code / opening a shared link should jump straight to the Retrieve tab
  // with the code pre-filled and auto-triggered.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("code") || params.get("retrieve");
    if (!raw) return;
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (clean.length === 6) {
      setPrefill(clean);
      setTab("retrieve");
    }
    // Clean the query string so a refresh doesn't re-trigger retrieval.
    params.delete("code");
    params.delete("retrieve");
    const next = window.location.pathname + (params.toString() ? `?${params}` : "") + window.location.hash;
    window.history.replaceState({}, "", next);
  }, []);

  const hero = HERO[tab];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      <PremiumBackground />
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

      {/* ─── TOP NAV ─── */}
   <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 h-16 bg-[#030307]/85 border-b border-white/5 backdrop-blur-md">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => handleTabChange("send")}>
        <img src="/logo.png" alt="CopyCloud Logo" className="h-8 w-auto" />
          <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.03em", color: "#f1f5f9" }}>
            Copy<span style={{ color: "#818cf8" }}>Cloud</span>
          </span>
        </div>

        {/* Tabs */}
        <nav className="hidden md:flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 9,
                  background: active ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15))" : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                  color: active ? "#c7d2fe" : "#334155",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.18s",
                  boxShadow: active ? "0 0 16px rgba(99,102,241,0.1)" : "none",
                }}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99,
            background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#22c55e", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>SECURE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Timer size={11} color="#6366f1" />
            <span style={{ color: "#6366f1", fontSize: "0.7rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>24H WIPE</span>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ height: 1, width: 28, background: "rgba(99,102,241,0.4)" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "rgba(99,102,241,0.7)",
                }}
              >
                {hero.eyebrow}
              </span>
              <div style={{ height: 1, width: 28, background: "rgba(99,102,241,0.4)" }} />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(2.8rem, 7vw, 5rem)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                marginBottom: 14,
                background: "linear-gradient(160deg, #ffffff 0%, #c7d2fe 40%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {hero.title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                color: "#334155",
                fontSize: "clamp(0.9rem, 2vw, 1rem)",
                lineHeight: 1.6,
                maxWidth: 460,
                margin: "0 auto",
              }}
            >
              {hero.sub}
            </p>

            {/* Trust pills */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
              {[
                { icon: <Shield size={11} />, text: "Anonymous" },
                { icon: <Timer size={11} />, text: "Wipe-on-24" },
                { icon: <Zap size={11} />, text: "Cross-platform" },
              ].map((pill) => (
                <div
                  key={pill.text}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    color: "#334155", fontSize: "0.72rem", fontWeight: 600,
                  }}
                >
                  <span style={{ color: "#6366f1" }}>{pill.icon}</span>
                  {pill.text}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── 3D WORKSPACE CARD ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 clamp(10px, 3vw, 24px) 60px",
          position: "relative",
          zIndex: 1,
          width: "100%",
        }}
      >

        <div className="w-full max-w-[660px] px-2 sm:px-4 md:px-0">
          <WorkspaceCard>
            {/* Tab indicator bar inside card */}
            <div
              style={{
                display: "flex",
                gap: 0,
                padding: "0 clamp(4px, 2vw, 24px)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: "rgba(0,0,0,0.15)",
                width: "100%",
              }}
            >
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabChange(t.id)}
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "clamp(3px, 1.2vw, 6px)",
                      padding: "12px clamp(4px, 1.5vw, 16px)",
                      background: "transparent", border: "none", cursor: "pointer",
                      borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                      marginBottom: -1,
                      color: active ? "#a5b4fc" : "#94a3b8",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(0.7rem, 2.4vw, 0.8rem)",
                      fontWeight: 600,
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1"; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
                  >
                    <t.icon size={13} style={{ flexShrink: 0 }} />
                    {t.label}
                  </button>
                );
              })}
            </div>


            {/* Tab content */}
            <AnimatePresence mode="wait">
              {tab === "send" && (
                <motion.div key="send" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <SendTab />
                </motion.div>
              )}
              {tab === "retrieve" && (
                <motion.div key="retrieve" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <RetrieveTab prefillCode={prefill} />
                </motion.div>
              )}
              {tab === "history" && (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <HistoryTab onRetrieve={handleHistoryRetrieve} />
                </motion.div>
              )}
              {tab === "about" && (
                <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  <AboutTab />
                </motion.div>
              )}
            </AnimatePresence>
          </WorkspaceCard>
        </div>

        {/* Glow under card */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            width: 400,
            height: 80,
            background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      </div>

      {/* ─── FOOTER ─── */}
      <footer
        style={{
          position: "relative", zIndex: 1,
          textAlign: "center",
          padding: "18px 24px 26px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "#cbd5e1",
          fontSize: "0.78rem",
          fontWeight: 500,
          letterSpacing: "0.01em",
          textShadow: "0 1px 8px rgba(0,0,0,0.6)",
        }}
      >
        <p>© 2026 Copy Cloud · Anonymous Ephemeral Transfer · No accounts · No tracking</p>
      </footer>


      <Chatbot />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
