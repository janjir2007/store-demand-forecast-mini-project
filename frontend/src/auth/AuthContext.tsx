import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, tokenStore, UNAUTHORIZED_EVENT } from "../lib/api";

interface AuthValue {
  username: string | null;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const USER_KEY = "sdf.username";
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    tokenStore.get() ? localStorage.getItem(USER_KEY) : null,
  );

  const signOut = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUsername(null);
  }, []);

  // Any 401 from the API drops the session rather than leaving a dead token in place.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut);
  }, [signOut]);

  const signIn = useCallback(async (name: string, password: string) => {
    const token = await api.login(name, password);
    tokenStore.set(token.access_token);
    localStorage.setItem(USER_KEY, name);
    setUsername(name);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ username, isAuthenticated: username !== null, signIn, signOut }),
    [username, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
