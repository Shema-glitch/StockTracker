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
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ChartMetric = 'sales' | 'purchases' | 'both';
type TimeRange = '7d' | '30d' | '90d' | 'custom';

export default function Dashboard() {
  const { selectedDepartmentId } = useAuthStore();
  const [selectedMetrics, setSelectedMetrics] = useState<ChartMetric>('both');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

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

  const { data: recentSales = [] } = useQuery({
    queryKey: ['/api/sales', selectedDepartmentId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?departmentId=${selectedDepartmentId}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch sales");
      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, 5) : [];
    },
    enabled: !!selectedDepartmentId,
  });

  const { data: recentPurchases = [] } = useQuery({
    queryKey: ['/api/purchases', selectedDepartmentId],
    queryFn: async () => {
      const response = await fetch(`/api/purchases?departmentId=${selectedDepartmentId}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch purchases");
      const data = await response.json();
      return Array.isArray(data) ? data.slice(0, 5) : [];
    },
    enabled: !!selectedDepartmentId,
  });

  const { data: chartData } = useQuery({
    queryKey: ['/api/dashboard/chart', selectedDepartmentId, timeRange, dateRange],
    queryFn: async () => {
      let startDate = new Date();
      let endDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate = subDays(endDate, 7);
          break;
        case '30d':
          startDate = subDays(endDate, 30);
          break;
        case '90d':
          startDate = subDays(endDate, 90);
          break;
        case 'custom':
          if (dateRange?.from && dateRange?.to) {
            startDate = startOfDay(dateRange.from);
            endDate = endOfDay(dateRange.to);
          }
          break;
      }

      const response = await fetch(
        `/api/dashboard/chart?departmentId=${selectedDepartmentId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            ...getAuthHeader(),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch chart data");
      return response.json();
    },
    enabled: !!selectedDepartmentId,
  });

  // Prepare chart data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Department Performance Overview',
        padding: {
          top: 10,
          bottom: 20
        },
        font: {
          size: 16,
          weight: '500'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(0);
          },
          padding: 10
        },
        title: {
          display: true,
          text: 'Amount ($)',
          padding: { top: 10, bottom: 10 },
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          padding: 10,
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Date',
          padding: { top: 10, bottom: 10 },
          font: {
            size: 12,
            weight: '500'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const chartDataConfig = {
    labels: chartData?.labels || [],
    datasets: [
      ...(selectedMetrics === 'sales' || selectedMetrics === 'both' ? [{
        label: 'Sales',
        data: chartData?.sales || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }] : []),
      ...(selectedMetrics === 'purchases' || selectedMetrics === 'both' ? [{
        label: 'Purchases',
        data: chartData?.purchases || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }] : [])
    ],
  };

  const breadcrumbs = [
    { label: "Dashboard" }
  ];

  return (
    <MainLayout title="Dashboard" breadcrumbs={breadcrumbs}>
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
              <div className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</div>
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
              <div className="text-2xl font-bold text-gray-900">${stats?.todaySales || 0}</div>
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
              <div className="text-2xl font-bold text-gray-900">${stats?.weekPurchases || 0}</div>
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
              <div className="text-2xl font-bold text-gray-900">{stats?.lowStockItems || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span className="text-red-600 text-xs font-medium mr-1">Alert</span>
                Items below minimum stock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Analyze sales and purchases trends</CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <Select
                    value={selectedMetrics}
                    onValueChange={(value: ChartMetric) => setSelectedMetrics(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select metrics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Sales & Purchases</SelectItem>
                      <SelectItem value="sales">Sales Only</SelectItem>
                      <SelectItem value="purchases">Purchases Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={timeRange}
                    onValueChange={(value: TimeRange) => {
                      setTimeRange(value);
                      if (value !== 'custom') {
                        setDateRange({
                          from: subDays(new Date(), value === '7d' ? 7 : value === '30d' ? 30 : 90),
                          to: new Date(),
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {timeRange === 'custom' && (
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <Line options={chartOptions} data={chartDataConfig} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Latest sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No sales recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sale.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(sale.totalPrice).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {sale.quantity} units @ ${Number(sale.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Latest purchase transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPurchases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No purchases recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPurchases.map((purchase: any) => (
                    <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{purchase.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${Number(purchase.totalCost).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {purchase.quantity} units @ ${Number(purchase.unitCost).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}