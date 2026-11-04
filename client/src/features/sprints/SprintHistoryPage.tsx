import {
  CalendarDays,
  ChevronRight,
  CircleCheck,
  CircleDot,
  Clock3,
  Plus,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import type { Sprint } from "../../types/api";
import { useSprints } from "../../hooks/useSprints";
import {
  CreateSprintDialog,
  EditSprintDialog,
  SprintActions,
} from "./SprintDialogs";

export function SprintHistoryPage() {
  const { projectId = "" } = useParams();
  const query = useSprints(projectId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-5 py-10">
        <div className="h-10 w-64 rounded bg-surface" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 rounded-2xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="px-5 py-20 text-center">
        <h1 className="text-xl font-extrabold text-foreground">
          Couldn’t load sprints
        </h1>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground"
        >
          Try again
        </button>
      </div>
    );
  }

  const sprints = query.data?.sprints ?? [];
  const active = sprints.find((sprint) => sprint.status === "active");
  const planned = sprints.filter((sprint) => sprint.status === "planned");
  const completed = sprints.filter((sprint) => sprint.status === "completed");
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-foreground">
            Sprints
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Plan upcoming work and review completed cycles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-11 items-center gap-2 bg-primary px-5 text-sm font-extrabold text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Create sprint
        </button>
      </div>
      {sprints.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <CircleDot className="mx-auto h-9 w-9 text-primary" />
          <h2 className="mt-4 text-xl font-extrabold text-foreground">
            No sprints yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a sprint when you are ready to focus a cycle of work.
          </p>
        </div>
      )}
      {active && (
        <SprintGroup
          title="Active sprint"
          icon={<CircleCheck className="h-5 w-5 text-secondary" />}
          sprints={[active]}
          projectId={projectId}
          plannedSprints={planned}
          onEdit={setEditSprint}
        />
      )}
      {planned.length > 0 && (
        <SprintGroup
          title="Planned sprints"
          icon={<Clock3 className="h-5 w-5 text-primary" />}
          sprints={planned}
          projectId={projectId}
          plannedSprints={planned}
          onEdit={setEditSprint}
        />
      )}
      {completed.length > 0 && (
        <SprintGroup
          title="Completed sprints"
          icon={<CircleCheck className="h-5 w-5 text-muted-foreground" />}
          sprints={completed}
          projectId={projectId}
          plannedSprints={planned}
          onEdit={setEditSprint}
        />
      )}
      {createOpen && (
        <CreateSprintDialog
          projectId={projectId}
          onClose={() => setCreateOpen(false)}
        />
      )}
      {editSprint && (
        <EditSprintDialog
          projectId={projectId}
          sprint={editSprint}
          onClose={() => setEditSprint(null)}
        />
      )}
    </div>
  );
}

function SprintGroup({
  title,
  icon,
  sprints,
  projectId,
  plannedSprints,
  onEdit,
}: {
  title: string;
  icon: ReactNode;
  sprints: Sprint[];
  projectId: string;
  plannedSprints: Sprint[];
  onEdit: (sprint: Sprint) => void;
}) {
  const active = sprints.some((sprint) => sprint.status === "active");
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sprints.map((sprint) => (
          <article
            key={sprint.id}
            className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize ${sprint.status === "active" ? "bg-secondary/10 text-secondary" : sprint.status === "planned" ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground"}`}
                  >
                    {sprint.status}
                  </span>
                  <h3 className="text-base font-extrabold text-foreground">
                    {sprint.name}
                  </h3>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {sprint.goal || "No sprint goal added."}
                </p>
              </div>
              <Link
                to={`/projects/${projectId}/sprints/${sprint.id}`}
                aria-label={`Open ${sprint.name}`}
                className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {sprint.startDate ?? "No start"} — {sprint.endDate ?? "No end"}
              </span>
              <span>
                {sprint.stats.donePoints}/{sprint.stats.totalPoints} points
              </span>
            </div>
            {(sprint.status === "planned" || active) && (
              <div className="mt-5 flex justify-end">
                <SprintActions
                  projectId={projectId}
                  sprint={sprint}
                  hasActiveSprint={Boolean(active)}
                  plannedSprints={plannedSprints}
                  onEdit={() => onEdit(sprint)}
                  onDeleted={() => undefined}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
