import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, type ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { me } from "../../api/auth";
import { ApiError, setUnauthorizedHandler } from "../../api/client";
import { AuthContext } from "./auth-context";
import { useAuthStore } from "./auth-store";

interface AuthProviderProps {
  children: ReactNode;
  queryClient: QueryClient;
}

export function AuthProvider({ children, queryClient }: AuthProviderProps) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const sessionQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: me,
    enabled: Boolean(token),
    retry: false,
  });

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
    window.location.assign("/login");
  }, [clearSession, queryClient]);

  const handleUnauthorized = useCallback(() => {
    clearSession();
    queryClient.clear();
    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `/login?redirect=${encodeURIComponent(redirect)}&message=session-expired`,
    );
  }, [clearSession, queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(undefined);
  }, [handleUnauthorized]);

  useEffect(() => {
    if (sessionQuery.data?.user) {
      useAuthStore.setState({ user: sessionQuery.data.user });
    }
  }, [sessionQuery.data]);

  useEffect(() => {
    if (
      sessionQuery.error instanceof ApiError &&
      sessionQuery.error.status === 401
    ) {
      logout();
    }
  }, [logout, sessionQuery.error]);

  const value = {
    isLoading: Boolean(token) && sessionQuery.isPending,
    token,
    user: user ?? sessionQuery.data?.user ?? null,
    setSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
