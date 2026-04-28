// server/routes/account.ts

import { Router } from "express";

const router = Router();

router.get("/dashboard", async (req, res) => {
  res.json({
    account: {
      displayName: "Investor",
      totalEquity: 125000,
      dayChange: 1250,
      dayChangePercent: 1.02,
      portfolioValue: 98000,
      cashBalance: 12000,
      buyingPower: 24000,
    },
    equityCurve: {
      change: 1250,
      range: "1M",
      points: [
        { t: "2026-04-20", v: 120000 },
        { t: "2026-04-21", v: 121200 },
        { t: "2026-04-22", v: 123000 },
        { t: "2026-04-23", v: 122500 },
        { t: "2026-04-24", v: 125000 },
      ],
    },
    positions: [],
    indices: [],
    recentOrders: [],
    recentTransactions: [],
    news: [],
  });
});

export default router;