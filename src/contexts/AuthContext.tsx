import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearSupabaseAuthStorage = () => {
  if (typeof window === "undefined") return;
  const clear = (storage: Storage) => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) continue;
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => storage.removeItem(key));
  };
  clear(window.localStorage);
  clear(window.sessionStorage);
};

const isTokenError = (message?: string) => {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("jwt") ||
    normalized.includes("token") ||
    normalized.includes("auth session") ||
    normalized.includes("refresh_token")
  );
};

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

    const clearInvalidSession = async () => {
      await client.auth.signOut().catch(() => undefined);
      clearSupabaseAuthStorage();
      setIsAuthenticated(false);
      setIsAdmin(false);
    };

    const syncRole = async () => {
      const { data, error } = await client.rpc("is_admin");
      if (error) {
        console.error("Failed to resolve admin role:", error);
        if (isTokenError(error.message)) {
          await clearInvalidSession();
        }
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    };

    client.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.error("Failed to load auth session:", error);
        if (isTokenError(error.message)) {
          await clearInvalidSession();
        }
      }
      const authed = !!data.session;
      setIsAuthenticated(authed);
      if (authed) {
        const { error: userError } = await client.auth.getUser();
        if (userError) {
          console.error("Failed to validate auth session:", userError);
          if (isTokenError(userError.message)) {
            await clearInvalidSession();
          } else {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
          setIsLoading(false);
          return;
        }
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
    // Always clear local auth state so UI exits admin mode immediately.
    setIsAuthenticated(false);
    setIsAdmin(false);

    if (!supabase) {
      return { success: true };
    }

    const { error } = await supabase.auth.signOut();
    // Defensive cleanup for stale tokens that may survive failed sign-out calls.
    clearSupabaseAuthStorage();
    if (error) {
      console.error("Failed to sign out:", error);
      return { success: false, message: error.message };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
