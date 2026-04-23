import { createContext, useContext, useState, ReactNode } from "react";

const ADMIN_EMAIL = "admin@unify.com";

interface User {
  name: string;
  email: string;
  company: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
    const isAdmin = email === ADMIN_EMAIL;
    const u = {
      name: isAdmin ? "Admin" : "C-78 PVT LTD",
      email,
      company: isAdmin ? "UNIFY Admin" : "C-78 PVT LTD",
      isAdmin,
    };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    return true;
  };

  const signup = (name: string, email: string, _password: string, company: string) => {
    const u = { name, email, company, isAdmin: false };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("unify_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.isAdmin ?? false, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
