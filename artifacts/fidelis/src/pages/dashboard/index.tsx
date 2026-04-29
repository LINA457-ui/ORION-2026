import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  Clock3,
  Landmark,
  Newspaper,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";

const DUMMY_SUMMARY = {
  account: {
    displayName: "Shina Hustle",
    totalEquity: 245680.75,
    dayChange: 3280.45,
    dayChangePercent: 1.36,
    portfolioValue: 198430.5,
    cashBalance: 47250.25,
    buyingPower: 94500.5,
  },
  equityCurve: {
    change: 1.36,
    range: "1D",
    points: [
      { t: "2026-04-29T09:00:00", v: 239800 },
      { t: "2026-04-29T10:00:00", v: 241200 },
      { t: "2026-04-29T11:00:00", v: 240650 },
      { t: "2026-04-29T12:00:00", v: 242900 },
      { t: "2026-04-29T13:00:00", v: 244100 },
      { t: "2026-04-29T14:00:00", v: 245680 },
    ],
  },
  positions: [
    { id: "1", symbol: "AAPL", quantity: 120, marketValue: 24500, dayChangePercent: 1.25 },
    { id: "2", symbol: "TSLA", quantity: 80, marketValue: 18600, dayChangePercent: -0.72 },
    { id: "3", symbol: "NVDA", quantity: 40, marketValue: 35600, dayChangePercent: 2.44 },
    { id: "4", symbol: "MSFT", quantity: 65, marketValue: 29100, dayChangePercent: 0.88 },
    { id: "5", symbol: "AMZN", quantity: 90, marketValue: 17400, dayChangePercent: 1.11 },
  ],
  indices: [
    { symbol: "SPX", name: "S&P 500", value: 5320.44, changePercent: 0.82 },
    { symbol: "NDX", name: "Nasdaq 100", value: 18450.22, changePercent: 1.14 },
    { symbol: "DJI", name: "Dow Jones", value: 39120.88, changePercent: -0.18 },
  ],
  recentOrders: [
    { id: "o1", side: "buy", symbol: "NVDA", quantity: 10, price: 890, total: 8900, createdAt: "2026-04-29" },
    { id: "o2", side: "sell", symbol: "TSLA", quantity: 5, price: 232, total: 1160, createdAt: "2026-04-28" },
    { id: "o3", side: "buy", symbol: "AAPL", quantity: 15, price: 185, total: 2775, createdAt: "2026-04-27" },
  ],
  recentTransactions: [
    { id: "t1", type: "deposit", amount: 10000, description: "Account funding", createdAt: "2026-04-29" },
    { id: "t2", type: "dividend", amount: 320.5, description: "Dividend received", createdAt: "2026-04-25" },
    { id: "t3", type: "fee", amount: -15, description: "Trading fee", createdAt: "2026-04-22" },
  ],
  news: [
    {
      id: "n1",
      source: "MarketWatch",
      headline: "Technology stocks push major indices higher",
      publishedAt: "2026-04-29",
      url: "#",
      symbols: ["NVDA", "MSFT"],
    },
    {
      id: "n2",
      source: "Bloomberg",
      headline: "Investors watch earnings as markets continue recovery",
      publishedAt: "2026-04-28",
      url: "#",
      symbols: ["AAPL", "AMZN"],
    },
  ],
};

