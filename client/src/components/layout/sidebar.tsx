import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Package, Tags, ShoppingCart, 
  DollarSign, ArrowUpDown, BarChart3, Users, 
  Box, Settings 
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/auth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, selectedDepartmentId, setSelectedDepartment, logout } = useAuthStore();

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

  const navigationItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/products", icon: Package, label: "Products" },
    { path: "/categories", icon: Tags, label: "Categories" },
    { path: "/purchases", icon: ShoppingCart, label: "Purchases" },
    { path: "/sales", icon: DollarSign, label: "Sales" },
    { path: "/stock-movement", icon: ArrowUpDown, label: "Stock Movement" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    ...(user?.role === 'admin' ? [{ path: "/employees", icon: Users, label: "Employees" }] : []),
  ];

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Box className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Luxe System</h1>
            <p className="text-sm text-gray-500">Stock Management</p>
          </div>
        </div>
      </div>

      {/* Department Selector */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Department</label>
        <Select 
          value={selectedDepartmentId?.toString() || ""} 
          onValueChange={(value) => setSelectedDepartment(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select department..." />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept: any) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          const isStockMovement = item.path === "/stock-movement";
          
          return (
            <Link key={item.path} href={item.path}>
              <a className={`nav-item flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                isActive 
                  ? isStockMovement
                    ? "text-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-600 shadow-sm"
                    : "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:translate-x-1"
              }`}>
                <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`} />
                <span className="transition-all duration-300">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="text-gray-600 w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
