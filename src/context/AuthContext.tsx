import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type User = {
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  console.log("✅ AuthProvider Rendered");

  const [user, setUser] = useState<User | null>(null);

  const login = (username: string) => {
    console.log("Login:", username);
    setUser({ username });
  };

  const logout = () => {
    console.log("Logout");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  console.log("Context:", context);

  if (context === null) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}