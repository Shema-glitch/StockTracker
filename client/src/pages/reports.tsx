import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface SalesReport {
  date: string;
  total: number;
}

interface StockReport {
  product: string;
  quantity: number;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: salesData, isLoading: isSalesLoading } = useQuery<SalesReport[]>({
    queryKey: ["sales-report", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("from", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("to", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/reports/sales?${params.toString()}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sales report");
      }
      return response.json();
    },
  });

  const { data: stockData, isLoading: isStockLoading } = useQuery<StockReport[]>({
    queryKey: ["stock-report"],
    queryFn: async () => {
      const response = await fetch("/api/reports/stock", {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch stock report");
      }
      return response.json();
    },
  });

  const handleDownload = async (type: string) => {
    try {
      setDownloadLoading(type);
      setError(null);

      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("from", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("to", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/reports/${type}/download?${params.toString()}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download ${type} report`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Download failed");
    } finally {
      setDownloadLoading(null);
    }
  };

  const breadcrumbs = [
    // { label: "Dashboard", href: "/" },
    { label: "Reports" },
  ];

  return (
    <MainLayout title="Reports" breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="stock">Stock Report</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales Overview</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button 
                    onClick={() => handleDownload("sales")}
                    disabled={downloadLoading === "sales"}
                  >
                    {downloadLoading === "sales" ? (
                      "Downloading..."
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isSalesLoading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    Loading...
                  </div>
                ) : !salesData || salesData.length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    No sales data available for the selected period
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Stock Levels</CardTitle>
                <Button 
                  onClick={() => handleDownload("stock")}
                  disabled={downloadLoading === "stock"}
                >
                  {downloadLoading === "stock" ? (
                    "Downloading..."
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Excel
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {isStockLoading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    Loading...
                  </div>
                ) : !stockData || stockData.length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    No stock data available
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="product" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantity" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
