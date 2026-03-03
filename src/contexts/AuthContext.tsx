import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    const syncRole = async () => {
      const { data, error } = await client.rpc("is_admin");
      if (error) {
        console.error("Failed to resolve admin role:", error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    };

    client.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.error("Failed to load auth session:", error);
      }
      const authed = !!data.session;
      setIsAuthenticated(authed);
      if (authed) {
        await syncRole();
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (authed) {
        await syncRole();
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      return {
        success: false,
        message: "Supabase is not configured.",
      };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
