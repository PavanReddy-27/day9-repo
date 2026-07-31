import { useContext } from "react";

import { AuthContext } from "./AuthContextValue";
import type { AuthContextType } from "./AuthContext";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}
