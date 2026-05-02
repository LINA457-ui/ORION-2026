import express, { type Request, type Response, type RequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pinoHttp = require("pino-http") as (options?: {
  level?: string;
}) => RequestHandler;

const app = express();

app.use(
  pinoHttp({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://orion-2026-fidelis.vercel.app",
      "https://www.investmentorion.com",
      "https://investmentorion.com",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

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

export default app;