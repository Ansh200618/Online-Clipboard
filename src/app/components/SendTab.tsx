import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Upload, Zap, Copy, RotateCcw, Clipboard, Trash2, CheckCircle2, FileText, FolderUp, X, Flame } from "lucide-react";
import { supabase, generateCode, formatFileSize, addToHistory } from "../../lib/supabase";

type SendType = "text" | "file";
type Stage = "input" | "success";

interface SuccessData { code: string; contentType: "text" | "file" }

function CodeChar({ char, delay }: { char: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.7, rotateX: -40 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ delay, type: "spring", damping: 16, stiffness: 180 }}
      style={{ perspective: 400 }}
    >
      <div
        style={{
          width: "var(--cc-code-cell-w)",
          height: "var(--cc-code-cell-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: "linear-gradient(145deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))",
          border: "1px solid rgba(99,102,241,0.35)",
          boxShadow: "0 0 20px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "var(--cc-code-cell-font)",
          fontWeight: 700,
          color: "#a5b4fc",
          letterSpacing: 0,
          textShadow: "0 0 16px rgba(99,102,241,0.8)",
        }}
      >
        {char}
      </div>
    </motion.div>
  );
}

function SuccessView({ data, onReset }: { data: SuccessData; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/?code=${data.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "var(--cc-panel-pad-y) var(--cc-panel-pad-x)", textAlign: "center" }}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 150 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))",
          border: "1px solid rgba(99,102,241,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 0 30px rgba(99,102,241,0.2)",
        }}
      >
        <CheckCircle2 size={26} color="#a5b4fc" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}
      >
        Portal Created
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ color: "#334155", fontSize: "0.82rem", marginBottom: 28 }}
      >
        Share this code — it expires in 24 hours
      </motion.p>

      <div style={{ display: "flex", gap: "var(--cc-code-cell-gap)", justifyContent: "center", marginBottom: 28, flexWrap: "nowrap" }}>
        {data.code.split("").map((c, i) => <CodeChar key={i} char={c} delay={0.08 + i * 0.07} />)}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        style={{
          display: "inline-block",
          padding: 12,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 0 40px rgba(99,102,241,0.2)",
          marginBottom: 24,
          maxWidth: "100%",
        }}
      >
        <QRCode
          value={shareUrl}
          size={180}
          bgColor="#fff"
          fgColor="#030307"
          level="H"
          style={{ height: "auto", maxWidth: "min(180px, 55vw)", width: "100%" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{ display: "flex", gap: 10 }}
      >
        <button
          onClick={handleCopy}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 0", borderRadius: 12, cursor: "pointer",
            background: copied ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${copied ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
            color: copied ? "#a5b4fc" : "#64748b",
            fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, transition: "all 0.2s",
          }}
        >
          <Copy size={15} /> {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 0", borderRadius: 12, cursor: "pointer",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            border: "none", color: "#fff",
            fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600,
            boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          }}
        >
          <RotateCcw size={15} /> New Transfer
        </button>
      </motion.div>
    </div>
  );
}

