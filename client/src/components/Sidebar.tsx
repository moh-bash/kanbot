import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  Menu,
  Rows3,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import { useProjects } from "../hooks/useProjects";
import gsap from "gsap";
import logoIcon from "../assets/logo/kanbot-icon.png";
import logo from "../assets/logo/kanbot-logo.svg";
import kanbotIcon from "../assets/logo/kanbot-icon.png";
import darkLogo from "../assets/logo/kanbot-logo-dark.svg";

const STORAGE_KEY = "kanbot_sidebar_collapsed";

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const { user } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();
  const { data } = useProjects();
  const projects = data?.projects ?? [];
  const currentProject = projects.find((p) => p.id === projectId);

  const navItems = projectId
    ? [
        {
          label: "Backlog",
          icon: ListChecks,
          to: `/projects/${projectId}/backlog`,
        },
        {
          label: "Board",
          icon: LayoutDashboard,
          to: `/projects/${projectId}/board`,
        },
        { label: "Sprints", icon: Rows3, to: `/projects/${projectId}/sprints` },
      ]
    : [];

  const toggleSidebar = () => {
    const willCollapse = !collapsed;
    onCollapsedChange(willCollapse);
    localStorage.setItem(STORAGE_KEY, String(willCollapse));
  };

  return (
    <aside className="sticky top-0 z-30 hidden h-screen min-w-0 flex-col border-r border-border bg-surface lg:flex">
      {/* Header with Logo */}
      <div className="flex h-20 items-center justify-between border-b border-border px-5">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="Kanbot home"
          >
            <img src={kanbotIcon} alt="" className="h-8 w-8" />
            <span className="text-xl font-extrabold tracking-tight text-brand-indigo">
              kanbot
            </span>
          </Link>
        ) : (
          <Link
            to="/projects"
            className="mx-auto flex items-center justify-center"
          >
            <img src={logoIcon} alt="Kanbot" className="h-9 w-9 rounded-lg" />
          </Link>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-full p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-smooth"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          className="mx-auto my-3 rounded-full p-2.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-smooth"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!collapsed && (
          <>
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                Projects
              </h2>
              <Link
                to="/projects"
                className="text-xs font-bold text-primary hover:text-primary-hover transition-smooth"
              >
                View all
              </Link>
            </div>

            <div className="space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/backlog`}
                  className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition-smooth ${
                    project.id === projectId
                      ? "bg-primary-subtle text-primary"
                      : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-indigo-subtle text-xs font-bold text-brand-indigo">
                    {project.key.slice(0, 2)}
                  </span>
                  <span className="flex-1 truncate">{project.name}</span>
                </Link>
              ))}

              {projects.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-foreground-subtle">
                  No projects yet
                </p>
              )}
            </div>
          </>
        )}

        {collapsed && (
          <div className="space-y-2">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}/backlog`}
                className={`mx-auto flex h-10 w-10 items-center justify-center rounded-[14px] text-xs font-bold transition-smooth ${
                  project.id === projectId
                    ? "bg-primary-subtle text-primary"
                    : "bg-brand-indigo-subtle text-brand-indigo hover:bg-surface-hover"
                }`}
                title={project.name}
              >
                {project.key.slice(0, 2)}
              </Link>
            ))}
          </div>
        )}

        {/* Project Navigation */}
        {projectId && (
          <nav
            className={`${collapsed ? "mt-6" : "mt-8"} space-y-1`}
            aria-label="Project navigation"
          >
            {!collapsed && currentProject && (
              <div className="mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground-subtle" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                    {currentProject.key}
                  </p>
                </div>
              </div>
            )}

            {navItems.map(({ label, icon: Icon, to }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold transition-smooth ${
                  location.pathname === to
                    ? "bg-brand-indigo-subtle text-brand-indigo"
                    : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <Link
          to="/profile"
          className={`flex items-center gap-3 rounded-[16px] p-2 transition-smooth ${
            location.pathname === "/profile"
              ? "bg-primary-subtle"
              : "hover:bg-surface-hover"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-indigo text-sm font-bold text-white">
            {user?.name.slice(0, 1).toUpperCase()}
          </span>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-bold text-foreground">
                {user?.name}
              </p>
              <p className="truncate text-xs text-foreground-muted">
                {user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <UserRound className="h-4 w-4 shrink-0 text-foreground-muted" />
          )}
        </Link>
      </div>
    </aside>
  );
}

