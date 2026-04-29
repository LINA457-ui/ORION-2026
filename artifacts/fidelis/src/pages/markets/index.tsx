import { useState } from "react";
import {
  useListQuotes,
  useGetMarketMovers,
  useGetMarketIndices,
  useGetMarketNews,
} from "@workspace/api-client-react";
import { formatCurrency, formatChange } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DUMMY_QUOTES = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 189.44,
    change: 2.31,
    changePercent: 1.23,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    price: 421.88,
    change: 4.75,
    changePercent: 1.14,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    price: 887.52,
    change: 21.4,
    changePercent: 2.47,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    price: 232.16,
    change: -3.28,
    changePercent: -1.39,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer Cyclical",
    price: 184.91,
    change: 1.72,
    changePercent: 0.94,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    sector: "Communication",
    price: 512.68,
    change: 6.1,
    changePercent: 1.2,
  },
];

const DUMMY_INDICES = [
  {
    symbol: "SPX",
    name: "S&P 500",
    value: 5320.44,
    change: 43.12,
    changePercent: 0.82,
  },
  {
    symbol: "NDX",
    name: "Nasdaq 100",
    value: 18450.22,
    change: 207.91,
    changePercent: 1.14,
  },
  {
    symbol: "DJI",
    name: "Dow Jones",
    value: 39120.88,
    change: -70.44,
    changePercent: -0.18,
  },
  {
    symbol: "RUT",
    name: "Russell 2000",
    value: 2064.7,
    change: 18.9,
    changePercent: 0.92,
  },
];

const DUMMY_MOVERS = {
  gainers: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 887.52,
      change: 21.4,
      changePercent: 2.47,
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      price: 512.68,
      change: 6.1,
      changePercent: 1.2,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 421.88,
      change: 4.75,
      changePercent: 1.14,
    },
  ],
  losers: [
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 232.16,
      change: -3.28,
      changePercent: -1.39,
    },
    {
      symbol: "NFLX",
      name: "Netflix Inc.",
      price: 604.21,
      change: -4.05,
      changePercent: -0.67,
    },
    {
      symbol: "BA",
      name: "Boeing Company",
      price: 171.36,
      change: -2.12,
      changePercent: -1.22,
    },
  ],
  mostActive: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 189.44,
      change: 2.31,
      changePercent: 1.23,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 232.16,
      change: -3.28,
      changePercent: -1.39,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 184.91,
      change: 1.72,
      changePercent: 0.94,
    },
  ],
};

const DUMMY_NEWS = [
  {
    id: "1",
    headline: "Technology stocks push the market higher as investors return to growth names",
    summary:
      "Major technology companies led the broader market upward as traders focused on earnings strength and AI demand.",
    source: "MarketWatch",
    url: "#",
    publishedAt: "2026-04-29",
    symbols: ["NVDA", "MSFT", "AAPL"],
  },
  {
    id: "2",
    headline: "Wall Street watches earnings season as market confidence improves",
    summary:
      "Investors continue to monitor quarterly earnings, inflation data, and central bank signals.",
    source: "Bloomberg",
    url: "#",
    publishedAt: "2026-04-28",
    symbols: ["SPX", "NDX"],
  },
  {
    id: "3",
    headline: "Electric vehicle stocks trade mixed after latest delivery updates",
    summary:
      "EV companies showed mixed performance as analysts reviewed margins, delivery numbers, and demand trends.",
    source: "Reuters",
    url: "#",
    publishedAt: "2026-04-27",
    symbols: ["TSLA"],
  },
];

function safeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}

function normalizeMovers(value: any) {
  return {
    gainers: safeArray(value?.gainers, DUMMY_MOVERS.gainers),
    losers: safeArray(value?.losers, DUMMY_MOVERS.losers),
    mostActive: safeArray(value?.mostActive, DUMMY_MOVERS.mostActive),
  };
}

