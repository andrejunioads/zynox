import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type UserProfile = {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  avatarUrl: string | null;
};

type UserContextValue = {
  user: UserProfile;
  updateUser: (profile: Partial<UserProfile>) => void;
};

const defaultProfile: UserProfile = {
  firstName: "André",
  lastName: "Silva",
  nickname: "André",
  email: "andre@zynox.digital",
  avatarUrl: null,
};

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultProfile);

  const updateUser = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  const value = useMemo(() => ({ user, updateUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
