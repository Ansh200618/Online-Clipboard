import { motion } from "motion/react";
import { Zap, Shield, Smartphone, Globe, Briefcase, Linkedin, Instagram, Github, ChevronDown } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Zap, title: "Zero-Friction Transit", desc: "No accounts, no pairing, no installs. A 6-digit code bridges any two devices in seconds." },
  { icon: Shield, title: "Ephemeral by Design", desc: "Content auto-deletes after 24 hours. No logs, no profiles, no trace." },
];

const faq = [
  { q: "How does the code work?", a: "Upload content → get a 6-char code. Enter it on any other device to retrieve. The code expires with the data after 24 hours." },
  { q: "Is my data encrypted?", a: "All transfers use HTTPS. Data is stored in isolated Supabase storage and permanently purged after 24 hours. We never read your content." },
  { q: "File size limits?", a: "Up to 40 MB per transfer. For text, there is no meaningful limit. WebRTC P2P for files >1 GB is on the roadmap." },
  { q: "Does it work cross-platform?", a: "Any device with a modern browser — Windows, Mac, Linux, Android, iOS. No installation needed." },
];

const links = [
  { icon: Briefcase, label: "Portfolio", href: "https://anshcreates.vercel.app/" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/itsanshdeepofficial/" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/anshdeep_officiall/" },
  { icon: Github, label: "GitHub", href: "https://github.com/anshdeepofficial/" },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", cursor: "pointer", marginBottom: 6 }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: open ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.015)",
        transition: "background 0.15s",
      }}>
        <span style={{ color: "#cbd5e1", fontWeight: 600, fontSize: "0.85rem" }}>{q}</span>
        <ChevronDown size={15} color="#6366f1" style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </div>
      {open && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export function AboutTab() {
  const PAD = { padding: "28px 36px 32px" };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={PAD}>
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: "0 auto 12px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
          border: "1px solid rgba(99,102,241,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 30px rgba(99,102,241,0.15)",
        }}>
          <Globe size={24} color="#818cf8" />
        </div>
        <p style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Copy Cloud</p>
        <p style={{ color: "#94a3b8", fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace", marginTop: 3 }}>v3.0 · EPHEMERAL TRANSIT PLATFORM</p>
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{
            display: "flex", alignItems: "flex-start", gap: 12, padding: "14px", borderRadius: 12,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <f.icon size={17} color="#818cf8" />
            </div>
            <div>
              <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "0.875rem", marginBottom: 3 }}>{f.title}</p>
              <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <p style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>FAQ</p>
      <div style={{ marginBottom: 20 }}>
        {faq.map((f) => <FAQ key={f.q} {...f} />)}
      </div>

      {/* Links */}
      <div style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
        <p style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Connect</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              color: "#94a3b8", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(99,102,241,0.08)"; a.style.borderColor = "rgba(99,102,241,0.2)"; a.style.color = "#818cf8"; }}
              onMouseLeave={(e) => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(255,255,255,0.02)"; a.style.borderColor = "rgba(255,255,255,0.05)"; a.style.color = "#94a3b8"; }}
            >
              <l.icon size={14} color="#6366f1" />{l.label}
            </a>
          ))}
        </div>
      </div>

      {/* APK */}
      <a href="https://github.com/Ansh200618/Copy-Cloud/releases/latest" target="_blank" rel="noreferrer" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px 0", borderRadius: 14,
        background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "#fff", textDecoration: "none",
        fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Inter', sans-serif",
        boxShadow: "0 8px 24px rgba(99,102,241,0.3)", marginBottom: 16,
        transition: "all 0.2s",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 40px rgba(99,102,241,0.45)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.3)"; }}
      >
        <Smartphone size={17} /> Get Android App (.APK)
      </a>

      <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.72rem", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: 12 }}>
        <p>copycloud.me@outlook.com · Punjab, India</p>
        <p>© 2026 Copy Cloud · Ephemeral Transfer Systems</p>
      </div>
    </motion.div>
  );
}
