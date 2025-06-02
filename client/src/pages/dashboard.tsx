import { useAuthStore, getAuthHeader } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  BarChart3 
} from "lucide-react";

export default function Dashboard() {
  const selectedDepartmentId = 1;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedDepartmentId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?departmentId=${selectedDepartmentId}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!selectedDepartmentId,
  });

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="text-green-600 text-xs font-medium mr-1">+0%</span>
                Active products in stock
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$0</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="text-green-600 text-xs font-medium mr-1">+0%</span>
                Revenue from today's sales
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases This Week</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$0</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="text-gray-600 text-xs font-medium mr-1">+0%</span>
                Total purchase costs
              </p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="text-red-600 text-xs font-medium mr-1">Alert</span>
                Items below minimum stock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Latest sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No sales recorded yet
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>Recent inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No stock movements recorded yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}