function money(value: number | string | undefined | null) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function percent(value: number | string | undefined | null) {
  const amount = Number(value || 0);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toFixed(2)}%`;
}

function shortDate(value: string | undefined | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function safeArray(value: any, fallback: any[]) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold tracking-[-0.01em] text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function ViewAll({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
      View all <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardSummary();

  const apiSummary = data && typeof data === "object" ? data : {};

  const summary = {
    ...DUMMY_SUMMARY,
    ...apiSummary,
    account: {
      ...DUMMY_SUMMARY.account,
      ...(apiSummary as any).account,
    },
    equityCurve: {
      ...DUMMY_SUMMARY.equityCurve,
      ...(apiSummary as any).equityCurve,
      points: safeArray((apiSummary as any).equityCurve?.points, DUMMY_SUMMARY.equityCurve.points),
    },
    positions: safeArray((apiSummary as any).positions, DUMMY_SUMMARY.positions),
    indices: safeArray((apiSummary as any).indices, DUMMY_SUMMARY.indices),
    recentOrders: safeArray((apiSummary as any).recentOrders, DUMMY_SUMMARY.recentOrders),
    recentTransactions: safeArray((apiSummary as any).recentTransactions, DUMMY_SUMMARY.recentTransactions),
    news: safeArray((apiSummary as any).news, DUMMY_SUMMARY.news),
  };

  const account = summary.account;
  const equityCurve = summary.equityCurve;
  const positions = summary.positions;
  const indices = summary.indices;
  const recentOrders = summary.recentOrders;
  const recentTransactions = summary.recentTransactions;
  const news = summary.news;

  const isPositive = Number(account.dayChange || 0) >= 0;

  const stats = [
    { label: "Portfolio Value", value: money(account.portfolioValue), sub: "Invested assets", icon: BriefcaseBusiness },
    { label: "Cash Balance", value: money(account.cashBalance), sub: "Available cash", icon: Wallet },
    { label: "Buying Power", value: money(account.buyingPower), sub: "Ready to trade", icon: TrendingUp },
    { label: "Today’s Change", value: money(account.dayChange), sub: percent(account.dayChangePercent), icon: Landmark },
  ];

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px] space-y-5">
        {isLoading ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-700">
            Loading live data. Showing protected demo data.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/65">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Orion Investment Dashboard
              </div>

              <h1 className="max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Welcome back, {account.displayName}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
                Track your portfolio, cash balance, market movement, trades and investment updates from one clean workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Total Equity</p>

              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                {money(account.totalEquity)}
              </p>

              <div className={`mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                isPositive ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"
              }`}>
                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {money(account.dayChange)} · {percent(account.dayChangePercent)}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{item.value}</p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500">{item.sub}</p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.65fr_0.85fr]">
          <Card>
            <SectionHeader
              title="Performance"
              description={`Portfolio value over time (${equityCurve.range})`}
              action={
                <Link href="/portfolio" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
                  Full Details
                </Link>
              }
            />

            <div className="h-[340px] px-2 pb-4 pt-5 sm:px-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve.points} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />

                  <XAxis
                    dataKey="t"
                    tickFormatter={(value) => {
                      const d = new Date(value);
                      return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
                    }}
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={72}
                  />

                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      boxShadow: "0 14px 40px rgba(15, 23, 42, 0.1)",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [money(Number(value)), "Value"]}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />

                  <Area type="monotone" dataKey="v" stroke="#059669" strokeWidth={3} fill="url(#equityFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <SectionHeader title="Top Positions" description="Your largest holdings" />

            <div className="space-y-3 p-4">
              {positions.slice(0, 5).map((pos: any) => (
                <div key={pos.id || pos.symbol} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <Link href={`/markets/${pos.symbol}`} className="text-sm font-bold text-slate-950 hover:underline">
                      {pos.symbol}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{pos.quantity} shares</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{money(pos.marketValue)}</p>
                    <p className={`mt-1 text-xs font-bold ${Number(pos.dayChangePercent || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {percent(pos.dayChangePercent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Card>
            <SectionHeader title="Recent Orders" description="Latest trades on your account" action={<ViewAll href="/portfolio" />} />

            <div className="space-y-3 p-4">
              {recentOrders.slice(0, 5).map((order: any) => {
                const isBuy = order.side === "buy";

                return (
                  <div key={order.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isBuy ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {isBuy ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${isBuy ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {order.side}
                          </span>

                          <Link href={`/markets/${order.symbol}`} className="text-sm font-bold text-slate-950 hover:underline">
                            {order.symbol}
                          </Link>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.quantity} shares @ {money(order.price)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-950">{money(order.total)}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {shortDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Recent Transactions" description="Deposits, dividends and fees" action={<ViewAll href="/transactions" />} />

            <div className="space-y-3 p-4">
              {recentTransactions.slice(0, 5).map((transaction: any) => {
                const isTransactionPositive = Number(transaction.amount || 0) >= 0;
                const Icon = transaction.type === "deposit" ? Banknote : ReceiptText;

                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isTransactionPositive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold capitalize text-slate-950">{transaction.type}</p>
                        <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                          {transaction.description || "Transaction"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold ${isTransactionPositive ? "text-emerald-600" : "text-slate-950"}`}>
                        {isTransactionPositive ? "+" : ""}
                        {money(transaction.amount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{shortDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <SectionHeader title="Market Indices" description="Major market benchmarks" action={<ViewAll href="/markets" />} />

            <div className="space-y-3 p-4">
              {indices.map((indexItem: any) => (
                <div key={indexItem.symbol} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">{indexItem.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{indexItem.symbol}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{money(indexItem.value)}</p>
                    <p className={`mt-1 text-xs font-bold ${Number(indexItem.changePercent || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {percent(indexItem.changePercent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Recent News" description="Market stories and updates" />

            <div className="grid gap-3 p-4 md:grid-cols-2">
              {news.slice(0, 4).map((item: any) => (
                <article key={item.id || item.headline} className="rounded-xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                    <Newspaper className="h-3.5 w-3.5" />
                    <span className="font-bold text-slate-800">{item.source}</span>
                    <span>•</span>
                    <span>{shortDate(item.publishedAt)}</span>
                  </div>

                  <a href={item.url || "#"} className="line-clamp-2 text-sm font-bold leading-6 text-slate-950 hover:underline">
                    {item.headline || item.title}
                  </a>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(item.symbols ?? []).map((symbol: string) => (
                      <span key={symbol} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        {symbol}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}