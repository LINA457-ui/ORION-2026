import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import path from "path";

const rawPort = process.env.PORT || "5174";
const port = Number(rawPort);
const basePath = process.env.BASE_PATH || "/";
const apiUrl = process.env.VITE_API_URL || "http://localhost:5000";

function dashboardFallbackPlugin() {
  return {
    name: "dashboard-fallback-api",
    configureServer(server: any) {
      server.middlewares.use("/api/account/dashboard", (_req: any, res: any) => {
        res.setHeader("Content-Type", "application/json");

        res.end(
          JSON.stringify({
            account: {
              displayName: "Shina",
              totalEquity: 125000,
              dayChange: 2500,
              dayChangePercent: 2.1,
              portfolioValue: 90000,
              cashBalance: 35000,
              buyingPower: 70000,
            },

            equityCurve: {
              change: 2500,
              range: "1D",
              points: [
                {
                  t: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                  v: 120000,
                },
                {
                  t: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                  v: 121000,
                },
                {
                  t: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                  v: 123000,
                },
                {
                  t: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  v: 122500,
                },
                {
                  t: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                  v: 125000,
                },
              ],
            },

            positions: [
              {
                id: "pos-1",
                symbol: "AAPL",
                name: "Apple Inc.",
                quantity: 10,
                averagePrice: 170,
                currentPrice: 185.25,
                marketValue: 1852.5,
                dayChange: 1.2,
                dayChangePercent: 1.2,
              },
              {
                id: "pos-2",
                symbol: "NVDA",
                name: "NVIDIA Corp.",
                quantity: 4,
                averagePrice: 820,
                currentPrice: 925.8,
                marketValue: 3703.2,
                dayChange: 2.4,
                dayChangePercent: 2.4,
              },
            ],

            watchlist: [
              {
                id: "watch-1",
                symbol: "AAPL",
                name: "Apple Inc.",
                price: 185.25,
                change: 1.2,
                changePercent: 1.2,
              },
              {
                id: "watch-2",
                symbol: "TSLA",
                name: "Tesla Inc.",
                price: 172.43,
                change: -0.8,
                changePercent: -0.8,
              },
            ],

            indices: [
              {
                name: "S&P 500",
                symbol: "SPX",
                value: 5200,
                change: 40,
                changePercent: 0.78,
              },
              {
                name: "NASDAQ",
                symbol: "IXIC",
                value: 16200,
                change: 120,
                changePercent: 1.1,
              },
            ],

            movers: [
              {
                symbol: "NVDA",
                price: 925.8,
                change: 2.4,
                changePercent: 2.4,
              },
              {
                symbol: "TSLA",
                price: 172.43,
                change: -0.8,
                changePercent: -0.8,
              },
            ],

            recentOrders: [
              {
                id: "order-1",
                symbol: "AAPL",
                side: "buy",
                quantity: 5,
                price: 185.25,
                total: 926.25,
                status: "filled",
                createdAt: new Date().toISOString(),
              },
            ],

            recentTransactions: [
              {
                id: "tx-1",
                type: "deposit",
                amount: 5000,
                status: "completed",
                description: "Demo deposit",
                createdAt: new Date().toISOString(),
              },
            ],

            news: [
              {
                id: "news-1",
                headline: "Markets open higher as tech stocks rise",
                title: "Markets open higher as tech stocks rise",
                source: "Demo News",
                symbols: ["AAPL", "NVDA"],
                url: "#",
                publishedAt: new Date().toISOString(),
              },
            ],
          })
        );
      });
    },
  };
}

export default defineConfig(async () => {
  const replitPlugins =
    process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          (
            await import("@replit/vite-plugin-cartographer")
          ).cartographer({
            root: path.resolve(import.meta.dirname, ".."),
          }),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : [];

  return {
    base: basePath,

    root: path.resolve(import.meta.dirname),

    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      dashboardFallbackPlugin(),
      ...replitPlugins,
    ],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),

        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets"
        ),

        "@workspace/api-client-react": path.resolve(
          import.meta.dirname,
          "../../lib/api-client-react/src"
        ),

        "@workspace/api-client": path.resolve(
          import.meta.dirname,
          "../../lib/api-client/src"
        ),

        "@workspace/api-zod": path.resolve(
          import.meta.dirname,
          "../../lib/api-zod/src"
        ),
      },

      dedupe: ["react", "react-dom"],
    },

    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },

    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,

      fs: {
        strict: false,
        allow: [
          path.resolve(import.meta.dirname),
          path.resolve(import.meta.dirname, "../.."),
        ],
      },

      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});