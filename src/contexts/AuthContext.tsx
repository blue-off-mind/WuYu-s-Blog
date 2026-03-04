import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const isAuthenticatedRef = useRef(isAuthenticated);
  const isAdminRef = useRef(isAdmin);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;
    let active = true;
    const TIMEOUT_MS = 5000;

    const withTimeout = async <T,>(promise: PromiseLike<T>, fallbackValue: T, label: string): Promise<T> => {
      let timeoutId: number | undefined;
      const timeoutPromise = new Promise<T>((resolve) => {
        timeoutId = window.setTimeout(() => {
          console.warn(`${label} timed out after ${TIMEOUT_MS}ms`);
          resolve(fallbackValue);
        }, TIMEOUT_MS);
      });
      const result = await Promise.race([Promise.resolve(promise), timeoutPromise]);
      if (timeoutId) window.clearTimeout(timeoutId);
      return result;
    };

    const clearInvalidSession = async () => {
      await client.auth.signOut().catch(() => undefined);
      clearSupabaseAuthStorage();
      if (!active) return;
      setIsAuthenticated(false);
      setIsAdmin(false);
    };

    const syncRole = async (preserveOnTransientFailure = true) => {
      const roleResult = await Promise.race([
        Promise.resolve(client.rpc("is_admin")),
        new Promise<null>((resolve) => {
          window.setTimeout(() => {
            console.warn(`is_admin() timed out after ${TIMEOUT_MS}ms`);
            resolve(null);
          }, TIMEOUT_MS);
        }),
      ]);
      if (roleResult === null) {
        if (active && !preserveOnTransientFailure) setIsAdmin(false);
        return;
      }
      const { data, error } = roleResult;
      if (!active) return;
      if (error) {
        console.error("Failed to resolve admin role:", error);
        if (isTokenError(error.message)) {
          await clearInvalidSession();
          return;
        }
        if (!preserveOnTransientFailure) {
          setIsAdmin(false);
        }
        return;
      }
      setIsAdmin(!!data);
    };

    withTimeout(
      client.auth.getSession(),
      { data: { session: null }, error: null },
      "auth.getSession()",
    )
      .then(async ({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Failed to load auth session:", error);
          if (isTokenError(error.message)) {
            await clearInvalidSession();
            return;
          }
          // Keep prior auth/admin state on transient failures (e.g. tab freeze wake-up).
          if (isAuthenticatedRef.current) {
            setIsAuthenticated(true);
            setIsAdmin(isAdminRef.current);
            return;
          }
        }
        const authed = !!data.session;
        if (!active) return;
        setIsAuthenticated(authed);
        if (authed) {
          const { error: userError } = await client.auth.getUser();
          if (userError) {
            console.error("Failed to validate auth session:", userError);
            if (isTokenError(userError.message)) {
              await clearInvalidSession();
            } else {
              // Network hiccups should not immediately kick admins out of active sessions.
              setIsAuthenticated(isAuthenticatedRef.current);
              setIsAdmin(isAdminRef.current);
            }
            return;
          }
          await syncRole();
        } else {
          setIsAdmin(false);
        }
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setIsLoading(true);
      }
      try {
        if (!session && (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") && isAuthenticatedRef.current) {
          setIsAuthenticated(true);
          setIsAdmin(isAdminRef.current);
          return;
        }
        const authed = !!session;
        setIsAuthenticated(authed);
        if (authed) {
          await syncRole();
        } else {
          setIsAdmin(false);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    });

    return () => {
      active = false;
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

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoading(false);
      return { success: false, message: error.message };
    }

    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<{ data: boolean; error: { message: string } | null }>((resolve) => {
      timeoutId = window.setTimeout(() => resolve({ data: false, error: null }), 5000);
    });
    const { data: adminData, error: adminError } = await Promise.race([
      Promise.resolve(supabase.rpc("is_admin")),
      timeoutPromise,
    ]);
    if (timeoutId) window.clearTimeout(timeoutId);
    if (adminError) {
      console.error("Failed to resolve admin role after login:", adminError);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsLoading(false);
      return { success: false, message: adminError?.message || "Failed to resolve admin role." };
    }

    if (!adminData) {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsLoading(false);
      return { success: false, message: "This account is not an admin user." };
    }

    setIsAuthenticated(true);
    setIsAdmin(true);
    setIsLoading(false);
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
