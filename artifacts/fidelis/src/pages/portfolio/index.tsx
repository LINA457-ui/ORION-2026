import { useState } from "react";
import {
  useListPositions,
  useGetAllocation,
  useGetAccountPerformance,
} from "@workspace/api-client-react";
import { formatCurrency, formatChange } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const DUMMY_POSITIONS = [
  {
    id: "pos_1",
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 120,
    currentPrice: 189.44,
    dayChange: 2.31,
    dayChangePercent: 1.23,
    averageCost: 172.2,
    unrealizedPnl: 2068.8,
    unrealizedPnlPercent: 10.01,
    marketValue: 22732.8,
  },
  {
    id: "pos_2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    quantity: 65,
    currentPrice: 421.88,
    dayChange: 4.75,
    dayChangePercent: 1.14,
    averageCost: 388.1,
    unrealizedPnl: 2195.7,
    unrealizedPnlPercent: 8.7,
    marketValue: 27422.2,
  },
  {
    id: "pos_3",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    quantity: 40,
    currentPrice: 887.52,
    dayChange: 21.4,
    dayChangePercent: 2.47,
    averageCost: 720.5,
    unrealizedPnl: 6680.8,
    unrealizedPnlPercent: 23.18,
    marketValue: 35500.8,
  },
  {
    id: "pos_4",
    symbol: "TSLA",
    name: "Tesla Inc.",
    quantity: 80,
    currentPrice: 232.16,
    dayChange: -3.28,
    dayChangePercent: -1.39,
    averageCost: 245.75,
    unrealizedPnl: -1087.2,
    unrealizedPnlPercent: -5.53,
    marketValue: 18572.8,
  },
  {
    id: "pos_5",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    quantity: 90,
    currentPrice: 184.91,
    dayChange: 1.72,
    dayChangePercent: 0.94,
    averageCost: 166.4,
    unrealizedPnl: 1665.9,
    unrealizedPnlPercent: 11.12,
    marketValue: 16641.9,
  },
];

const DUMMY_ALLOCATION = {
  bySector: [
    { label: "Technology", value: 85655.8, percent: 70.85 },
    { label: "Consumer Cyclical", value: 35214.7, percent: 29.15 },
  ],
  byAsset: [
    { label: "Stocks", value: 120870.5, percent: 82.4 },
    { label: "Cash", value: 25810.25, percent: 17.6 },
  ],
};

const DUMMY_PERFORMANCE = {
  change: 4280.45,
  changePercent: 3.58,
  points: [
    { t: "2026-04-01T09:00:00", v: 116200 },
    { t: "2026-04-05T09:00:00", v: 117850 },
    { t: "2026-04-10T09:00:00", v: 115900 },
    { t: "2026-04-15T09:00:00", v: 119400 },
    { t: "2026-04-20T09:00:00", v: 121300 },
    { t: "2026-04-25T09:00:00", v: 123600 },
    { t: "2026-04-29T09:00:00", v: 120870.5 },
  ],
};

function safeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function PortfolioPage() {
  const [range, setRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">(
    "1M"
  );

  const { data: positionsData, isLoading: loadingPos } = useListPositions();
  const { data: allocationData, isLoading: loadingAlloc } = useGetAllocation();
  const { data: performanceData, isLoading: loadingPerf } =
    useGetAccountPerformance({ range });

  const positions = safeArray(positionsData, DUMMY_POSITIONS);

  const allocation =
    allocationData && typeof allocationData === "object"
      ? allocationData
      : DUMMY_ALLOCATION;

  const bySector = safeArray(
    (allocation as any)?.bySector,
    DUMMY_ALLOCATION.bySector
  );

  const byAsset = safeArray(
    (allocation as any)?.byAsset,
    DUMMY_ALLOCATION.byAsset
  );

  const performance =
    performanceData && typeof performanceData === "object"
      ? {
          ...DUMMY_PERFORMANCE,
          ...(performanceData as any),
          points: safeArray(
            (performanceData as any)?.points,
            DUMMY_PERFORMANCE.points
          ),
        }
      : DUMMY_PERFORMANCE;

  const performancePoints = safeArray(
    performance.points,
    DUMMY_PERFORMANCE.points
  );

  const totalMarketValue = positions.reduce(
    (acc: number, pos: any) => acc + safeNumber(pos.marketValue),
    0
  );

  const totalUnrealizedPnl = positions.reduce(
    (acc: number, pos: any) => acc + safeNumber(pos.unrealizedPnl),
    0
  );

  const isLoading = loadingPos || loadingAlloc || loadingPerf;

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
  ];

  return (
    <div className="space-y-6 pb-8">
      {isLoading ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700">
          Loading live portfolio data. Showing protected demo figures.
        </div>
      ) : null}

      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Portfolio
        </h1>
        <p className="text-muted-foreground">
          Manage your holdings and asset allocation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Total Market Value
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(totalMarketValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Total Unrealized P&L
            </div>
            <div
              className={`text-3xl font-bold ${
                totalUnrealizedPnl >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {formatChange(totalUnrealizedPnl)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Positions Count
            </div>
            <div className="text-3xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Day Change</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Total Return</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {positions.map((pos: any) => (
                  <TableRow key={pos.id || pos.symbol} className="group">
                    <TableCell className="font-medium">
                      <Link
                        href={`/markets/${pos.symbol}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {pos.symbol}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="text-xs text-muted-foreground font-normal">
                        {pos.name}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {safeNumber(pos.quantity)}
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {formatCurrency(safeNumber(pos.currentPrice))}
                    </TableCell>

                    <TableCell
                      className={`text-right ${
                        safeNumber(pos.dayChange) >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {formatChange(safeNumber(pos.dayChange))}
                      <div className="text-xs">
                        {formatChange(safeNumber(pos.dayChangePercent), true)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {formatCurrency(safeNumber(pos.averageCost))}
                    </TableCell>

                    <TableCell
                      className={`text-right ${
                        safeNumber(pos.unrealizedPnl) >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {formatChange(safeNumber(pos.unrealizedPnl))}
                      <div className="text-xs">
                        {formatChange(
                          safeNumber(pos.unrealizedPnlPercent),
                          true
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-bold">
                      {formatCurrency(safeNumber(pos.marketValue))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Historical Performance</CardTitle>
                <CardDescription>
                  <span
                    className={
                      safeNumber(performance.change) >= 0
                        ? "text-success font-medium"
                        : "text-destructive font-medium"
                    }
                  >
                    {formatChange(safeNumber(performance.change))} (
                    {formatChange(
                      safeNumber(performance.changePercent),
                      true
                    )}
                    )
                  </span>
                </CardDescription>
              </div>

              <div className="flex gap-1 bg-muted p-1 rounded-md">
                {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                      range === r
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performancePoints}
                    margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />

                    <XAxis
                      dataKey="t"
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return range === "1D"
                          ? `${d.getHours()}:${d
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}`
                          : d.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            });
                      }}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />

                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Value",
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={
                        safeNumber(performance.change) >= 0
                          ? "hsl(var(--success))"
                          : "hsl(var(--destructive))"
                      }
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center">
                <div className="h-[300px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bySector}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {bySector.map((entry: any, index: number) => (
                          <Cell
                            key={`sector-cell-${entry.label}-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full mt-4 space-y-2">
                  {bySector.map((item: any, i: number) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex gap-4">
                        <span className="font-medium">
                          {formatCurrency(safeNumber(item.value))}
                        </span>
                        <span className="text-muted-foreground w-12 text-right">
                          {formatChange(safeNumber(item.percent), true)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center">
                <div className="h-[300px] w-full max-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byAsset}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {byAsset.map((entry: any, index: number) => (
                          <Cell
                            key={`asset-cell-${entry.label}-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full mt-4 space-y-2">
                  {byAsset.map((item: any, i: number) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex gap-4">
                        <span className="font-medium">
                          {formatCurrency(safeNumber(item.value))}
                        </span>
                        <span className="text-muted-foreground w-12 text-right">
                          {formatChange(safeNumber(item.percent), true)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}