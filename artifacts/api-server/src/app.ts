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

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5000",
    "https://orion-2026-fidelis.vercel.app",
    "https://orion-2026-fidelis-linas-projects-3515e4d1.vercel.app",
    "https://www.investmentorion.com",
    "https://investmentorion.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Admin-Pin-Token",
    "x-admin-pin-token",
  ],
};

app.use(
  pinoHttp({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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