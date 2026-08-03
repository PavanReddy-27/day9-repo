import { createContext, useState } from "react";
import type { ReactNode } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (roleOrEmail: string, password?: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const login = (roleOrEmail: string, password?: string) => {
    // Support both demo role-based login (login("Admin"))
    // and email/password login (login(email, password)).
    if (password === undefined) {
      // treat roleOrEmail as role name for demo purposes
      if (roleOrEmail) {
        localStorage.setItem("isLoggedIn", "true");
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }

    // email/password flow
    if (roleOrEmail === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
