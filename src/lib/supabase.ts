import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://luunzeonlmzvmewaucqj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dW56ZW9ubG16dm1ld2F1Y3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzAyNzEsImV4cCI6MjA4NTcwNjI3MX0.qQpWEGFLg6Weof0NO_ApntTrGGYVsrsNB2zaujRMuFY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let res = "";
  for (let i = 0; i < 6; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface HistoryItem {
  code: string;
  action: "send" | "retrieve";
  contentType: "text" | "file";
  preview: string;
  ts: number;
}

const HISTORY_KEY = "cc_hist_v2";
const TTL_MS = 24 * 60 * 60 * 1000;

function pruneExpired(items: HistoryItem[]): HistoryItem[] {
  const cutoff = Date.now() - TTL_MS;
  return items.filter((h) => typeof h.ts === "number" && h.ts >= cutoff);
}

export function addToHistory(item: HistoryItem) {
  let hist: HistoryItem[] = [];
  try { hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch {}
  hist = pruneExpired(hist).filter((h) => !(h.code === item.code && h.action === item.action));
  hist.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 20)));
}

export function getHistory(): HistoryItem[] {
  let hist: HistoryItem[] = [];
  try { hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch {}
  const pruned = pruneExpired(hist);
  if (pruned.length !== hist.length) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(pruned));
  }
  return pruned;
}

export function clearHistoryStore() {
  localStorage.removeItem(HISTORY_KEY);
}

// Detect image/video files so the UI can render previews.
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;
export function fileKind(name: string): "image" | "video" | "other" {
  if (IMAGE_EXT.test(name)) return "image";
  if (VIDEO_EXT.test(name)) return "video";
  return "other";
}

