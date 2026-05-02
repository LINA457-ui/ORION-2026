import express from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import router from "./routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://orion-2026-fidelis.vercel.app",
  "https://orion-2026-fidelis-linas-projects-3515e4d1.vercel.app",
  "https://www.investmentorion.com",
  "https://investmentorion.com",
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Blocked by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Admin-Pin-Token",
    "x-admin-pin-token",
  ],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "");
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Admin-Pin-Token, x-admin-pin-token",
    );
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Orion API server is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "latest-orion-api-server",
  });
});

app.use("/api", router);

export default app;