import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config"; // Initialize i18next
import { initializeCapacitor } from "./lib/capacitor-init";
import { registerServiceWorker } from "./lib/pwa-register";

// Initialize theme from localStorage before render to prevent flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else if (savedTheme === 'light') {
  document.documentElement.classList.remove('dark');
}

// Initialize Capacitor plugins for native apps
initializeCapacitor().catch(console.error);

// Register PWA service worker - delayed and conditional for crawlers
// Only runs on client-side, won't block rendering or cause errors for bots
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  setTimeout(() => {
    registerServiceWorker().catch(() => {
      // Silent fail - PWA is optional enhancement
    });
  }, 1000);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
