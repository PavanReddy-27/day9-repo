import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
  } from "react";
  
  type Theme = "light" | "dark";
  
  interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
  }
  
  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
  
  interface ThemeProviderProps {
    children: ReactNode;
  }
  
  export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
      return (localStorage.getItem("theme") as Theme) || "light";
    });
  
    useEffect(() => {
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }, [theme]);
  
    const value = useMemo(
      () => ({
        theme,
        toggleTheme: () =>
          setTheme((prev) => (prev === "light" ? "dark" : "light")),
      }),
      [theme]
    );
  
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  };
  
  export const useTheme = () => {
    const context = useContext(ThemeContext);
  
    if (!context) {
      throw new Error("useTheme must be used inside ThemeProvider");
    }
  
    return context;
  };