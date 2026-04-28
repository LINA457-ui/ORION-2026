import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";

import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/Shell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

import Marketing from "@/pages/marketing";
import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import Markets from "@/pages/markets";
import SymbolDetail from "@/pages/markets/symbol";
import Trade from "@/pages/trade";
import Watchlist from "@/pages/watchlist";
import Transactions from "@/pages/transactions";
import Advisor from "@/pages/advisor";
import Funding from "@/pages/funding";
import FundingSuccess from "@/pages/funding/success";
import Profile from "@/pages/profile";

function ProtectedShellPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Marketing} />

      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-in/*" component={SignIn} />

      <Route path="/sign-up" component={SignUp} />
      <Route path="/sign-up/*" component={SignUp} />

      <Route path="/dashboard">
        <ProtectedShellPage>
          <Dashboard />
        </ProtectedShellPage>
      </Route>

      <Route path="/portfolio">
        <ProtectedShellPage>
          <Portfolio />
        </ProtectedShellPage>
      </Route>

      <Route path="/markets">
        <ProtectedShellPage>
          <Markets />
        </ProtectedShellPage>
      </Route>

      <Route path="/markets/:symbol">
        <ProtectedShellPage>
          <SymbolDetail />
        </ProtectedShellPage>
      </Route>

      <Route path="/trade">
        <ProtectedShellPage>
          <Trade />
        </ProtectedShellPage>
      </Route>

      <Route path="/watchlist">
        <ProtectedShellPage>
          <Watchlist />
        </ProtectedShellPage>
      </Route>

      <Route path="/transactions">
        <ProtectedShellPage>
          <Transactions />
        </ProtectedShellPage>
      </Route>

      <Route path="/advisor">
        <ProtectedShellPage>
          <Advisor />
        </ProtectedShellPage>
      </Route>

      <Route path="/funding">
        <ProtectedShellPage>
          <Funding />
        </ProtectedShellPage>
      </Route>

      <Route path="/funding/success">
        <ProtectedShellPage>
          <FundingSuccess />
        </ProtectedShellPage>
      </Route>

      <Route path="/profile">
        <ProtectedShellPage>
          <Profile />
        </ProtectedShellPage>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}