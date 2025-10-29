import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { automationEngine } from "@/services/automationEngine";

export type NotificationType = 'task' | 'meeting' | 'lead' | 'project' | 'financial' | 'team';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadNotifications: () => Notification[];
  filterByType: (type: NotificationType) => Notification[];
  isNotificationEnabled: boolean;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock inicial de notificações
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'meeting',
    title: 'Reunião em 15 minutos',
    message: 'Cliente X - Comercial',
    priority: 'urgent',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
    actionUrl: '/',
  },
  {
    id: '2',
    type: 'lead',
    title: 'Novo lead: João Silva',
    message: 'Instagram → Qualificação',
    priority: 'high',
    read: false,
    timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 min atrás
    actionUrl: '/comercial',
  },
  {
    id: '3',
    type: 'task',
    title: 'Tarefa concluída',
    message: '"Design Landing Page" - Bianca',
    priority: 'low',
    read: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    actionUrl: '/',
  },
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const { user } = useUser();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Função addNotification (precisa estar antes do useEffect que a registra)
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Toast notification
    const priorityColors = {
      urgent: '🔴',
      high: '🟡',
      medium: '🔵',
      low: '⚪',
    };

    toast(`${priorityColors[notification.priority]} ${notification.title}`, {
      description: notification.message,
      duration: 4000,
    });
  };

  // Registrar handler de notificações no automationEngine
  useEffect(() => {
    automationEngine.setNotificationHandler(addNotification);
    console.log('🔗 AutomationEngine conectado ao painel de notificações');
  }, []);

  // Verificar se o navegador suporta notificações
  const isNotificationSupported = () => {
    return 'Notification' in window;
  };

  // Verificar status da permissão
  const getNotificationPermissionStatus = () => {
    return Notification.permission;
  };

  // Solicitar permissão de notificação
  const requestNotificationPermission = async (): Promise<string | null> => {
    if (!isNotificationSupported()) {
      return null;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted' ? 'mock-token' : null;
  };

  // Inicializar notificações
  useEffect(() => {
    const initializeNotifications = async () => {
      // Verificar se o navegador suporta notificações
      if (!isNotificationSupported()) {
        console.warn('Notificações não suportadas neste navegador');
        return;
      }

      // Verificar status da permissão
      const permission = getNotificationPermissionStatus();
      setIsNotificationEnabled(permission === 'granted');

      console.log('📬 Handler de notificações registrado');
    };

    initializeNotifications();
  }, [user]);

  // Solicitar permissão de push
  const requestPushPermission = async (): Promise<boolean> => {
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setIsNotificationEnabled(true);

        toast.success('Notificações ativadas!', {
          description: 'Você receberá alertas importantes do sistema.',
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao ativar notificações', {
        description: 'Verifique as configurações do navegador.',
      });
      return false;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  const filterByType = (type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  };

  // Simular notificações automáticas (exemplo)
  useEffect(() => {
    // Exemplo: notificação de follow-up a cada 30 segundos (apenas para demonstração)
    const interval = setInterval(() => {
      // Descomentar para testar
      // addNotification({
      //   type: 'lead',
      //   title: 'Follow-up atrasado',
      //   message: 'Lead "Maria Santos" sem interação há 3 dias',
      //   priority: 'medium',
      //   actionUrl: '/comercial',
      // });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        getUnreadNotifications,
        filterByType,
        isNotificationEnabled,
        requestPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};