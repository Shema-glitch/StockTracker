import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Redirect } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function MainLayout({ children, title, breadcrumbs = [] }: MainLayoutProps) {
  const { isAuthenticated, selectedDepartmentId } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (!selectedDepartmentId) {
      setLocation("/department-selection");
      return;
    }
  }, [isAuthenticated, selectedDepartmentId, setLocation]);

  if (!isAuthenticated || !selectedDepartmentId) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 fade-in">
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
          <div className="slide-in-right">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}