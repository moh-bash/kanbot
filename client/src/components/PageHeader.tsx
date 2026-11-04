import { Plus } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
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
    <div className="border-b border-border bg-surface px-4 py-3 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="absolute mt-[-2.5rem] hidden items-center gap-2 text-xs font-bold text-muted-foreground sm:flex">
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

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {description && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            )}
          </div>

          {actions.length > 0 && (
            <div className="flex shrink-0 gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={action.onClick}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-bold transition-smooth focus:outline-none focus:ring-2 focus:ring-ring                   sm:h-10 ${
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
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projectQuery = useProject(projectId);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);

  const project = projectQuery.data?.project;

  // Determine page type from route
  const path = location.pathname;
  const isProjectsPage = path === "/projects";
  const isBacklogPage = path.includes("/backlog");
  const isBoardPage = path.includes("/board");
  const isSprintsPage = path.includes("/sprints");
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
      onClick: () =>
        navigate(`/projects/${projectId}/backlog?create=1`, {
          state: { focusCreate: true },
        }),
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