export default function MarketsPage() {
  const [search, setSearch] = useState("");

  const { data: quotesData, isLoading: loadingQuotes } = useListQuotes();
  const { data: moversData, isLoading: loadingMovers } = useGetMarketMovers();
  const { data: indicesData, isLoading: loadingIndices } = useGetMarketIndices();
  const { data: newsData, isLoading: loadingNews } = useGetMarketNews();

  const quotes = safeArray(quotesData, DUMMY_QUOTES);
  const indices = safeArray(indicesData, DUMMY_INDICES);
  const movers = normalizeMovers(moversData);
  const news = safeArray(newsData, DUMMY_NEWS);

  const filteredQuotes = quotes.filter((q: any) => {
    const symbol = String(q.symbol || "").toLowerCase();
    const name = String(q.name || "").toLowerCase();
    const term = search.toLowerCase();

    return symbol.includes(term) || name.includes(term);
  });

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Markets
        </h1>
        <p className="text-muted-foreground">
          Market research, quotes, and breaking news
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingIndices && indices.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          : indices.map((idx: any) => (
              <Card key={idx.symbol}>
                <CardContent className="p-4">
                  <div className="text-sm font-bold text-muted-foreground mb-1">
                    {idx.name}
                  </div>

                  <div className="text-xl font-bold">
                    {formatCurrency(Number(idx.value || 0))}
                  </div>

                  <div
                    className={`text-sm font-medium ${
                      Number(idx.change || 0) >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {formatChange(Number(idx.change || 0))} (
                    {formatChange(Number(idx.changePercent || 0), true)})
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Market Movers</CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="gainers">
                <TabsList className="mb-4">
                  <TabsTrigger
                    value="gainers"
                    className="data-[state=active]:text-success"
                  >
                    Top Gainers
                  </TabsTrigger>

                  <TabsTrigger
                    value="losers"
                    className="data-[state=active]:text-destructive"
                  >
                    Top Losers
                  </TabsTrigger>

                  <TabsTrigger value="mostActive">Most Active</TabsTrigger>
                </TabsList>

                {["gainers", "losers", "mostActive"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {loadingMovers && movers[tab as keyof typeof movers].length === 0
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))
                        : movers[tab as keyof typeof movers].map((quote: any) => (
                            <Link
                              key={quote.symbol}
                              href={`/markets/${quote.symbol}`}
                            >
                              <div className="p-3 border rounded-lg hover:border-primary transition-colors bg-muted/20 cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold">
                                    {quote.symbol}
                                  </span>

                                  <span className="font-medium">
                                    {formatCurrency(Number(quote.price || 0))}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground truncate w-24">
                                    {quote.name}
                                  </span>

                                  <span
                                    className={
                                      Number(quote.change || 0) >= 0
                                        ? "text-success font-medium"
                                        : "text-destructive font-medium"
                                    }
                                  >
                                    {formatChange(
                                      Number(quote.changePercent || 0),
                                      true
                                    )}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>All Symbols</CardTitle>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    placeholder="Search symbols or names..."
                    className="pl-9 bg-muted/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loadingQuotes && filteredQuotes.length === 0 ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No symbols found matching "{search}"
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotes.map((quote: any) => (
                        <TableRow
                          key={quote.symbol}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            (window.location.href = `/markets/${quote.symbol}`)
                          }
                        >
                          <TableCell className="font-bold text-primary">
                            {quote.symbol}
                          </TableCell>

                          <TableCell className="font-medium text-muted-foreground">
                            {quote.name}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-normal text-xs"
                            >
                              {quote.sector || "Market"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(quote.price || 0))}
                          </TableCell>

                          <TableCell
                            className={`text-right font-medium ${
                              Number(quote.change || 0) >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {formatChange(Number(quote.change || 0))}{" "}
                            <span className="text-xs">
                              ({formatChange(Number(quote.changePercent || 0), true)})
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market News</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-5">
                {loadingNews && news.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))
                  : news.map((item: any) => {
                      const symbols = Array.isArray(item.symbols)
                        ? item.symbols
                        : [];

                      return (
                        <a
                          key={item.id || item.headline}
                          href={item.url || "#"}
                          target={item.url && item.url !== "#" ? "_blank" : undefined}
                          rel="noreferrer"
                          className="block border-b pb-4 last:border-0 last:pb-0 hover:opacity-80 transition"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-xs font-bold text-primary">
                              {item.source || "Market Desk"}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {item.publishedAt
                                ? new Date(item.publishedAt).toLocaleDateString()
                                : "Today"}
                            </span>
                          </div>

                          <h4 className="font-bold leading-snug mb-2">
                            {item.headline || item.title}
                          </h4>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {item.summary || item.description || "Latest market update."}
                          </p>

                          {symbols.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {symbols.map((sym: string) => (
                                <Badge
                                  key={sym}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {sym}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </a>
                      );
                    })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}