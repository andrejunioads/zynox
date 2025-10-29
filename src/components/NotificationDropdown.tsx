import { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Calendar,
  Users,
  FolderKanban,
  DollarSign,
  ClipboardCheck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [open, setOpen] = useState(false);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'lead': return <Users className="w-4 h-4" />;
      case 'project': return <FolderKanban className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'task': return <ClipboardCheck className="w-4 h-4" />;
      case 'team': return <UserPlus className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'text-slate-400 bg-slate-500/10';
    
    switch (type) {
      case 'meeting': return 'text-blue-400 bg-blue-500/20';
      case 'lead': return 'text-green-400 bg-green-500/20';
      case 'project': return 'text-purple-400 bg-purple-500/20';
      case 'financial': return 'text-emerald-400 bg-emerald-500/20';
      case 'task': return 'text-yellow-400 bg-yellow-500/20';
      case 'team': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="header-icon relative group" aria-label="Notificações">
          <Bell className={cn(
            "header-icon-symbol transition-all duration-300",
            unreadCount > 0 && "animate-pulse"
          )} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-primary text-white text-[10px] font-bold items-center justify-center border-2 border-[#0D1018]">
                {unreadCount}
              </span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[360px] p-0 glass-card border-white/10" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-4 h-4 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-white">Notificações</h3>
              {unreadCount > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] text-slate-400 hover:text-white px-2"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Marcar
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={() => setFilter('unread')}
            >
              Não lidas ({unreadCount})
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Não lidas */}
              {filter === 'all' && unreadNotifications.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    🔵 Novas ({unreadNotifications.length})
                  </div>
                  {unreadNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        "group relative p-2.5 mb-1.5 mx-2 rounded-lg border transition-all cursor-pointer",
                        "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-2.5">
                        <div className={cn(
                          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                          getNotificationColor(notification.type, notification.read)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-white text-xs leading-tight">
                              {notification.title}
                            </p>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1.5">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Lidas */}
              {filter === 'all' && readNotifications.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-3">
                    ⚪ Lidas ({readNotifications.length})
                  </div>
                  {readNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        "group relative p-2.5 mb-1.5 mx-2 rounded-lg border transition-all cursor-pointer",
                        "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-2.5">
                        <div className={cn(
                          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                          getNotificationColor(notification.type, notification.read)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-slate-400 text-xs leading-tight">
                              {notification.title}
                            </p>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-slate-500 hover:text-red-400" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1.5">
                            {formatDistanceToNow(notification.timestamp, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Apenas não lidas quando filtro = unread */}
              {filter === 'unread' && filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative p-2.5 mb-1.5 mx-2 rounded-lg border transition-all cursor-pointer",
                    "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-2.5">
                    <div className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                      getNotificationColor(notification.type, notification.read)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-white text-xs leading-tight">
                          {notification.title}
                        </p>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

