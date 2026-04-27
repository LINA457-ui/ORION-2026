import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById("root")!;

if (!clerkPubKey) {
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fff;color:#0a0a0a;padding:24px;">
      <div style="max-width:520px;text-align:center;">
        <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;">Authentication is not configured</h1>
        <p style="color:#525252;margin:0 0 16px;line-height:1.5;">
          The sign-in service publishable key is missing from this build. If you are the site owner,
          set <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px;">VITE_CLERK_PUBLISHABLE_KEY</code>
          in your environment and re-publish.
        </p>
      </div>
    </div>`;
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY at build time");
}

createRoot(rootElement).render(
  <ClerkProvider publishableKey={clerkPubKey} signInUrl="/sign-in" signUpUrl="/sign-up">
    <App />
  </ClerkProvider>
);
