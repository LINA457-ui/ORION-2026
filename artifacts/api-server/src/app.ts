import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttpModule from "pino-http";

const pinoHttp =
  typeof pinoHttpModule === "function"
    ? pinoHttpModule
    : (pinoHttpModule as unknown as { default: typeof pinoHttpModule }).default;

const app = express();

app.use(
  pinoHttp({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  })
);

app.use(
  cors({
    origin: true,
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