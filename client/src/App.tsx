import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Footer } from "@/components/ui/footer";
import Login from "@/pages/login";
import DepartmentSelection from "@/pages/department-selection";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Purchases from "@/pages/purchases";
import Sales from "@/pages/sales";
import StockMovement from "@/pages/stock-movement";
import Reports from "@/pages/reports";
import Employees from "@/pages/employees";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/department-selection" component={DepartmentSelection} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/categories" component={Categories} />
      <Route path="/purchases" component={Purchases} />
      <Route path="/sales" component={Sales} />
      <Route path="/stock-movement" component={StockMovement} />
      <Route path="/reports" component={Reports} />
      <Route path="/employees" component={Employees} />
      <Route path="/" component={() => <Dashboard />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
