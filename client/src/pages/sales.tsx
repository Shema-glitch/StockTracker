import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";

export default function Sales() {
  return (
    <MainLayout title="Sales">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Management</h3>
            <p className="text-gray-600">Record product sales and track revenue</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </Button>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>All sales for your current department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales recorded</h3>
              <p className="text-gray-500 mb-4">Start recording sales to track your revenue and inventory movement.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Your First Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
