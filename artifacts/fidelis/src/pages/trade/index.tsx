import { useMemo, useState } from "react";
import {
  useListQuotes,
  usePlaceOrder,
  useListOrders,
  useGetMyAccount,
} from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

const DUMMY_QUOTES = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.44 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 421.88 },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 887.52 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 232.16 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 184.91 },
];

const DUMMY_ORDERS = [
  {
    id: "ord_001",
    symbol: "AAPL",
    side: "buy",
    quantity: 20,
    price: 189.44,
    status: "filled",
    createdAt: "2026-04-29T10:45:00",
  },
  {
    id: "ord_002",
    symbol: "NVDA",
    side: "buy",
    quantity: 10,
    price: 887.52,
    status: "filled",
    createdAt: "2026-04-28T14:15:00",
  },
  {
    id: "ord_003",
    symbol: "TSLA",
    side: "sell",
    quantity: 5,
    price: 232.16,
    status: "filled",
    createdAt: "2026-04-28T16:05:00",
  },
];

const DUMMY_ACCOUNT = {
  cashBalance: 47250.25,
  buyingPower: 94500.5,
};

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.quotes)) return value.quotes;
  if (Array.isArray(value?.orders)) return value.orders;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function TradePage() {
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("1");
  const [isOrdering, setIsOrdering] = useState(false);

  const { toast } = useToast();

  const { data: quotesData } = useListQuotes();
  const { data: ordersData, isLoading: loadingOrders } = useListOrders();
  const { data: accountData } = useGetMyAccount();
  const placeOrder = usePlaceOrder();

  const quotes = useMemo(() => {
    const live = toArray(quotesData);
    return live.length > 0 ? live : DUMMY_QUOTES;
  }, [quotesData]);

  const orders = useMemo(() => {
    const live = toArray(ordersData);
    return live.length > 0 ? live : DUMMY_ORDERS;
  }, [ordersData]);

  const account =
    accountData && typeof accountData === "object"
      ? {
          ...DUMMY_ACCOUNT,
          ...(accountData as any),
          ...(accountData as any)?.data,
          ...(accountData as any)?.account,
        }
      : DUMMY_ACCOUNT;

  const selectedQuote = quotes.find(
    (q: any) => String(q.symbol || "") === selectedSymbol
  );

  const filteredQuotes = useMemo(() => {
    if (!search || selectedQuote) return [];

    const term = search.toLowerCase();

    return quotes
      .filter((q: any) => {
        const symbol = String(q.symbol || "").toLowerCase();
        const name = String(q.name || "").toLowerCase();

        return symbol.includes(term) || name.includes(term);
      })
      .slice(0, 5);
  }, [quotes, search, selectedQuote]);

  const handleTrade = async () => {
    if (!selectedQuote) return;

    const qty = parseFloat(quantity);

    if (!qty || qty <= 0 || Number.isNaN(qty)) {
      toast({ title: "Invalid quantity", variant: "destructive" });
      return;
    }

    setIsOrdering(true);

    try {
      await placeOrder.mutateAsync({
        data: {
          symbol: selectedQuote.symbol,
          side,
          quantity: qty,
        },
      });

      toast({
        title: "Order Placed",
        description: `${side.toUpperCase()} ${qty} shares of ${
          selectedQuote.symbol
        }`,
        action: <CheckCircle2 className="w-4 h-4 text-success" />,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/account/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/account/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/account/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/allocation"] });

      setSelectedSymbol("");
      setQuantity("1");
      setSearch("");
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error?.message || "Could not place order.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Trade</h1>
        <p className="text-muted-foreground">
          Execute market orders instantly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Ticket</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-sm font-medium">Symbol</label>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search symbols..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value.toUpperCase());
                    setSelectedSymbol("");
                  }}
                />
              </div>

              {filteredQuotes.length > 0 ? (
                <Card className="absolute top-full left-0 right-0 mt-1 z-10 overflow-hidden shadow-lg">
                  <div className="divide-y">
                    {filteredQuotes.map((q: any) => (
                      <div
                        key={q.symbol}
                        className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          setSelectedSymbol(String(q.symbol || ""));
                          setSearch(String(q.symbol || ""));
                        }}
                      >
                        <div>
                          <div className="font-bold">{q.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {q.name}
                          </div>
                        </div>

                        <div className="font-medium">
                          {formatCurrency(safeNumber(q.price))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>

            {selectedQuote ? (
              <>
                <div className="p-4 bg-muted/30 rounded-lg border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">
                      {selectedQuote.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedQuote.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(safeNumber(selectedQuote.price))}
                    </div>
                  </div>
                </div>

                <div className="flex p-1 bg-muted rounded-md">
                  <button
                    className={`flex-1 py-2 text-sm font-bold rounded-sm transition-colors ${
                      side === "buy"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setSide("buy")}
                    type="button"
                  >
                    Buy
                  </button>

                  <button
                    className={`flex-1 py-2 text-sm font-bold rounded-sm transition-colors ${
                      side === "sell"
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setSide("sell")}
                    type="button"
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Action</label>
                    <span className="font-medium">
                      {side === "buy" ? "Buy" : "Sell"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Quantity</label>

                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="w-32 text-right"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      Order Type
                    </label>
                    <span className="font-medium">Market</span>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="font-bold">Estimated Total</span>
                    <span className="font-bold text-xl">
                      {formatCurrency(
                        safeNumber(selectedQuote.price) *
                          (parseFloat(quantity) || 0)
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-bold"
                  size="lg"
                  onClick={handleTrade}
                  disabled={isOrdering || !parseFloat(quantity)}
                  variant={side === "buy" ? "default" : "destructive"}
                >
                  {isOrdering
                    ? "Processing..."
                    : `Place ${side.toUpperCase()} Order`}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-muted/10 border-transparent md:border-border">
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-background rounded-md border">
                <span className="text-muted-foreground">Available Cash</span>
                <span className="font-bold">
                  {formatCurrency(safeNumber((account as any).cashBalance))}
                </span>
              </div>

              <div className="flex justify-between p-3 bg-background rounded-md border">
                <span className="text-muted-foreground">Buying Power</span>
                <span className="font-bold">
                  {formatCurrency(safeNumber((account as any).buyingPower))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingOrders && orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No recent orders
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any, index: number) => {
                    const sideValue = String(order.side || "buy");
                    const status = String(order.status || "filled");

                    return (
                      <TableRow
                        key={
                          order.id ||
                          `${order.symbol}-${order.createdAt}-${index}`
                        }
                      >
                        <TableCell className="text-muted-foreground">
                          {order.createdAt
                            ? formatDateTime(order.createdAt)
                            : "—"}
                        </TableCell>

                        <TableCell className="font-bold">
                          {order.symbol || "—"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              sideValue === "buy" ? "default" : "destructive"
                            }
                            className="uppercase"
                          >
                            {sideValue}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {safeNumber(order.quantity)}
                        </TableCell>

                        <TableCell className="text-right">
                          {formatCurrency(safeNumber(order.price))}
                        </TableCell>

                        <TableCell className="text-right">
                          <Badge variant="outline" className="capitalize">
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}