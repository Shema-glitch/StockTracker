import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { getAuthHeader } from "@/lib/auth";
import { Box, ArrowRight } from "lucide-react";

export default function DepartmentSelection() {
  const [, setLocation] = useLocation();
  const { setSelectedDepartment } = useAuthStore();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const res = await fetch('/api/departments', {
        headers: getAuthHeader(),
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Box className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Department</h1>
          <p className="text-gray-600">Choose the department you want to work with</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department: any) => (
            <Card key={department.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {department.name}
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </CardTitle>
                {department.description && (
                  <CardDescription>{department.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleSelectDepartment(department.id)}
                >
                  Enter {department.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {departments.length === 0 && (
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-gray-600">No departments available. Please contact your administrator.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
