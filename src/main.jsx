import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import { ClerkProvider } from "@clerk/react";

import "./index.css";
import "./i18n/i18n";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// A tab left open across a deployment may request a chunk hash that has just
// been replaced. Retry once for that exact asset so the browser loads the new
// HTML manifest, while avoiding an endless reload loop for a genuinely broken chunk.
window.addEventListener("vite:preloadError", (event) => {
  const failedAsset = event.payload?.url || event.payload?.message || window.location.pathname;
  const retryKey = `meratailor:chunk-retry:${failedAsset}`;
  try {
    if (window.sessionStorage.getItem(retryKey)) return;
    window.sessionStorage.setItem(retryKey, "1");
  } catch {
    // If browser storage is unavailable, fall through to the normal error boundary.
    return;
  }

  event.preventDefault();
  window.location.reload();
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContextProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </AppContextProvider>
    </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  PUBLISHABLE_KEY ? <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{app}</ClerkProvider> : app,
);
