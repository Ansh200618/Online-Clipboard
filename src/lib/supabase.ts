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

export function addToHistory(item: HistoryItem) {
  let hist: HistoryItem[] = JSON.parse(localStorage.getItem("cc_hist_v2") || "[]");
  hist = hist.filter((h) => !(h.code === item.code && h.action === item.action));
  hist.unshift(item);
  localStorage.setItem("cc_hist_v2", JSON.stringify(hist.slice(0, 20)));
}

export function getHistory(): HistoryItem[] {
  return JSON.parse(localStorage.getItem("cc_hist_v2") || "[]");
}

export function clearHistoryStore() {
  localStorage.removeItem("cc_hist_v2");
}
