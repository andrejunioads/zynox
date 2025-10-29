import { useState, useEffect } from "react";
import { Search, UserRound, Zap, FolderKanban, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useDashboard } from "@/context/DashboardContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface HeaderProps {
  currentPage: string;
}

export const Header = ({ currentPage }: HeaderProps) => {
  const isDashboard = currentPage === "Dashboard";
  const navigate = useNavigate();
  const { user } = useUser();
  const { stats } = useDashboard();
  const displayName = user.nickname || user.firstName || "Comandante";
  
  // Data e hora em tempo real
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  useEffect(() => {
    if (!isDashboard) return;
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isDashboard]);

  const formatDateTime = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const dayName = days[currentDateTime.getDay()];
    const day = currentDateTime.getDate();
    const month = months[currentDateTime.getMonth()];
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    
    return `${dayName}, ${day} ${month} • ${hours}:${minutes}`;
  };

  const formatMRR = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 1000).replace('R$', 'R$').replace(',0', 'K');
  };

  return (
    <header className="zynox-header sticky top-0 z-40">
      <div className="header-left">
        {isDashboard ? (
          <div className="flex flex-col gap-1">
            {/* Linha 1: Nome + Data/Hora */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  {displayName}
                </h2>
                <span className="text-slate-500">•</span>
                <span className="text-sm text-slate-400">Dashboard</span>
              </div>
              <span className="text-sm text-slate-400 ml-auto">
                {formatDateTime()}
              </span>
            </div>
            
            {/* Linha 2: Métricas inline - AGORA DINÂMICAS! */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="font-medium">{stats.pendingTasks} tarefas</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-primary">
                <FolderKanban className="w-3.5 h-3.5" />
                <span className="font-medium">{stats.activeProjects} projetos</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-green-400">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-medium">{formatMRR(stats.currentMRR)} MRR</span>
              </div>
            </div>
          </div>
        ) : (
          <span key={currentPage} className="zynox-chip" aria-live="polite">
            {currentPage}
          </span>
        )}
      </div>

      <div className="header-right">
        <button className="header-icon" aria-label="Pesquisar">
          <Search className="header-icon-symbol" />
        </button>
        
        {/* Dropdown de Notificações */}
        <NotificationDropdown />
        
        <button
          className="header-icon"
          aria-label="Configurações de perfil"
          onClick={() => navigate("/configuracoes")}
        >
          <UserRound className="header-icon-symbol" />
        </button>
      </div>
    </header>
  );
};
