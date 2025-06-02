import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockMovementModal } from "@/components/modals/stock-movement-modal";
import { useAuthStore } from "@/lib/auth";
import { getAuthHeader } from "@/lib/auth";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

export default function StockMovement() {
  const [modalOpen, setModalOpen] = useState(false);
  const { selectedDepartmentId } = useAuthStore();

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['/api/stock-movements', selectedDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/stock-movements?departmentId=${selectedDepartmentId}`, {
        headers: getAuthHeader(),
      });
      return res.json();
    },
    enabled: !!selectedDepartmentId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products', selectedDepartmentId],
    queryFn: async () => {
      const res = await fetch(`/api/products?departmentId=${selectedDepartmentId}`, {
        headers: getAuthHeader(),
      });
      return res.json();
    },
    enabled: !!selectedDepartmentId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users', {
        headers: getAuthHeader(),
      });
      return res.json();
    },
  });

  // Calculate summary stats
  const todayMovements = movements.filter((m: any) => {
    const today = new Date();
    const movementDate = new Date(m.createdAt);
    return movementDate.toDateString() === today.toDateString();
  });

  const thisWeekMovements = movements.filter((m: any) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const movementDate = new Date(m.createdAt);
    return movementDate >= weekAgo;
  });

  const stockInToday = todayMovements
    .filter((m: any) => m.type === 'in')
    .reduce((sum: number, m: any) => sum + m.quantity, 0);

  const stockOutToday = todayMovements
    .filter((m: any) => m.type === 'out')
    .reduce((sum: number, m: any) => sum + m.quantity, 0);

  const stockInWeek = thisWeekMovements
    .filter((m: any) => m.type === 'in')
    .reduce((sum: number, m: any) => sum + m.quantity, 0);

  const stockOutWeek = thisWeekMovements
    .filter((m: any) => m.type === 'out')
    .reduce((sum: number, m: any) => sum + m.quantity, 0);

  return (
    <MainLayout title="Stock Movement">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Movement Tracking</h3>
            <p className="text-gray-600">Track physical inventory changes not tied to purchases or sales</p>
          </div>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Record Movement</span>
          </Button>
        </div>

        {/* Movement Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowUp className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Stock In</h4>
                  <p className="text-sm text-gray-600">Returns, manual additions, promotional stock</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Today</span>
                  <span className="font-medium">+{stockInToday} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-medium">+{stockInWeek} items</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDown className="text-red-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Stock Out</h4>
                  <p className="text-sm text-gray-600">Damaged, expired, lost items, donations</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Today</span>
                  <span className="font-medium">-{stockOutToday} items</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-medium">-{stockOutWeek} items</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Stock Movements Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Movements</CardTitle>
                <CardDescription>Latest stock movement transactions</CardDescription>
              </div>
              <div className="flex items-center space-x-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="7days">
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading movements...</p>
              </div>
            ) : movements.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Movement</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement: any) => {
                      const product = products.find((p: any) => p.id === movement.productId);
                      const user = users.find((u: any) => u.id === movement.userId);
                      
                      return (
                        <TableRow key={movement.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {product?.imageUrl && (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {product?.name || 'Unknown Product'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product?.code || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={movement.type === 'in' ? 'default' : 'destructive'}
                              className={movement.type === 'in' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                              }
                            >
                              {movement.type === 'in' ? (
                                <ArrowUp className="w-3 h-3 mr-1" />
                              ) : (
                                <ArrowDown className="w-3 h-3 mr-1" />
                              )}
                              Stock {movement.type === 'in' ? 'In' : 'Out'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {movement.reason.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {user?.name || 'Unknown User'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {format(new Date(movement.createdAt), 'MMM d, h:mm a')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ArrowUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stock movements</h3>
                <p className="text-gray-500 mb-4">Record your first stock movement to track inventory changes.</p>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Movement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <StockMovementModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      </div>
    </MainLayout>
  );
}
