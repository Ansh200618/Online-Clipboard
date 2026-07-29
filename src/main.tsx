import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import App from "./app/App.tsx";
import AdminPage from "./app/pages/AdminPage.tsx";
import "./styles/index.css";

const BASE_URL = "https://copycloud.me";
const CANONICAL_PATH_OVERRIDES: Record<string, string> = {
  "/app": "/",
  "/send": "/",
  "/retrieve": "/",
  "/history": "/",
  "/about": "/",
  "/index": "/",
  "/index.html": "/",
};

function removeTrailingSlash(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function getCanonicalPath(pathname: string): string {
  const normalized = removeTrailingSlash(pathname) || "/";
  return CANONICAL_PATH_OVERRIDES[normalized] ?? normalized;
}

function CanonicalUpdater() {
  const location = useLocation();
  useEffect(() => {
    // Updates the existing <link rel="canonical"> in index.html on each route change.
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `${BASE_URL}${getCanonicalPath(location.pathname)}`;
    }
  }, [location.pathname]);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <CanonicalUpdater />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin-approval" element={<AdminPage />} />
    </Routes>
  </BrowserRouter>
);
