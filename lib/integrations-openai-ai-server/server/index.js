import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

let conversations = [];
let messages = {};

app.get("/api/openai/conversations", (req, res) => {
  res.json(conversations);
});

app.post("/api/openai/conversations", (req, res) => {
  const newConversation = {
    id: Date.now(),
    title: req.body?.title || req.body?.data?.title || "New Chat",
  };

  conversations.unshift(newConversation);
  messages[newConversation.id] = [];

  res.json(newConversation);
});

app.delete("/api/openai/conversations/:id", (req, res) => {
  const id = Number(req.params.id);

  conversations = conversations.filter((conversation) => conversation.id !== id);
  delete messages[id];

  res.json({ success: true });
});

app.get("/api/openai/conversations/:id/messages", (req, res) => {
  const id = Number(req.params.id);

  res.json(messages[id] || []);
});

app.post("/api/openai/conversations/:id/messages", (req, res) => {
  const id = Number(req.params.id);
  const content = req.body?.content || req.body?.data?.content || "";

  if (!messages[id]) {
    messages[id] = [];
  }

  const userMessage = {
    id: Date.now(),
    role: "user",
    content,
  };

  const assistantMessage = {
    id: Date.now() + 1,
    role: "assistant",
    content: "I received your message. OpenAI streaming will be connected next.",
  };

  messages[id].push(userMessage, assistantMessage);

  res.json(assistantMessage);
});

app.get("/api/account/me", (req, res) => {
  res.json({
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    balance: 25000,
    buyingPower: 18000,
    equity: 30000,
  });
});

app.get("/api/account/performance", (req, res) => {
  res.json({
    range: req.query.range || "1M",
    change: 4.2,
    points: [
      { date: "2026-04-01", value: 25000 },
      { date: "2026-04-10", value: 27000 },
      { date: "2026-04-20", value: 30000 },
    ],
  });
});

app.get("/api/account/watchlist", (req, res) => {
  res.json([
    { symbol: "AAPL", name: "Apple Inc.", price: 185.25, change: 1.2 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 172.43, change: -0.8 },
  ]);
});

app.get("/api/account/transactions", (req, res) => {
  res.json([
    {
      id: 1,
      type: "deposit",
      amount: 5000,
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ]);
});

app.get("/api/portfolio/positions", (req, res) => {
  res.json([
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 10,
      averagePrice: 170,
      currentPrice: 185.25,
      value: 1852.5,
      pnl: 152.5,
    },
  ]);
});

app.get("/api/portfolio/allocation", (req, res) => {
  res.json([
    { name: "Technology", value: 65 },
    { name: "Cash", value: 35 },
  ]);
});

app.get("/api/market/quotes", (req, res) => {
  res.json([
    { symbol: "AAPL", price: 185.25, change: 1.2 },
    { symbol: "TSLA", price: 172.43, change: -0.8 },
    { symbol: "NVDA", price: 925.8, change: 2.4 },
  ]);
});

app.get("/api/market/movers", (req, res) => {
  res.json({
    gainers: [
      { symbol: "NVDA", price: 925.8, change: 2.4 },
      { symbol: "AAPL", price: 185.25, change: 1.2 },
    ],
    losers: [
      { symbol: "TSLA", price: 172.43, change: -0.8 },
    ],
  });
});

app.get("/api/market/news", (req, res) => {
  res.json([
    {
      id: 1,
      title: "Markets open higher as tech stocks rise",
      source: "Demo News",
      url: "#",
      publishedAt: new Date().toISOString(),
    },
  ]);
});

app.get("/api/market/indices", (req, res) => {
  res.json([
    { name: "S&P 500", symbol: "SPX", value: 5100, change: 0.7 },
    { name: "NASDAQ", symbol: "IXIC", value: 16200, change: 1.1 },
  ]);
});

app.get("/api/trading/orders", (req, res) => {
  res.json([
    {
      id: 1,
      symbol: "AAPL",
      side: "buy",
      quantity: 5,
      status: "filled",
      createdAt: new Date().toISOString(),
    },
  ]);
});

app.post("/api/payments/deposit", (req, res) => {
  res.json({
    success: true,
    message: "Demo deposit successful",
    amount: req.body?.amount || 0,
  });
});

// ... your other routes above

app.get("/api/account/dashboard", (req, res) => {
  res.json({
    account: {
      displayName: "Demo User",
      totalEquity: 30000,
      dayChange: 500,
      dayChangePercent: 1.7,
      portfolioValue: 12000,
      cashBalance: 18000,
      buyingPower: 18000,
    },
    equityCurve: {
      range: "1M",
      change: 500,
      points: [
        { t: "2026-04-01T00:00:00.000Z", v: 25000 },
        { t: "2026-04-10T00:00:00.000Z", v: 27000 },
        { t: "2026-04-20T00:00:00.000Z", v: 30000 },
      ],
    },
    positions: [
      {
        id: 1,
        symbol: "AAPL",
        quantity: 10,
        marketValue: 1852.5,
        dayChange: 1.2,
        dayChangePercent: 1.2,
      },
    ],
    watchlist: [],
    indices: [
      {
        name: "S&P 500",
        symbol: "SPX",
        value: 5100,
        change: 0.7,
        changePercent: 0.7,
      },
      {
        name: "NASDAQ",
        symbol: "IXIC",
        value: 16200,
        change: 1.1,
        changePercent: 1.1,
      },
    ],
    movers: [],
    recentOrders: [
      {
        id: 1,
        symbol: "AAPL",
        side: "buy",
        quantity: 5,
        price: 185.25,
        total: 926.25,
        createdAt: new Date().toISOString(),
      },
    ],
    recentTransactions: [
      {
        id: 1,
        type: "deposit",
        amount: 5000,
        description: "Demo deposit",
        createdAt: new Date().toISOString(),
      },
    ],
    news: [
      {
        id: 1,
        headline: "Markets open higher as tech stocks rise",
        source: "Demo News",
        symbols: ["AAPL", "NVDA"],
        publishedAt: new Date().toISOString(),
      },
    ],
  });
});

// 👇 KEEP THIS LAST
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});

