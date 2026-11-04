import {
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useKeyboardShortcuts } from "../keyboard/useKeyboardShortcuts";
import type { ProjectWithStats } from "../../types/api";
import { ApiError } from "../../api/client";
import { useDeleteProject, useProjects } from "../../hooks/useProjects";
import { useToastStore } from "../../components/toast-store";
import { ProjectDialog } from "./ProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

export function ProjectsPage() {
  const projectsQuery = useProjects();
  const deleteMutation = useDeleteProject();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [dialog, setDialog] = useState<"create" | ProjectWithStats | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithStats | null>(
    null,
  );

  // Register keyboard shortcuts (minimal for projects page)
  useKeyboardShortcuts({
    enabled: !dialog && !deleteTarget,
    onCreateTodo: () => {}, // No project selected
    onFocusSearch: () => {}, // No search on projects page
    onShowHelp: () => {}, // Handled globally in AppShell
    onGoToBoard: () => {}, // No project selected
  });
  const projects = projectsQuery.data?.projects ?? [];
  const backlogTotal = projects.reduce(
    (total, project) => total + project.stats.backlogCount,
    0,
  );
  const activeSprints = projects.filter(
    (project) => project.stats.activeSprint,
  ).length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      addToast("Project deleted successfully.");
      navigate("/projects", { replace: true });
    } catch (error) {
      addToast(
        error instanceof ApiError ? error.message : "Unable to delete project.",
        "error",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-col justify-between gap-6 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-primary">
            WORKSPACE OVERVIEW
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-[2.6rem]">
            Make room for good work.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Choose a project to focus on, or start something new. Your work,
            without the noise.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog("create")}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring/25"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Create project
        </button>
      </div>
      <div className="mb-9 grid gap-3 sm:grid-cols-3">
        <SummaryStat label="Projects" value={projects.length} tone="blue" />
        <SummaryStat label="Backlog items" value={backlogTotal} tone="violet" />
        <SummaryStat
          label="Active sprints"
          value={activeSprints}
          tone="green"
        />
      </div>
      {projectsQuery.isLoading && <ProjectSkeletons />}
      {projectsQuery.isError && (
        <ErrorState onRetry={() => projectsQuery.refetch()} />
      )}
      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        projects.length === 0 && (
          <EmptyProjects onCreate={() => setDialog("create")} />
        )}
      {!projectsQuery.isLoading &&
        !projectsQuery.isError &&
        projects.length > 0 && (
          <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setDialog(project)}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
          </div>
        )}
      {dialog && (
        <ProjectDialog
          project={dialog === "create" ? undefined : dialog}
          onClose={() => setDialog(null)}
          onCreated={(id) => navigate(`/projects/${id}/backlog`)}
          onSaved={() => addToast("Project updated successfully.")}
        />
      )}
      {deleteTarget && (
        <DeleteProjectDialog
          project={deleteTarget}
          pending={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "violet" | "green";
}) {
  const toneClass = {
    blue: "bg-primary-subtle text-primary",
    violet: "bg-brand-indigo-subtle text-brand-indigo",
    green: "bg-secondary-subtle text-secondary",
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(16,18,20,0.03)]">
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span
        className={`rounded-xl px-3 py-1.5 text-lg font-extrabold tabular-nums ${toneClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectWithStats;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <article className="group relative flex min-h-64 min-w-0 flex-col rounded-2xl border border-border bg-surface p-5 transition-[border-color,background-color] duration-200 hover:border-primary/45 hover:bg-surface-hover focus-within:border-primary/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
          <FolderKanban className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label={`Actions for ${project.name}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-10 w-40 rounded-xl border border-border bg-surface p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-background"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-lg font-extrabold text-foreground">
            {project.name}
          </h2>
          <span className="shrink-0 rounded-md bg-background px-2 py-1 text-[11px] font-extrabold tracking-wider text-muted-foreground">
            {project.key}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {project.description || "No description yet."}
        </p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-5">
        <div>
          <p className="text-xl font-extrabold tabular-nums text-foreground">
            {project.stats.backlogCount}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            Backlog items
          </p>
        </div>
        <div>
          <p className="truncate text-sm font-extrabold text-foreground">
            {project.stats.activeSprint?.name ?? "No active sprint"}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            Active sprint
          </p>
        </div>
      </div>
      <Link
        to={`/projects/${project.id}/backlog`}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background text-sm font-extrabold text-primary transition-colors hover:border-primary/40 hover:bg-primary-subtle focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Open workspace
      </Link>
    </article>
  );
}

function ProjectSkeletons() {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-64 animate-pulse rounded-2xl border border-border bg-surface p-6"
        >
          <div className="h-11 w-11 rounded-xl bg-background" />
          <div className="mt-5 h-5 w-2/3 rounded bg-background" />
          <div className="mt-3 h-10 rounded bg-background" />
        </div>
      ))}
    </div>
  );
}
function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FolderKanban className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-extrabold text-foreground">
        Your workspace is ready
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Create your first project to organize ideas, plan focused sprints, and
        make progress visible.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" /> Create your first project
      </button>
    </div>
  );
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center">
      <p className="text-base font-extrabold text-foreground">
        We couldn’t load your projects
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground hover:bg-background"
      >
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