export function SendTab() {
  const [sendType, setSendType] = useState<SendType>("text");
  const [stage, setStage] = useState<Stage>("input");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalSize = files.reduce((a, f) => a + f.size, 0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    setFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleSend = async () => {
    if (sendType === "text" && !text.trim()) return toast.error("Enter some text.");
    if (sendType === "file" && !files.length) return toast.error("Select at least one file.");
    if (sendType === "file" && totalSize > 40 * 1024 * 1024) return toast.error("Exceeds 40 MB limit.");
    setIsLoading(true);
    const code = generateCode();
    try {
      let content = "";
      if (sendType === "file") {
        const paths = await Promise.all(files.map(async (f) => {
          const path = `${code}-${Math.random().toString(36).slice(2, 6)}-${f.name.replace(/\s/g, "_")}`;
          const { error } = await supabase.storage.from("uploads").upload(path, f);
          if (error) throw error;
          return path;
        }));
        content = JSON.stringify(paths);
      } else { content = text; }
      const { error } = await supabase.from("clips").insert([{ code, content, type: sendType, created_at: new Date().toISOString() }]);
      if (error) throw error;
      addToHistory({ code, action: "send", contentType: sendType, preview: sendType === "text" ? text.slice(0, 40) : `${files.length} file(s)`, ts: Date.now() });
      setSuccessData({ code, contentType: sendType });
      setStage("success");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed.");
    } finally { setIsLoading(false); }
  };

  const handleReset = () => { setStage("input"); setText(""); setFiles([]); setSuccessData(null); };

  const inputPad = { padding: "var(--cc-panel-pad-y) var(--cc-panel-pad-x)" };

  return (
    <AnimatePresence mode="wait">
      {stage === "input" ? (
        <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} style={inputPad}>
          {/* Type toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {(["text", "file"] as SendType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSendType(t)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                  background: sendType === t ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${sendType === t ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
                  color: sendType === t ? "#c7d2fe" : "#334155",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", fontWeight: 600,
                  boxShadow: sendType === t ? "0 0 20px rgba(99,102,241,0.12)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {t === "text" ? <FileText size={14} /> : <FolderUp size={14} />}
                {t === "text" ? "Text / Code" : "Files"}
              </button>
            ))}
          </div>

          {/* Text editor */}
          {sendType === "text" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{
                borderRadius: 16, overflow: "hidden",
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 16,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: "rgba(255,255,255,0.015)",
                }}>
                  <span style={{ color: "#1e293b", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", marginRight: "auto" }}>✦ SECURE EDITOR</span>
                  {[
                    { icon: <Clipboard size={12} />, label: "Paste", onClick: async () => { try { const t = await navigator.clipboard.readText(); setText(p => p + t); } catch { toast.error("Use Ctrl+V"); } } },
                    { icon: <Trash2 size={12} />, label: "Clear", onClick: () => setText("") },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.onClick} style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                      color: "#334155", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600,
                    }}>{btn.icon}{btn.label}</button>
                  ))}
                </div>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={text} onChange={(e) => setText(e.target.value)}
                    placeholder="Paste text, API keys, code snippets, links…"
                    rows={8}
                    style={{
                      width: "100%", background: "transparent", border: "none", outline: "none",
                      color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem",
                      lineHeight: 1.7, padding: "16px 16px 44px", resize: "none", caretColor: "#6366f1",
                    }}
                    spellCheck={false}
                  />
                  <div style={{
                    position: "absolute", bottom: 10, right: 12,
                    background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 99, padding: "4px 10px",
                    color: "#1e293b", fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                  }}>
                    {text.length.toLocaleString()} chars
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* File drop zone */}
          {sendType === "file" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 16 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                  background: isDragging ? "rgba(99,102,241,0.05)" : "rgba(0,0,0,0.2)",
                  minHeight: files.length ? "auto" : 180,
                  display: "flex", flexDirection: "column", alignItems: files.length ? "stretch" : "center",
                  justifyContent: "center", padding: files.length ? "16px" : "40px 20px",
                }}
              >
                {files.length === 0 ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", margin: "0 auto 14px",
                    }}><Upload size={22} color="#6366f1" /></div>
                    <p style={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.875rem" }}>
                      Drop files or <span style={{ color: "#818cf8" }}>click to browse</span>
                    </p>
                    <p style={{ color: "#1e293b", fontSize: "0.78rem", marginTop: 4 }}>Max 40 MB</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {files.map((f, i) => (
                      <div key={i} onClick={(e) => e.stopPropagation()} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                        background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)",
                      }}>
                        <FileText size={15} color="#818cf8" />
                        <span style={{ flex: 1, color: "#e2e8f0", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        <span style={{ color: "#334155", fontSize: "0.72rem" }}>{formatFileSize(f.size)}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", padding: 2 }}><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(99,102,241,0.45)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={isLoading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "15px 0", borderRadius: 14, cursor: isLoading ? "wait" : "pointer",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              border: "none", color: "#fff",
              fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700,
              boxShadow: "0 8px 30px rgba(99,102,241,0.3)",
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            {isLoading ? (
              <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />Generating Portal…</>
            ) : (
              <><Zap size={18} />Generate Transfer Code</>
            )}
          </motion.button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </motion.div>
      ) : (
        <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {successData && <SuccessView data={successData} onReset={handleReset} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
