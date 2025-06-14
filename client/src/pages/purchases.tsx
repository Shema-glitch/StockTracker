import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import { useAuthStore, getAuthHeader } from "@/lib/auth";
import { PurchaseModal } from "@/components/modals/purchase-modal";
import { format } from "date-fns";

export default function Purchases() {
  const [modalOpen, setModalOpen] = useState(false);
  const { selectedDepartmentId } = useAuthStore();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['/api/purchases', selectedDepartmentId],
    queryFn: async () => {
      const response = await fetch(`/api/purchases?departmentId=${selectedDepartmentId}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedDepartmentId,
  });

  const totalCost = purchases.reduce((sum, purchase) => sum + Number(purchase.totalCost), 0);
  const totalPurchases = purchases.length;
  const breadcrumbs = [
    { label: "Purchases" }
  ];

  return (
    <MainLayout title="Purchases" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Management</h3>
            <p className="text-gray-600">Record purchases from warehouse and suppliers</p>
          </div>
          <Button 
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Purchase</span>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                  <p className="text-2xl font-bold">{totalPurchases}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchases List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>All purchases for your current department</CardDescription>
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
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases recorded</h3>
                <p className="text-gray-500 mb-4">Start tracking your inventory by recording purchases from suppliers.</p>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Your First Purchase
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase: any) => (
                  <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{purchase.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(purchase.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(purchase.totalCost).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {purchase.quantity} units @ ${Number(purchase.unitCost).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Supplier: {purchase.supplierName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <PurchaseModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      </div>
    </MainLayout>
  );
}
