import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSidebarState } from "@/context/SidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const routeToPageMap: Record<string, string> = {
  "/": "Dashboard",
  "/comercial": "Comercial",
  "/projetos": "Projetos",
  "/clientes": "Clientes",
  "/financeiro": "Financeiro",
  "/equipe": "Equipe",
  "/api": "API",
  "/configuracoes": "Configurações"
};

const pageToRouteMap: Record<string, string> = {
  "Dashboard": "/",
  "Comercial": "/comercial",
  "Projetos": "/projetos",
  "Clientes": "/clientes",
  "Financeiro": "/financeiro",
  "Equipe": "/equipe",
  "API": "/api",
  "Configurações": "/configuracoes"
};

export const DashboardLayout = ({ children, showHeader = true }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed: sidebarCollapsed, toggle } = useSidebarState();
  const [currentPage, setCurrentPage] = useState(() => {
    return routeToPageMap[location.pathname] || "Dashboard";
  });

  // Sync currentPage with route
  useEffect(() => {
    const pageName = routeToPageMap[location.pathname] || "Dashboard";
    setCurrentPage(pageName);
  }, [location.pathname]);

  // Handle page changes from Sidebar/Header
  const handlePageChange = (page: string) => {
    const route = pageToRouteMap[page];
    if (route) {
      navigate(route);
    }
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggle}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        {showHeader && (
          <Header
            currentPage={currentPage}
          />
        )}
        <main
          key={currentPage}
          className="page-transition flex-1 p-4 lg:p-5 overflow-y-auto scrollbar-thin"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
