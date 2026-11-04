import { Check, ChevronDown, FolderKanban } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useProjects } from "../../hooks/useProjects";

export function ProjectSwitcher() {
  const { data, isLoading } = useProjects();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentId = location.pathname.match(/^\/projects\/([^/]+)/)?.[1];
  const projects = data?.projects ?? [];
  const currentProject = projects.find((project) => project.id === currentId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={isLoading}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-wait disabled:opacity-70"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderKanban className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-foreground">
            {currentProject?.name ?? "Select a project"}
          </span>
          <span className="block text-xs font-semibold text-muted-foreground">
            {currentProject?.key ?? (isLoading ? "Loading…" : "Your projects")}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-xl border border-border bg-surface p-1 shadow-xl">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(`/projects/${project.id}/backlog`);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-background"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-extrabold text-primary">
                {project.key.slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">
                {project.name}
              </span>
              {project.id === currentId && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </button>
          ))}
          {!isLoading && projects.length === 0 && (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              Create a project to get started.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