export function MobileSidebar({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useProjects();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const initialPathRef = useRef(location.pathname);
  const projects = data?.projects ?? [];
  const currentProject = projects.find((p) => p.id === projectId);

  const navItems = projectId
    ? [
        {
          label: "Backlog",
          icon: ListChecks,
          to: `/projects/${projectId}/backlog`,
        },
        {
          label: "Board",
          icon: LayoutDashboard,
          to: `/projects/${projectId}/board`,
        },
        { label: "Sprints", icon: Rows3, to: `/projects/${projectId}/sprints` },
      ]
    : [];

  useEffect(() => {
    if (location.pathname !== initialPathRef.current) onClose();
  }, [location.pathname, onClose]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.body.style.overflow = "hidden";

    if (!reduceMotion && drawerRef.current && backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" },
      );
      gsap.fromTo(
        drawerRef.current,
        { x: -280 },
        { x: 0, duration: 0.35, ease: "power3.out" },
      );
    } else if (drawerRef.current && backdropRef.current) {
      gsap.set(backdropRef.current, { opacity: 1 });
      gsap.set(drawerRef.current, { x: 0 });
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleClose = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduceMotion && drawerRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(drawerRef.current, {
        x: -280,
        duration: 0.3,
        ease: "power3.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleNavigate = (to: string) => {
    handleClose();
    navigate(to);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        className="absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-1rem))] flex-col border-r border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b border-border px-5">
          <Link
            to="/projects"
            onClick={handleClose}
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <img src={logo} alt="Kanbot" className="h-8 w-auto dark:hidden" />
            <img
              src={darkLogo}
              alt="Kanbot"
              className="hidden h-8 w-auto dark:block"
            />
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-smooth"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-3 flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
              Projects
            </h2>
            <button
              onClick={() => handleNavigate("/projects")}
              className="text-xs font-bold text-primary hover:text-primary-hover transition-smooth"
            >
              View all
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() =>
                  handleNavigate(`/projects/${project.id}/backlog`)
                }
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-smooth ${
                  project.id === projectId
                    ? "bg-primary-subtle text-primary"
                    : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-indigo-subtle text-xs font-bold text-brand-indigo">
                  {project.key.slice(0, 2)}
                </span>
                <span className="flex-1 truncate">{project.name}</span>
              </button>
            ))}
          </div>

          {/* Project Navigation */}
          {projectId && currentProject && (
            <nav className="mt-8 space-y-1" aria-label="Project navigation">
              <div className="mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground-subtle" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                    {currentProject.key}
                  </p>
                </div>
              </div>

              {navItems.map(({ label, icon: Icon, to }) => (
                <button
                  key={to}
                  onClick={() => handleNavigate(to)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-smooth ${
                    location.pathname === to
                      ? "bg-brand-indigo-subtle text-brand-indigo"
                      : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => handleNavigate("/profile")}
            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-smooth ${
              location.pathname === "/profile"
                ? "bg-primary-subtle"
                : "hover:bg-surface-hover"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-indigo text-sm font-bold text-white">
              {user?.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-bold text-foreground">
                {user?.name}
              </p>
              <p className="truncate text-xs text-foreground-muted">
                {user?.email}
              </p>
            </div>
            <UserRound className="h-4 w-4 shrink-0 text-foreground-muted" />
          </button>
        </div>
      </aside>
    </div>
  );
}

export function MobileMenuButton({
  onClick,
  expanded = false,
}: {
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="rounded-lg p-2 text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-smooth lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
