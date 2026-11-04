import { Plus } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import { useState } from "react";
import { useProject } from "../hooks/useProjects";
import { ProjectDialog } from "../features/projects/ProjectDialog";
import { CreateSprintDialog } from "../features/sprints/SprintDialogs";

interface PageAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  description?: string;
  actions?: PageAction[];
}

export function PageHeader({
  title,
  breadcrumbs,
  description,
  actions = [],
}: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-surface px-5 py-5 sm:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-[1500px]">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 flex items-center gap-2 text-sm font-bold text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-primary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-bold transition-smooth focus:outline-none focus:ring-2 focus:ring-ring sm:h-11 ${
                    action.variant === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "border border-border text-foreground hover:bg-surface-hover"
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Smart page header that automatically resolves context-aware actions
export function SmartPageHeader() {
  const location = useLocation();
  const { projectId } = useParams();
  const projectQuery = useProject(projectId);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [createTodoFocused, setCreateTodoFocused] = useState(false);

  const project = projectQuery.data?.project;

  // Determine page type from route
  const path = location.pathname;
  const isProjectsPage = path === "/projects";
  const isBacklogPage = path.includes("/backlog");
  const isBoardPage = path.includes("/board");
  const isSprintsPage = path.includes("/sprints") && !path.match(/\/sprints\/[^/]+$/);
  const isProfilePage = path === "/profile";

  // Build breadcrumbs
  const breadcrumbs: Array<{ label: string; to?: string }> = [];
  
  if (projectId && project) {
    breadcrumbs.push({ label: "Projects", to: "/projects" });
    breadcrumbs.push({ label: project.key });
  }

  // Determine title
  let title = "Projects";
  let description: string | undefined;

  if (isProfilePage) {
    title = "Profile";
    description = "Manage your account and application preferences.";
  } else if (isProjectsPage) {
    title = "Projects";
    description = "Choose a project to focus on, or start something new.";
  } else if (isBacklogPage && project) {
    title = "Backlog";
    description = `${project.name} · Everything you might work on next.`;
  } else if (isBoardPage && project) {
    title = "Board";
    description = `${project.name} · Focus the team on the most valuable work.`;
  } else if (isSprintsPage && project) {
    title = "Sprints";
    description = `${project.name} · Plan upcoming work and review completed cycles.`;
  }

  // Determine actions based on page
  const actions: PageAction[] = [];

  if (isProjectsPage) {
    actions.push({
      label: "Create Project",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => setCreateProjectOpen(true),
      variant: "primary",
    });
  } else if (isBacklogPage || isBoardPage) {
    actions.push({
      label: "Create Task",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => {
        // Trigger focus on quick create input
        setCreateTodoFocused(true);
        // Scroll to backlog if we're on board and backlog is in the page
        if (isBoardPage) {
          window.location.href = `/projects/${projectId}/backlog`;
        }
      },
      variant: "primary",
    });
  } else if (isSprintsPage) {
    actions.push({
      label: "Create Sprint",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => setCreateSprintOpen(true),
      variant: "primary",
    });
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}
        description={description}
        actions={actions}
      />
      
      {createProjectOpen && (
        <ProjectDialog
          onClose={() => setCreateProjectOpen(false)}
          onCreated={(id) => {
            setCreateProjectOpen(false);
            window.location.href = `/projects/${id}/backlog`;
          }}
        />
      )}

      {createSprintOpen && projectId && (
        <CreateSprintDialog
          projectId={projectId}
          onClose={() => setCreateSprintOpen(false)}
        />
      )}
    </>
  );
}
