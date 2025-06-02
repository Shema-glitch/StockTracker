import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useAuthStore } from "@/lib/auth";

export default function Employees() {
  const { user } = useAuthStore();

  if (user?.role !== 'admin') {
    return (
      <MainLayout title="Employees">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600">Access denied. Admin privileges required.</p>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Employees">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Management</h3>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </Button>
        </div>

        {/* Employees List */}
        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>System users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">Add employee accounts to manage access and track user actions.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Employee
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
