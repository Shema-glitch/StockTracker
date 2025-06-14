import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import { useAuthStore, getAuthHeader } from "@/lib/auth";
import { SaleModal } from "@/components/modals/sale-modal";
import { format } from "date-fns";

export default function Sales() {
  const [modalOpen, setModalOpen] = useState(false);
  const { selectedDepartmentId } = useAuthStore();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['/api/sales', selectedDepartmentId],
    queryFn: async () => {
      const response = await fetch(`/api/sales?departmentId=${selectedDepartmentId}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedDepartmentId,
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0);
  const totalSales = sales.length;
  const breadcrumbs = [
    { label: "Sales" }
  ];

  return (
    <MainLayout title="Sales" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Management</h3>
            <p className="text-gray-600">Record product sales and track revenue</p>
          </div>
          <Button 
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{totalSales}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>All sales for your current department</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales recorded</h3>
                <p className="text-gray-500 mb-4">Start recording sales to track your revenue and inventory movement.</p>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Your First Sale
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{sale.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(sale.createdAt), 'MMM d, yyyy h:mm a')}
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

        <SaleModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      </div>
    </MainLayout>
  );
}
