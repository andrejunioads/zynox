import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/context/NotificationContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { ClienteProvider } from "@/context/ClienteContext";
import { UserProvider } from "@/context/UserContext";
import { DataProvider } from "@/contexts/DataContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { useEffect } from "react";
import { notificationScheduler } from "@/services/notificationScheduler";
import Index from "./pages/Index";
import Comercial from "./pages/Comercial";
import Clientes from "./pages/Clientes";
import Projetos from "./pages/Projetos";
import Equipe from "./pages/Equipe";
import Automacoes from "./pages/Automacoes";
import NotFound from "./pages/NotFound";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";

const queryClient = new QueryClient();

const App = () => {
  // ✅ CORRIGIDO: Inicializar scheduler com controle explícito
  useEffect(() => {
    // Aguardar 5s para app carregar completamente
    const timer = setTimeout(() => {
      notificationScheduler.start();
      console.log('🕐 NotificationScheduler iniciado');
    }, 5000);
    
    // Cleanup ao desmontar
    return () => {
      clearTimeout(timer);
      notificationScheduler.stop();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <NotificationProvider>
            <DashboardProvider>
              <ClienteProvider>
                <DataProvider>
                  <SidebarProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/comercial" element={<Comercial />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/projetos" element={<Projetos />} />
                        <Route path="/equipe" element={<Equipe />} />
                        <Route path="/financeiro" element={<Financeiro />} />
                        <Route path="/automacoes" element={<Automacoes />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </SidebarProvider>
                </DataProvider>
              </ClienteProvider>
            </DashboardProvider>
          </NotificationProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
