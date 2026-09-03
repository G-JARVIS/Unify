import {
  createContext,
  useContext,
  useState,
  useEffect,
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

  const logout = () => {
    setUser(null);
    tokenStore.clear();
    localStorage.removeItem("unify_user");
  };

  // ─── Global 401 Interceptor ───
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("Session expired or unauthorized. Logging out.");
      logout();
    };

    window.addEventListener("unify:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unify:unauthorized", handleUnauthorized);
  }, []);

  // ─── Token Hydration ───
  useEffect(() => {
    const hydrate = async () => {
      const token = tokenStore.get();
      if (!token) {
        if (user) logout(); // clear stale state
        return;
      }

      try {
        const me = await authAPI.me();
        const isAdmin = me.role === "ADMIN" || me.email === ADMIN_EMAIL;
        let displayName = isAdmin ? "Admin" : me.email.split("@")[0];
        let companyName = isAdmin ? "UNIFY Admin" : me.email.split("@")[0];

        if (!isAdmin) {
          try {
            const profile = await profilesAPI.getMSMEProfile();
            companyName = profile.company_name || companyName;
            displayName = profile.company_name || displayName;
          } catch (err) {
            // Profile may not exist yet, that's fine.
          }
        }

        const u: User = {
          name: displayName,
          email: me.email,
          company: companyName,
          isAdmin,
        };
        setUser(u);
        localStorage.setItem("unify_user", JSON.stringify(u));
      } catch (err) {
        if (err instanceof APIError && err.status === 401) {
          logout();
        }
      }
    };
    hydrate();
  }, []); // Run once on mount

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const tokenRes = await authAPI.login({ email, password });
      tokenStore.set(tokenRes.access_token);
      
      const me = await authAPI.me();
      const isAdmin = me.role === "ADMIN" || me.email === ADMIN_EMAIL;
      let displayName = isAdmin ? "Admin" : email.split("@")[0];
      let companyName = isAdmin ? "UNIFY Admin" : email.split("@")[0];

      if (!isAdmin) {
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
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    company: string,
  ): Promise<boolean> => {
    try {
      await authAPI.register({ email, password, role: "MSME" });
      const loggedIn = await login(email, password);
      if (!loggedIn) return false;

      // Auto-create MSME profile using the company name from signup
      try {
        await profilesAPI.upsertMSMEProfile({ company_name: company });
      } catch (err) {
        console.warn("Profile creation failed (non-fatal):", err);
      }
      return true;
    } catch (err) {
      console.error("Signup failed:", err);
      return false;
    }
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
