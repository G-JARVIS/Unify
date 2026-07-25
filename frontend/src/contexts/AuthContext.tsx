import { createContext, useContext, useState, ReactNode } from "react";
import { tokenStore } from "@/lib/api";

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
    const u: User = {
      name: isAdmin ? "Admin" : "C-78 PVT LTD",
      email,
      company: isAdmin ? "UNIFY Admin" : "C-78 PVT LTD",
      isAdmin,
    };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    // Store a demo token so the COMS dashboard can detect a logged-in session.
    // Real backend login (with JWT) is handled separately in the COMS dashboard.
    if (!tokenStore.get()) {
      tokenStore.set("demo-session");
    }
    return true;
  };

  const signup = (name: string, email: string, _password: string, company: string) => {
    const u: User = { name, email, company, isAdmin: false };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    if (!tokenStore.get()) {
      tokenStore.set("demo-session");
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    tokenStore.clear();
    localStorage.removeItem("unify_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
