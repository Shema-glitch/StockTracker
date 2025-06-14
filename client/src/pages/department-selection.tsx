import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { getAuthHeader } from "@/lib/auth";
import { Box, ArrowRight, Plus, Store } from "lucide-react";
import { DepartmentModal } from "@/components/modals/department-modal";

export default function DepartmentSelection() {
  const [, setLocation] = useLocation();
  const { setSelectedDepartment, user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const headers = getAuthHeader();
      const res = await fetch('/api/departments', {
        headers: headers as HeadersInit,
      });
      return res.json();
    },
  });

  const handleSelectDepartment = (departmentId: number) => {
    setSelectedDepartment(departmentId);
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Store className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Stock Management</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a stock to manage its inventory, or create a new one to get started
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Add New Department Card (Admin Only) */}
          {user?.role === 'admin' && (
            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-200 hover:border-primary/50 bg-white/50 backdrop-blur-sm"
              onClick={() => setModalOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 h-[280px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Add New Department</h3>
                <p className="text-gray-600 text-center text-sm">
                  Create a new stock to manage its inventory and stock
                </p>
              </CardContent>
            </Card>
          )}

          {/* Existing Departments */}
          {departments.map((department: any) => (
            <Card 
              key={department.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl font-semibold mb-2">{department.name}</CardTitle>
                {department.description && (
                  <CardDescription className="text-sm text-gray-600 mb-6 line-clamp-2">
                    {department.description}
                  </CardDescription>
                )}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 group-hover:scale-[1.02] transition-transform duration-300"
                  onClick={() => handleSelectDepartment(department.id)}
                >
                  Enter Department
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {departments.length === 0 && !user?.role === 'admin' && (
          <Card className="max-w-2xl mx-auto mt-8 bg-white/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Departments Available</h3>
              <p className="text-gray-600 text-center mb-6">
                There are no departments set up yet. Please contact your administrator to create one.
              </p>
            </CardContent>
          </Card>
        )}

        <DepartmentModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      </div>
    </div>
  );
}
