import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryModal } from "@/components/modals/category-modal";
import { useAuthStore } from "@/lib/auth";
import { Plus, Tag } from "lucide-react";

export default function Categories() {
  const [modalOpen, setModalOpen] = useState(false);
  const { selectedDepartmentId } = useAuthStore();

  const breadcrumbs = [
    { label: "Categories" }
  ];

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/categories', selectedDepartmentId],
    queryFn: async () => {
      const response = await fetch(`/api/categories?departmentId=${selectedDepartmentId}`);
      return response.json();
    },
    enabled: !!selectedDepartmentId,
  });

  return (
    <MainLayout title="Categories" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Manage sub-categories for your department
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Card key={category.id} className="metric-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {category.productCount || 0} products
                    </p>
                    <Badge variant="secondary">
                      {category.code || 'CODE'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {categories.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Tag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create your first category to start organizing products
                  </p>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <CategoryModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      </div>
    </MainLayout>
  );
}
