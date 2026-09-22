import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, setToken, clearToken } from "../api/client.js";
import { login as loginRequest, signup as signupRequest, getMe } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const { user } = await getMe();
        setUser(user);
      } catch {
        clearToken();
      } finally {
        setIsLoading(false);
      }
    }
    loadCurrentUser();
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user } = await loginRequest(credentials);
    setToken(token);
    setUser(user);
  }, []);

  const signup = useCallback(async (details) => {
    const { token, user } = await signupRequest(details);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = { user, isLoading, isAuthenticated: user !== null, login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
