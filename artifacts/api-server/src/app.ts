import express, { type Request, type Response, type RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createRequire } from "node:module";

import router from "./routes";

const require = createRequire(import.meta.url);
const pinoHttp = require("pino-http") as (options?: {
  level?: string;
}) => RequestHandler;

const app = express();

/* =========================
   LOGGER
========================= */
app.use(
  pinoHttp({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
);

/* =========================
   🔥 CORS (CRITICAL FIX)
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
      if (!origin) return callback(null, true); // allow server-to-server / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Admin-Pin-Token",
      "x-admin-pin-token",
    ],
  }),
);

/* 🔥 THIS LINE IS WHAT YOU WERE MISSING */
app.options("*", cors());

/* =========================
   BODY + COOKIES
========================= */
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   ROUTES
========================= */
app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Orion API server is running",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
  });
});

app.use("/api", router);

export default app;