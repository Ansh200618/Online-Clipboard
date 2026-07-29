import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Search, Copy, Download, Archive, ArrowLeft, FileText, FileUp, ExternalLink, Eye, X, Image as ImageIcon, Film } from "lucide-react";
import JSZip from "jszip";
import { supabase, addToHistory, fileKind } from "../../lib/supabase";

type Stage = "input" | "loading" | "result";
interface ClipData { code: string; content: string; type: "text" | "file"; }
interface FileEntry { name: string; url: string; }

function parseHttpUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

export function RetrieveTab({ prefillCode }: { prefillCode?: string }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<ClipData | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [preview, setPreview] = useState<FileEntry | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (prefillCode?.length === 6) {
      setCode(prefillCode.toUpperCase().split("").slice(0, 6));
      setTimeout(() => doRetrieve(prefillCode), 400);
    }
  }, [prefillCode]);

  const handleKeyInput = (i: number, val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) { const n = [...code]; n[i] = ""; setCode(n); return; }
    if (clean.length > 1) {
      const n = [...code];
      for (let j = 0; j < 6 && j < clean.length; j++) if (i + j < 6) n[i + j] = clean[j];
      setCode(n);
      refs.current[Math.min(i + clean.length, 5)]?.focus();
      return;
    }
    const n = [...code]; n[i] = clean; setCode(n);
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "Enter") doRetrieve();
  };

  const codeStr = code.join("");
  const complete = codeStr.length === 6 && !codeStr.includes(" ");

  const doRetrieve = async (override?: string) => {
    const c = (override || codeStr).toUpperCase().trim();
    if (c.length < 4) return toast.error("Enter a valid code.");
    setStage("loading");
    try {
      const { data, error } = await supabase.from("clips").select("*").eq("code", c).single();
      if (error || !data) { toast.error("Code not found or expired."); setStage("input"); return; }
      if (data.type === "file") {
        const paths: string[] = JSON.parse(data.content);
        setFiles(paths.map((p) => {
          const name = p.split("-").slice(2).join("-") || p;
          const { data: u } = supabase.storage.from("uploads").getPublicUrl(p);
          return { name, url: u.publicUrl };
        }));
      }
      setResult(data);
      setStage("result");
      addToHistory({ code: c, action: "retrieve", contentType: data.type, preview: data.type === "text" ? data.content.slice(0, 40) : `${JSON.parse(data.content).length} file(s)`, ts: Date.now() });
      toast.success("Content found!");
    } catch { toast.error("Something went wrong."); setStage("input"); }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true); toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();
      await Promise.all(files.map(async (f) => { const b = await (await fetch(f.url)).blob(); zip.file(f.name, b); }));
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `copycloud-${result?.code}.zip`; a.click();
      toast.success("Downloaded!");
    } catch { toast.error("ZIP failed."); } finally { setZipping(false); }
  };

  const resolvedLink = useMemo(
    () => (result?.type === "text" ? parseHttpUrl(result.content) : null),
    [result]
  );

  const reset = () => { setStage("input"); setCode(["", "", "", "", "", ""]); setResult(null); setFiles([]); setTimeout(() => refs.current[0]?.focus(), 100); };

  const PAD = { padding: "var(--cc-panel-pad-y) var(--cc-panel-pad-x)" };

  return (
    <AnimatePresence mode="wait">
      {stage !== "result" ? (
        <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} style={PAD}>
          <p style={{ color: "#334155", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
            ENTER PORTAL CODE
          </p>

          {/* OTP boxes */}
          <div style={{ display: "flex", gap: "var(--cc-code-cell-gap)", justifyContent: "center", marginBottom: 28, flexWrap: "nowrap" }}>
            {code.map((ch, i) => (
              <motion.input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text" maxLength={6} value={ch}
                onChange={(e) => handleKeyInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                animate={{ borderColor: ch ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.07)", boxShadow: ch ? "0 0 16px rgba(99,102,241,0.1)" : "none" }}
                style={{
                  width: "var(--cc-code-cell-w)", height: "var(--cc-code-cell-h)", minWidth: 0,
                  textAlign: "center", outline: "none", borderRadius: 14, padding: 0,
                  background: ch ? "rgba(99,102,241,0.09)" : "rgba(0,0,0,0.3)",
                  border: `2px solid ${ch ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                  color: "#a5b4fc", fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "var(--cc-code-cell-font)", fontWeight: 700, caretColor: "#6366f1",
                  textShadow: ch ? "0 0 16px rgba(99,102,241,0.7)" : "none",
                  transition: "all 0.15s",
                }}
                spellCheck={false} autoCapitalize="characters" autoComplete="off"
                inputMode="text"
              />
            ))}
          </div>

          <button
            onClick={() => doRetrieve()}
            disabled={!complete || stage === "loading"}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "15px 0", borderRadius: 14, cursor: complete ? "pointer" : "not-allowed",
              background: complete ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.04)",
              border: complete ? "none" : "1px solid rgba(255,255,255,0.06)",
              color: complete ? "#fff" : "#1e293b",
              fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", fontWeight: 700,
              boxShadow: complete ? "0 8px 30px rgba(99,102,241,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            {stage === "loading" ? (
              <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />Scanning Cloud…</>
            ) : (
              <><Search size={18} />Find Content</>
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Idle hint */}
          <div style={{
            marginTop: 20, padding: "20px", borderRadius: 14, textAlign: "center",
            border: "1px dashed rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)",
          }}>
            <p style={{ color: "#1e293b", fontSize: "0.8rem" }}>
              Enter the 6-character code shown on the sending device
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={PAD}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.1rem" }}>Content Found</span>
                <span style={{
                  padding: "2px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)",
                }}>{result?.type}</span>
              </div>
              <p style={{ color: "#334155", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
                Code: <span style={{ color: "#6366f1" }}>{result?.code}</span>
              </p>
            </div>
            <button onClick={reset} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600,
            }}>
              <ArrowLeft size={13} /> Back
            </button>
          </div>

          {result?.type === "text" && (
            <>
              <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
                  <FileText size={13} color="#334155" />
                  <span style={{ color: "#1e293b", fontSize: "0.72rem", fontWeight: 600 }}>{result.content.length.toLocaleString()} chars</span>
                </div>
                <div style={{ maxHeight: 220, overflowY: "auto", padding: "14px 16px" }}>
                  <pre style={{ color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                    {result.content}
                  </pre>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCopy} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 0", borderRadius: 14, cursor: "pointer",
                  background: copied ? "rgba(99,102,241,0.15)" : "linear-gradient(135deg, #6366f1, #a855f7)",
                  border: copied ? "1px solid rgba(99,102,241,0.3)" : "none",
                  color: copied ? "#a5b4fc" : "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 700,
                  boxShadow: copied ? "none" : "0 8px 24px rgba(99,102,241,0.3)",
                }}>
                  <Copy size={16} /> {copied ? "Copied!" : "Copy All Text"}
                </button>
                {resolvedLink && (
                  <a
                    href={resolvedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a5b4fc",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ExternalLink size={15} /> Open Link
                  </a>
                )}
              </div>
            </>
          )}

          {result?.type === "file" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {files.map((f, i) => {
                  const kind = fileKind(f.name);
                  const isImg = kind === "image";
                  const isVid = kind === "video";
                  const canPreview = isImg || isVid;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                          {isImg ? (
                            <img src={f.url} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                          ) : isVid ? <Film size={16} color="#818cf8" /> : <FileUp size={16} color="#818cf8" />}
                        </div>
                        <span style={{ flex: 1, color: "#e2e8f0", fontSize: "0.83rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                        {canPreview && (
                          <button onClick={() => setPreview(f)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                            <Eye size={12} /> View
                          </button>
                        )}
                        <a href={f.url} target="_blank" rel="noreferrer" download={f.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}>
                          <Download size={12} /> Get
                        </a>
                      </div>
                      {isImg && (
                        <img
                          src={f.url}
                          alt={f.name}
                          onClick={() => setPreview(f)}
                          loading="lazy"
                          style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)", cursor: "zoom-in" }}
                        />
                      )}
                      {isVid && (
                        <video
                          src={f.url}
                          controls
                          preload="metadata"
                          style={{ width: "100%", maxHeight: 320, borderRadius: 10, background: "#000", border: "1px solid rgba(255,255,255,0.04)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {files.length > 1 && (
                <button onClick={handleZip} disabled={zipping} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 0", borderRadius: 14, cursor: zipping ? "wait" : "pointer",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none", color: "#fff",
                  fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 700,
                  boxShadow: "0 8px 24px rgba(99,102,241,0.3)", opacity: zipping ? 0.7 : 1,
                }}>
                  {zipping ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />Building ZIP…</> : <><Archive size={16} />Download All as ZIP</>}
                </button>
              )}

              {/* Lightbox */}
              {preview && (
                <div
                  onClick={() => setPreview(null)}
                  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
                >
                  <button onClick={() => setPreview(null)} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={18} />
                  </button>
                  <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "88vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    {fileKind(preview.name) === "image" ? (
                      <img src={preview.url} alt={preview.name} style={{ maxWidth: "92vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }} />
                    ) : (
                      <video src={preview.url} controls autoPlay style={{ maxWidth: "92vw", maxHeight: "80vh", borderRadius: 12, background: "#000" }} />
                    )}
                    <span style={{ color: "#cbd5e1", fontSize: "0.85rem", fontFamily: "'JetBrains Mono', monospace" }}>{preview.name}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
