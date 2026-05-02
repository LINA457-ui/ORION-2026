import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./routes";

const app = express();

/* =========================
   🔥 CORS — GLOBAL FIRST
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://orion-2026-fidelis.vercel.app",
  "https://orion-2026-fidelis-linas-projects-3515e4d1.vercel.app",
  "https://www.investmentorion.com",
  "https://investmentorion.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Blocked by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Admin-Pin-Token",
      "x-admin-pin-token",
    ],
  })
);

/* 🔥 THIS IS CRITICAL — YOU WERE MISSING IT */
app.options("*", cors());

/* =========================
   BODY + COOKIES
========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
   HEALTH
========================= */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* =========================
   ROUTES (AFTER CORS)
========================= */
app.use("/api", router);

export default app;