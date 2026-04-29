import { useState } from "react";
import { useListTransactions } from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DUMMY_TRANSACTIONS = [
  {
    id: "txn_001",
    type: "deposit",
    description: "Bank transfer deposit from GTBank",
    amount: 25000,
    createdAt: "2026-04-29T09:20:00",
  },
  {
    id: "txn_002",
    type: "buy",
    description: "Bought 20 shares of Apple Inc. (AAPL)",
    amount: -3788.8,
    createdAt: "2026-04-29T10:45:00",
  },
  {
    id: "txn_003",
    type: "buy",
    description: "Bought 10 shares of NVIDIA Corporation (NVDA)",
    amount: -8875.2,
    createdAt: "2026-04-28T14:15:00",
  },
  {
    id: "txn_004",
    type: "sell",
    description: "Sold 5 shares of Tesla Inc. (TSLA)",
    amount: 1160.8,
    createdAt: "2026-04-28T16:05:00",
  },
  {
    id: "txn_005",
    type: "dividend",
    description: "Dividend received from Microsoft Corporation",
    amount: 320.5,
    createdAt: "2026-04-27T11:30:00",
  },
  {
    id: "txn_006",
    type: "fee",
    description: "Trading commission fee",
    amount: -15,
    createdAt: "2026-04-27T11:32:00",
  },
  {
    id: "txn_007",
    type: "deposit",
    description: "Card funding deposit",
    amount: 10000,
    createdAt: "2026-04-26T08:10:00",
  },
  {
    id: "txn_008",
    type: "buy",
    description: "Bought 15 shares of Amazon.com Inc. (AMZN)",
    amount: -2773.65,
    createdAt: "2026-04-25T13:50:00",
  },
  {
    id: "txn_009",
    type: "sell",
    description: "Sold 8 shares of Meta Platforms Inc. (META)",
    amount: 4101.44,
    createdAt: "2026-04-24T15:20:00",
  },
  {
    id: "txn_010",
    type: "withdrawal",
    description: "Withdrawal to saved bank account",
    amount: -5000,
    createdAt: "2026-04-23T12:00:00",
  },
];

function safeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { data, isLoading } = useListTransactions();

  const transactions = safeArray(data, DUMMY_TRANSACTIONS);

  const filtered = transactions.filter((t: any) => {
    return typeFilter === "all" || t.type === typeFilter;
  });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-success/20 text-success border-success/30";
      case "buy":
        return "bg-primary/20 text-primary border-primary/30";
      case "sell":
        return "bg-muted text-foreground border-border";
      case "dividend":
        return "bg-success/20 text-success border-success/30";
      case "fee":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "withdrawal":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {isLoading ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700">
          Loading live transactions. Showing protected demo transactions.
        </div>
      ) : null}

      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">
          Transactions
        </h1>
        <p className="text-muted-foreground">Account history and activity</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-lg">History</CardTitle>

          <div className="w-40">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="buy">Buys</SelectItem>
                <SelectItem value="sell">Sells</SelectItem>
                <SelectItem value="dividend">Dividends</SelectItem>
                <SelectItem value="fee">Fees</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && transactions.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !filtered.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No transactions found for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t: any) => {
                    const amount = safeNumber(t.amount);
                    const isPositive = amount > 0;

                    return (
                      <TableRow key={t.id}>
                        <TableCell className="pl-6 text-muted-foreground whitespace-nowrap">
                          {formatDateTime(t.createdAt)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize ${getBadgeColor(t.type)}`}
                          >
                            {t.type}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-medium text-foreground/80">
                          {t.description || "Account transaction"}
                        </TableCell>

                        <TableCell
                          className={`text-right pr-6 font-bold ${
                            isPositive ? "text-success" : "text-foreground"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {formatCurrency(amount)}
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