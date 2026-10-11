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

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContextProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppContextProvider>
    </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  PUBLISHABLE_KEY ? <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{app}</ClerkProvider> : app,
);
