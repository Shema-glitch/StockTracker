import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";

export default function Purchases() {
  return (
    <MainLayout title="Purchases">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Management</h3>
            <p className="text-gray-600">Record purchases from warehouse and suppliers</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Record Purchase</span>
          </Button>
        </div>

        {/* Purchases List */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>All purchases for your current department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases recorded</h3>
              <p className="text-gray-500 mb-4">Start tracking your inventory by recording purchases from suppliers.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Your First Purchase
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
