import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { Bot, ChevronRight, PanelTop, Search } from "lucide-react";
import {
  AIAssistantDrawer,
  GenerateTodosDialog,
  PlanSprintDialog,
} from "./features/ai/AIComponents";
import { useAIStatus } from "./hooks/useAI";
import { useProject } from "./hooks/useProjects";
import { ApiError } from "./api/client";
import { useCallback, useEffect, useState } from "react";
import { TodoDetailsPanel } from "./features/todos/TodoDetailsPanel";
import { Sidebar, MobileSidebar, MobileMenuButton } from "./components/Sidebar";
import type { ChatMessage, Todo } from "./types/api";
import { ShortcutHelpDialog } from "./features/keyboard/ShortcutHelpDialog";
import { useKeyboardShortcuts } from "./features/keyboard/useKeyboardShortcuts";
import { CommandPalette } from "./features/command-palette/CommandPalette";
import { PWAStatus } from "./components/PWAStatus";

export function AppShell() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const projectQuery = useProject(projectId);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiDialog, setAiDialog] = useState<"todos" | "sprint" | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const handleChatMessagesChange = useCallback(
    (messages: ChatMessage[]) => {
      if (!projectId) return;
      setChatMessages((current) => ({ ...current, [projectId]: messages }));
    },
    [projectId],
  );
  useAIStatus();
  const inProject = Boolean(projectId);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("kanbot_sidebar_collapsed");
    return stored === "true";
  });

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    enabled: !aiOpen && !shortcutHelpOpen && !commandPaletteOpen,
    onCreateTodo: () => {
      if (projectId) {
        navigate(`/projects/${projectId}/backlog`);
      }
    },
    onFocusSearch: () => {
      if (projectId) {
        navigate(`/projects/${projectId}/backlog`);
      }
    },
    onShowHelp: () => setShortcutHelpOpen(true),
    onGoToBoard: () => {
      if (projectId) {
        navigate(`/projects/${projectId}/board`);
      }
    },
  });

  // Handle command palette (Ctrl/Cmd + K)
  useEffect(() => {
    const handleCommandPalette = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommandPalette);
    return () => window.removeEventListener("keydown", handleCommandPalette);
  }, []);

  if (projectId && projectQuery.isPending) return <ProjectLoadingState />;
  if (projectId && projectQuery.isError) {
    return (
      <ProjectErrorState
        projectId={projectId}
        error={projectQuery.error}
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }
  if (projectId && !projectQuery.data?.project) {
    return (
      <ProjectErrorState
        projectId={projectId}
        error={new ApiError(404, "NOT_FOUND", "Project not found.")}
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }

  return (
    <div
      className="grid min-h-screen bg-background text-foreground transition-[grid-template-columns] duration-300 ease-in-out motion-reduce:transition-none max-lg:block"
      style={{
        gridTemplateColumns: `${sidebarCollapsed ? "80px" : "280px"} minmax(0, 1fr)`,
      }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className="min-w-0">
        <header className="sticky top-0 z-20 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex min-h-[68px] items-center justify-between rounded-[22px] border border-border bg-surface px-3 shadow-sm sm:px-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <MobileMenuButton
                onClick={() => setMobileMenuOpen(true)}
                expanded={mobileMenuOpen}
              />

              <div className="flex min-w-0 items-center gap-3">
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-subtle text-primary sm:flex">
                  <PanelTop className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground sm:text-[15px]">
                    {inProject ? projectQuery.data?.project?.name : "Projects"}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-foreground-muted">
                    {inProject ? (
                      <>
                        <span className="font-medium">Workspace</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="truncate capitalize">
                          {location.pathname.split("/").pop()}
                        </span>
                      </>
                    ) : (
                      <span>Your personal projects</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="group inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-foreground-muted transition-smooth hover:border-primary/40 hover:bg-surface-hover hover:text-foreground sm:px-3.5"
                  title="Search (Ctrl+K)"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground group-hover:border-primary/20 lg:inline-block">
                    ⌘K
                  </kbd>
                </button>
                {inProject && (
                  <button
                    type="button"
                    onClick={() => setAiOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 text-xs font-bold text-primary transition-smooth hover:border-primary/40 hover:bg-primary/15 sm:px-4"
                  >
                    <Bot className="h-4 w-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main>
          <PWAStatus />
          <Outlet />
        </main>
      </div>

      {mobileMenuOpen && (
        <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
      )}
      {projectId && aiOpen && (
        <AIAssistantDrawer
          key={projectId}
          projectId={projectId}
          initialMessages={chatMessages[projectId] ?? []}
          onMessagesChange={handleChatMessagesChange}
          onClose={() => setAiOpen(false)}
          onGenerateTodos={() => {
            setAiOpen(false);
            setAiDialog("todos");
          }}
          onPlanSprint={() => {
            setAiOpen(false);
            setAiDialog("sprint");
          }}
          onSummarizeSprint={() => {
            setAiOpen(false);
            navigate(`/projects/${projectId}/board`);
          }}
        />
      )}
      {projectId && aiDialog === "todos" && (
        <GenerateTodosDialog
          projectId={projectId}
          onClose={() => setAiDialog(null)}
        />
      )}
      {projectId && aiDialog === "sprint" && (
        <PlanSprintDialog
          projectId={projectId}
          onClose={() => setAiDialog(null)}
        />
      )}
      {shortcutHelpOpen && (
        <ShortcutHelpDialog onClose={() => setShortcutHelpOpen(false)} />
      )}
      {commandPaletteOpen && (
        <CommandPalette
          onClose={() => setCommandPaletteOpen(false)}
          onCreateTodo={() => {
            setCommandPaletteOpen(false);
            if (projectId) {
              navigate(`/projects/${projectId}/backlog`);
            }
          }}
          onCreateProject={() => {
            setCommandPaletteOpen(false);
            navigate("/projects");
          }}
          onShowHelp={() => {
            setCommandPaletteOpen(false);
            setShortcutHelpOpen(true);
          }}
          onOpenTodo={(todo) => {
            setCommandPaletteOpen(false);
            setSelectedTodo(todo);
          }}
        />
      )}
      {selectedTodo && (
        <TodoDetailsPanel
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onDeleted={() => setSelectedTodo(null)}
        />
      )}
    </div>
  );
}

export function RoutePlaceholder() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-extrabold tracking-[0.2em] text-primary">
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you requested may not exist or may have moved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/projects"
            className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring/20"
          >
            Back to Projects
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-bold text-foreground hover:bg-background focus:outline-none focus:ring-4 focus:ring-ring/20"
          >
            Go back
          </button>
        </div>
      </div>
    </main>
  );
}

function ProjectLoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        Loading project…
      </div>
    </main>
  );
}

function ProjectErrorState({
  projectId,
  error,
  onRetry,
}: {
  projectId: string;
  error: unknown;
  onRetry: () => void;
}) {
  const isNotFound =
    error instanceof ApiError &&
    (error.status === 404 || error.code === "NOT_FOUND");
  const isNetwork = error instanceof ApiError && error.status === 0;
  const title = isNotFound
    ? "Project not found"
    : isNetwork
      ? "Couldn’t reach Kanbot"
      : "Couldn’t load this project";
  const message = isNotFound
    ? "This project may have been deleted, or the link may be incorrect."
    : error instanceof ApiError
      ? error.message
      : "Something went wrong while loading this project.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-extrabold tracking-[0.16em] text-destructive">
          {isNotFound ? "404" : "ERROR"}
        </p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {!isNotFound && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring/20"
            >
              Try again
            </button>
          )}
          <Link
            to="/projects"
            className={`${isNotFound ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "border border-border text-foreground hover:bg-background"} inline-flex h-11 items-center rounded-xl px-5 text-sm font-extrabold focus:outline-none focus:ring-4 focus:ring-ring/20`}
          >
            Back to Projects
          </Link>
        </div>
        <p className="mt-5 truncate text-xs text-muted-foreground">
          Project ID: {projectId}
        </p>
      </div>
    </main>
  );
}
