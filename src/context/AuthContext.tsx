import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./AuthContextValue";

type User = {
  username: string;
};

export type AuthContextType = {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string) => {
    setUser({ username });
  };

  const logout = () => {
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


