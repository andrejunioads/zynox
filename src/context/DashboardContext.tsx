import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface DashboardStats {
  pendingTasks: number;
  activeProjects: number;
  currentMRR: number;
  todayMeetings: number;
  overdueFollowUps: number;
}

interface DashboardContextType {
  stats: DashboardStats;
  updateStats: (newStats: Partial<DashboardStats>) => void;
  refreshStats: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Valores iniciais (serão substituídos por dados reais)
const initialStats: DashboardStats = {
  pendingTasks: 3,
  activeProjects: 12,
  currentMRR: 45700, // R$ 45.7K
  todayMeetings: 2,
  overdueFollowUps: 1,
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);

  const updateStats = (newStats: Partial<DashboardStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const refreshStats = () => {
    // TODO: Aqui você vai buscar os dados reais das suas fontes
    // Por enquanto, vamos simular uma atualização
    
    // Exemplo de como seria com dados reais:
    // const tasks = getTasks().filter(t => t.status !== 'completed').length;
    // const projects = getProjects().filter(p => p.status === 'active').length;
    // etc...
    
    console.log('📊 Atualizando estatísticas do dashboard...');
  };

  // Atualizar stats periodicamente (opcional)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
    }, 60000); // A cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider value={{ stats, updateStats, refreshStats }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};



