import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }
  if (!user) {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }
  return user ? <Navigate to="/projects" replace /> : <Outlet />;
}

function FullPageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        Checking your session…
      </div>
    </main>
  );
}
