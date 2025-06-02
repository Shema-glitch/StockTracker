import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuthStore } from "@/lib/auth";
import { Navigate } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const { isAuthenticated, selectedDepartmentId } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!selectedDepartmentId) {
    return <Navigate to="/department-selection" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
