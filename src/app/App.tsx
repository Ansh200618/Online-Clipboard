import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { Send, Download, Clock, Info, Zap, Shield, Timer, Lock, Radio, Wifi, Cpu, Globe, Key } from "lucide-react";
import { PremiumBackground } from "./components/PremiumBackground";
import { WorkspaceCard } from "./components/WorkspaceCard";
import { SendTab } from "./components/SendTab";
import { RetrieveTab } from "./components/RetrieveTab";
import { HistoryTab } from "./components/HistoryTab";
import { AboutTab } from "./components/AboutTab";
import { Chatbot } from "./components/Chatbot";
import { supabase } from "../lib/supabase";

type ConnStatus = "checking" | "online" | "degraded" | "offline";
const STATUS_META: Record<ConnStatus, { label: string; color: string; bg: string; border: string }> = {
  checking: { label: "CHECKING", color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)" },
  online:   { label: "SECURE",   color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" },
  degraded: { label: "DEGRADED", color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)" },
  offline:  { label: "OFFLINE",  color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
};

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
  const [status, setStatus] = useState<ConnStatus>("checking");

  // Real connection health for the top status badge.
  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (!navigator.onLine) { if (alive) setStatus("offline"); return; }
      const started = performance.now();
      try {
        const { error } = await supabase.from("clips").select("code", { head: true, count: "exact" }).limit(1);
        if (!alive) return;
        if (error) { setStatus("degraded"); return; }
        setStatus(performance.now() - started > 1500 ? "degraded" : "online");
      } catch {
        if (alive) setStatus("offline");
      }
    };
    check();
    const iv = window.setInterval(check, 30_000);
    const on = () => check();
    const off = () => setStatus("offline");
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { alive = false; window.clearInterval(iv); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);


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
      <ScatteredAmbient />

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
          {(() => {
            const s = STATUS_META[status];
            return (
              <div
                title={`Connection: ${s.label.toLowerCase()}`}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99,
                  background: s.bg, border: `1px solid ${s.border}`,
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}`, animation: status === "checking" ? "pulse 1s infinite" : "pulse 2s infinite" }} />
                <span style={{ color: s.color, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</span>
              </div>
            );
          })()}
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
        @keyframes floatY {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-14px); }
        }
        @keyframes floatXY {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg); }
          25%      { transform: translate(-50%, -50%) translate(6px, -10px) rotate(3deg); }
          50%      { transform: translate(-50%, -50%) translate(-4px, 8px) rotate(-2deg); }
          75%      { transform: translate(-50%, -50%) translate(-8px, -6px) rotate(2deg); }
        }
        @keyframes spinSlow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes drift {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
      `}</style>
    </div>
  );
}

// Scattered geometric shapes (memphis-style) across the entire background.
// Rings, triangles, dot grids, wavy lines, small squares — no text, no icons.
function ScatteredAmbient() {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Palette — significantly toned down so text stays readable over the shapes.
  const C = {
    violet: "rgba(139,92,246,0.32)",
    violetSoft: "rgba(139,92,246,0.10)",
    indigo: "rgba(99,102,241,0.30)",
    indigoSoft: "rgba(99,102,241,0.09)",
    cyan: "rgba(103,232,249,0.26)",
    dot: "rgba(148,163,184,0.18)",
    line: "rgba(148,163,184,0.22)",
  };

  type Shape =
    | { kind: "ring"; top: string; left: string; size: number; stroke: string; sw: number; delay: number; dur: number; anim?: string }
    | { kind: "arc"; top: string; left: string; size: number; stroke: string; sw: number; rot: number; delay: number; dur: number; anim?: string }
    | { kind: "triangle"; top: string; left: string; size: number; fill?: string; stroke?: string; rot: number; delay: number; dur: number; anim?: string }
    | { kind: "dots"; top: string; left: string; cols: number; rows: number; gap: number; r: number; color: string; rot: number; delay: number; dur: number; anim?: string }
    | { kind: "wave"; top: string; left: string; w: number; h: number; stroke: string; sw: number; rot: number; delay: number; dur: number; anim?: string }
    | { kind: "square"; top: string; left: string; size: number; stroke: string; sw: number; rot: number; delay: number; dur: number; anim?: string }
    | { kind: "stripes"; top: string; left: string; size: number; color: string; rot: number; delay: number; dur: number; anim?: string };

  const ALL: Shape[] = [
    // Corner rings (big, quiet)
    { kind: "ring", top: "-8%", left: "-6%",  size: 380, stroke: C.violet,  sw: 22, delay: 0,   dur: 18, anim: "floatXY" },
    { kind: "ring", top: "108%", left: "104%", size: 420, stroke: C.violet,  sw: 24, delay: 1.5, dur: 20, anim: "floatXY" },
    { kind: "arc",  top: "18%",  left: "92%",  size: 220, stroke: C.indigo,  sw: 14, rot: 40,  delay: 0.6, dur: 22, anim: "spinSlow" },
    { kind: "arc",  top: "78%",  left: "6%",   size: 200, stroke: C.indigo,  sw: 12, rot: -30, delay: 1.1, dur: 26, anim: "spinSlow" },

    // Small hollow rings
    { kind: "ring", top: "22%", left: "12%",  size: 26, stroke: C.violet, sw: 2,  delay: 0.4, dur: 6, anim: "floatY" },
    { kind: "ring", top: "62%", left: "88%",  size: 20, stroke: C.indigo, sw: 2,  delay: 1.2, dur: 7, anim: "floatY" },
    { kind: "ring", top: "36%", left: "94%",  size: 14, stroke: C.violet, sw: 2,  delay: 0.9, dur: 5, anim: "floatXY" },
    { kind: "ring", top: "84%", left: "40%",  size: 18, stroke: C.cyan,   sw: 2,  delay: 1.8, dur: 8, anim: "floatXY" },

    // Right triangles (outline + filled soft)
    { kind: "triangle", top: "14%", left: "22%", size: 42, stroke: C.violet, rot: -10, delay: 0.2, dur: 9, anim: "floatXY" },
    { kind: "triangle", top: "44%", left: "82%", size: 52, fill: C.violetSoft, stroke: C.violet, rot: 25, delay: 1.3, dur: 10, anim: "floatXY" },
    { kind: "triangle", top: "72%", left: "18%", size: 46, fill: C.indigoSoft, stroke: C.indigo, rot: -20, delay: 0.7, dur: 11, anim: "floatY" },
    { kind: "triangle", top: "30%", left: "68%", size: 34, stroke: C.cyan,   rot: 15, delay: 1.9, dur: 8, anim: "floatXY" },
    { kind: "triangle", top: "88%", left: "72%", size: 40, stroke: C.violet, rot: 40, delay: 0.5, dur: 12, anim: "floatY" },

    // Dot grids
    { kind: "dots", top: "10%",  left: "76%", cols: 8, rows: 4, gap: 8, r: 1.8, color: C.dot, rot: 0,  delay: 0,   dur: 14, anim: "floatY" },
    { kind: "dots", top: "58%",  left: "14%", cols: 6, rows: 4, gap: 8, r: 1.8, color: C.dot, rot: -8, delay: 1.6, dur: 13, anim: "floatXY" },
    { kind: "dots", top: "82%",  left: "56%", cols: 5, rows: 3, gap: 8, r: 1.6, color: C.dot, rot: 12, delay: 0.9, dur: 15, anim: "floatY" },

    // Wavy lines
    { kind: "wave", top: "6%",  left: "42%", w: 90,  h: 18, stroke: C.line, sw: 2, rot: 0,   delay: 0.3, dur: 11, anim: "floatXY" },
    { kind: "wave", top: "50%", left: "6%",  w: 70,  h: 14, stroke: C.line, sw: 2, rot: 25,  delay: 1.1, dur: 12, anim: "floatY" },
    { kind: "wave", top: "94%", left: "22%", w: 100, h: 18, stroke: C.line, sw: 2, rot: -10, delay: 0.7, dur: 10, anim: "floatXY" },
    { kind: "wave", top: "40%", left: "38%", w: 60,  h: 12, stroke: C.line, sw: 2, rot: 8,   delay: 2.0, dur: 13, anim: "floatY" },

    // Tilted squares (outline)
    { kind: "square", top: "24%", left: "58%", size: 14, stroke: C.violet, sw: 1.5, rot: 20,  delay: 1.4, dur: 9, anim: "floatXY" },
    { kind: "square", top: "66%", left: "34%", size: 12, stroke: C.indigo, sw: 1.5, rot: -15, delay: 0.6, dur: 10, anim: "floatXY" },

    // Diagonal stripe blocks
    { kind: "stripes", top: "20%", left: "8%",  size: 70, color: C.indigoSoft, rot: -20, delay: 0.4, dur: 14, anim: "floatY" },
    { kind: "stripes", top: "76%", left: "84%", size: 80, color: C.violetSoft, rot: 30,  delay: 1.5, dur: 15, anim: "floatY" },
  ];

  // On mobile, keep only a small edge/corner-biased subset so the UI stays clean.
  const MOBILE_KEEP = new Set<number>([0, 1, 2, 3, 6, 15, 19, 22]);
  const SHAPES = isMobile ? ALL.filter((_, i) => MOBILE_KEEP.has(i)) : ALL;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {SHAPES.map((s, i) => {
        const anim = s.anim ?? "floatY";
        const wrapperStyle: React.CSSProperties = {
          position: "absolute",
          top: s.top,
          left: s.left,
          transform: "translate(-50%, -50%)",
          animation: `${anim} ${s.dur}s ease-in-out ${s.delay}s infinite`,
          willChange: "transform",
          opacity: 0.85,
        };
        const rotStyle = (deg: number): React.CSSProperties => ({
          transform: `rotate(${deg}deg)`,
          transformOrigin: "center",
          display: "block",
        });

        let inner: React.ReactNode = null;
        if (s.kind === "ring") {
          inner = (
            <svg width={s.size} height={s.size} style={{ display: "block" }}>
              <circle cx={s.size / 2} cy={s.size / 2} r={s.size / 2 - s.sw / 2} fill="none" stroke={s.stroke} strokeWidth={s.sw} />
            </svg>
          );
        } else if (s.kind === "arc") {
          const r = s.size / 2 - s.sw / 2;
          const cx = s.size / 2, cy = s.size / 2;
          const rad = (deg: number) => (deg * Math.PI) / 180;
          const x1 = cx + r * Math.cos(rad(0)), y1 = cy + r * Math.sin(rad(0));
          const x2 = cx + r * Math.cos(rad(270)), y2 = cy + r * Math.sin(rad(270));
          inner = (
            <svg width={s.size} height={s.size} style={rotStyle(s.rot)}>
              <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`} fill="none" stroke={s.stroke} strokeWidth={s.sw} strokeLinecap="round" />
            </svg>
          );
        } else if (s.kind === "triangle") {
          const pts = `0,${s.size} ${s.size},${s.size} 0,0`;
          inner = (
            <svg width={s.size} height={s.size} style={rotStyle(s.rot)}>
              <polygon points={pts} fill={s.fill ?? "none"} stroke={s.stroke ?? "none"} strokeWidth={1.5} strokeLinejoin="round" />
            </svg>
          );
        } else if (s.kind === "dots") {
          const w = s.cols * s.gap, h = s.rows * s.gap;
          const circles = [];
          for (let y = 0; y < s.rows; y++)
            for (let x = 0; x < s.cols; x++)
              circles.push(<circle key={`${x}-${y}`} cx={x * s.gap + s.gap / 2} cy={y * s.gap + s.gap / 2} r={s.r} fill={s.color} />);
          inner = (
            <svg width={w} height={h} style={rotStyle(s.rot)}>
              {circles}
            </svg>
          );
        } else if (s.kind === "wave") {
          const midY = s.h / 2;
          const d = `M 0 ${midY} Q ${s.w * 0.25} 0, ${s.w * 0.5} ${midY} T ${s.w} ${midY}`;
          inner = (
            <svg width={s.w} height={s.h} style={rotStyle(s.rot)}>
              <path d={d} fill="none" stroke={s.stroke} strokeWidth={s.sw} strokeLinecap="round" />
            </svg>
          );
        } else if (s.kind === "square") {
          inner = (
            <svg width={s.size} height={s.size} style={rotStyle(s.rot)}>
              <rect x={s.sw / 2} y={s.sw / 2} width={s.size - s.sw} height={s.size - s.sw} fill="none" stroke={s.stroke} strokeWidth={s.sw} />
            </svg>
          );
        } else {
          // stripes
          const lines = [];
          const step = 6;
          for (let x = -s.size; x < s.size * 2; x += step) {
            lines.push(<line key={x} x1={x} y1={s.size} x2={x + s.size} y2={0} stroke={s.color} strokeWidth={2} />);
          }
          inner = (
            <svg width={s.size} height={s.size} viewBox={`0 0 ${s.size} ${s.size}`} style={{ ...rotStyle(s.rot), overflow: "hidden" }}>
              <defs>
                <clipPath id={`clip-${i}`}>
                  <rect width={s.size} height={s.size} rx={4} />
                </clipPath>
              </defs>
              <g clipPath={`url(#clip-${i})`}>{lines}</g>
            </svg>
          );
        }

        return (
          <div key={i} style={wrapperStyle}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}



