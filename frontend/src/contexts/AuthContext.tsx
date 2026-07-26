import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { auth as authAPI, profiles as profilesAPI, tokenStore, APIError } from "@/lib/api";

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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, company: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("unify_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // 1) Try real FastAPI backend
    let backendOk = false;
    try {
      const tokenRes = await authAPI.login({ email, password });
      tokenStore.set(tokenRes.access_token);
      backendOk = true;
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        return false;
      }
      console.warn("Backend unavailable, falling back to demo auth:", err);
      tokenStore.set("demo-session");
    }

    // 2) Try to fetch the real profile for name/company
    const isAdmin = email === ADMIN_EMAIL;
    let displayName = isAdmin ? "Admin" : email.split("@")[0];
    let companyName = isAdmin ? "UNIFY Admin" : email.split("@")[0];

    if (backendOk && !isAdmin) {
      try {
        const profile = await profilesAPI.getMSMEProfile();
        companyName = profile.company_name || companyName;
        displayName = profile.company_name || displayName;
      } catch {
        // Profile may not exist yet — that's fine
      }
    }

    const u: User = {
      name: displayName,
      email,
      company: companyName,
      isAdmin,
    };
    setUser(u);
    localStorage.setItem("unify_user", JSON.stringify(u));
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    company: string,
  ): Promise<boolean> => {
    try {
      await authAPI.register({ email, password, role: "msme" });
      return login(email, password);
    } catch {
      // Demo fallback
      tokenStore.set("demo-session");
      const u: User = { name, email, company, isAdmin: false };
      setUser(u);
      localStorage.setItem("unify_user", JSON.stringify(u));
      return true;
    }
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
