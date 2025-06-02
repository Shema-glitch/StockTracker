import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/auth";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { selectedDepartmentId } = useAuthStore();

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const res = await fetch('/api/departments', {
        headers: getAuthHeader(),
      });
      return res.json();
    },
  });

  const selectedDepartment = departments.find((d: any) => d.id === selectedDepartmentId);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {selectedDepartment && (
            <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800">
              {selectedDepartment.name} Department
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search products..." 
              className="w-80 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
