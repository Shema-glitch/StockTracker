import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tags } from "lucide-react";

export default function Categories() {
  return (
    <MainLayout title="Categories">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Management</h3>
            <p className="text-gray-600">Organize products into categories</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        </div>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Department Categories</CardTitle>
            <CardDescription>Categories for your current department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Create categories to organize your products better.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Category
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
