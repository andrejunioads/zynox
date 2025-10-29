import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

const STORAGE_KEY = "sidebar-collapsed";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? stored === "true" : false;
  } catch (error) {
    console.warn("Não foi possível ler o estado da sidebar do localStorage.", error);
    return false;
  }
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, collapsed.toString());
      } catch (error) {
        console.warn("Não foi possível salvar o estado da sidebar no localStorage.", error);
      }
    }
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed((prev) => !prev),
    }),
    [collapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebarState = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
};
