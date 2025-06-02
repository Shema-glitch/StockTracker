import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <MainLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-600">Generate reports and analyze your inventory data</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>

        {/* Reports Content */}
        <Card>
          <CardHeader>
            <CardTitle>Sales & Inventory Reports</CardTitle>
            <CardDescription>Comprehensive analytics for your department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-500 mb-4">Start adding products and recording transactions to generate reports.</p>
              <Button variant="outline">
                Set Up Your Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
