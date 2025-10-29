import { 
  LayoutDashboard, 
  Handshake, 
  FolderKanban, 
  Users, 
  Wallet, 
  UserCog, 
  Zap,
  Code2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Handshake, label: "Comercial", path: "/comercial" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: FolderKanban, label: "Projetos", path: "/projetos" },
  { icon: Wallet, label: "Financeiro", path: "/financeiro" },
  { icon: UserCog, label: "Equipe", path: "/equipe" },
  { icon: Zap, label: "Automações", path: "/automacoes" },
];

const bottomItems = [
  { icon: Code2, label: "API", path: "/" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export const Sidebar = ({ collapsed, onToggle, currentPage, onPageChange }: SidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen flex-shrink-0 bg-sidebar border-r border-sidebar-border/20 transition-all duration-300 flex flex-col overflow-hidden",
        collapsed ? "w-20" : "w-[260px]"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center w-12 h-12" : ""
          )}
        >
          <img
            src="/src/assets/logotipo.svg"
            alt="Logo"
            className={cn(
              "object-contain transition-all duration-300",
              collapsed ? "w-6 h-6" : "w-full h-8"
            )}
          />
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      <div className="flex flex-1 min-h-0 flex-col">
        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 px-3 space-y-1 pb-4 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  onPageChange(item.label);
                  if (item.path) navigate(item.path);
                }}
                className={cn(
                  "group flex items-center rounded-2xl border border-transparent transition-all duration-300",
                  collapsed
                    ? "mx-auto h-12 w-12 justify-center"
                    : "w-full gap-3 px-3 py-3",
                  isActive
                    ? "border-primary/40 bg-[#0F1926]/85 text-white shadow-[0_16px_36px_rgba(59,130,246,0.28)]"
                    : "text-sidebar-foreground hover:border-primary/25 hover:bg-[#111522]/80 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "relative flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300",
                    collapsed ? "h-9 w-9" : "h-8 w-8",
                    isActive
                      ? "border border-primary/45 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent shadow-[0_12px_28px_rgba(59,130,246,0.35)]"
                      : "border border-white/10 bg-[#101218]/80 group-hover:border-primary/35 group-hover:bg-primary/10"
                  )}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl bg-primary/20 opacity-0 blur-lg transition group-hover:opacity-70" />
                  <Icon
                    className={cn(
                      "relative z-10 h-5 w-5",
                      isActive ? "text-white" : "text-slate-300 group-hover:text-primary-light"
                    )}
                  />
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="py-4">
            <div 
              className="h-px w-full" 
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
              }}
            />
          </div>

          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  onPageChange(item.label);
                  if (item.path) navigate(item.path);
                }}
                className={cn(
                  "group flex items-center rounded-2xl border border-transparent transition-all duration-300",
                  collapsed
                    ? "mx-auto h-12 w-12 justify-center"
                    : "w-full gap-3 px-3 py-3",
                  isActive
                    ? "border-primary/40 bg-[#0F1926]/85 text-white shadow-[0_16px_36px_rgba(59,130,246,0.28)]"
                    : "text-sidebar-foreground hover:border-primary/25 hover:bg-[#111522]/80 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "relative flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300",
                    collapsed ? "h-9 w-9" : "h-8 w-8",
                    isActive
                      ? "border border-primary/45 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent shadow-[0_12px_28px_rgba(59,130,246,0.35)]"
                      : "border border-white/10 bg-[#101218]/80 group-hover:border-primary/35 group-hover:bg-primary/10"
                  )}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl bg-primary/20 opacity-0 blur-lg transition group-hover:opacity-70" />
                  <Icon
                    className={cn(
                      "relative z-10 h-5 w-5",
                      isActive ? "text-white" : "text-slate-300 group-hover:text-primary-light"
                    )}
                  />
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-3">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all duration-300">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">Sair</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
