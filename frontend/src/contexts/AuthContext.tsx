import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, company: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("unify_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email: string, _password: string) => {
    const u = { name: "C-78 PVT LTD", email, company: "C-78 PVT LTD" };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    return true;
  };

  const signup = (name: string, email: string, _password: string, company: string) => {
    const u = { name, email, company };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("unify_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
