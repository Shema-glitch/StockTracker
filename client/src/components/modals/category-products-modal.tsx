import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, getAuthHeader } from "@/lib/auth";
import { Package, Tag } from "lucide-react";

interface CategoryProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export function CategoryProductsModal({ open, onOpenChange, category }: CategoryProductsModalProps) {
  const { selectedDepartmentId } = useAuthStore();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products', selectedDepartmentId, category?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products?departmentId=${selectedDepartmentId}&categoryId=${category?.id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedDepartmentId && !!category?.id,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <span>{category?.name} Products</span>
            <Badge variant="secondary" className="ml-2">
              {category?.code}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">
                There are no products in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product: any) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Code: {product.code}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <Badge variant="outline">
                            Stock: {product.stockQuantity}
                          </Badge>
                          <Badge variant="outline">
                            Price: ${Number(product.price).toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 