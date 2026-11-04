import { ArrowLeft, CalendarDays, CheckCircle2, Target } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import type { Todo } from "../../types/api";
import { useBacklog } from "../../hooks/useBacklog";
import { useSprint } from "../../hooks/useSprints";
import { TodoDetailsPanel } from "../todos/TodoDetailsPanel";
import { SprintSummary } from "../ai/AIComponents";

export function SprintDetailsPage() {
  const { projectId = "", sprintId = "" } = useParams();
  const query = useSprint(sprintId);
  const todosQuery = useBacklog(projectId, { sprintId });
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-5 py-10">
        <div className="h-10 w-72 rounded bg-surface" />
        <div className="mt-8 h-48 rounded-2xl bg-surface" />
      </div>
    );
  }
  if (query.isError || !query.data?.sprint) {
    return (
      <div className="px-5 py-20 text-center">
        <h1 className="text-xl font-extrabold text-foreground">
          Couldn’t load sprint details
        </h1>
        <Link
          to={`/projects/${projectId}/sprints`}
          className="mt-5 inline-block text-sm font-bold text-primary"
        >
          Back to sprints
        </Link>
      </div>
    );
  }

  const sprint = query.data.sprint;
  const stats =
    sprint.status === "completed" && sprint.completedStats
      ? sprint.completedStats
      : sprint.stats;
  const completion = stats.totalTodos
    ? Math.round((stats.doneTodos / stats.totalTodos) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
      <Link
        to={`/projects/${projectId}/sprints`}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Sprints
      </Link>

      <header className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                sprint.status === "completed"
                  ? "bg-background text-muted-foreground"
                  : sprint.status === "active"
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {sprint.status}
            </span>
            <h1 className="mt-4 truncate text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {sprint.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {sprint.goal || "No sprint goal added."}
            </p>
          </div>
          {sprint.status === "active" && (
            <Link
              to={`/projects/${projectId}/board`}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground"
            >
              <Target className="h-4 w-4" aria-hidden="true" />
              Open board
            </Link>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-5 border-t border-border pt-5 text-sm font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {sprint.startDate ?? "No start"} — {sprint.endDate ?? "No end"}
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2
              className="h-4 w-4 text-secondary"
              aria-hidden="true"
            />
            {stats.doneTodos} completed
          </span>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Completion" value={`${completion}%`} />
        <Metric label="Total todos" value={stats.totalTodos} />
        <Metric label="Completed todos" value={stats.doneTodos} />
        <Metric label="Story points" value={stats.totalPoints} />
        <Metric label="Completed points" value={stats.donePoints} />
        {sprint.status === "completed" && (
          <Metric
            label="Carried over"
            value={sprint.completedStats?.carriedOver ?? 0}
          />
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">
              Sprint todos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the work included in this sprint.
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {todosQuery.data?.todos.length ?? 0} items
          </span>
        </div>
        {todosQuery.isLoading && (
          <p className="mt-5 text-sm text-muted-foreground">Loading todos…</p>
        )}
        {todosQuery.isError && (
          <p className="mt-5 text-sm font-semibold text-destructive">
            Unable to load sprint todos.
          </p>
        )}
        {!todosQuery.isLoading &&
          !todosQuery.isError &&
          todosQuery.data?.todos.length === 0 && (
            <p className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No todos are assigned to this sprint.
            </p>
          )}
        <div className="mt-4 divide-y divide-border">
          {todosQuery.data?.todos.map((todo) => (
            <button
              key={todo.id}
              type="button"
              onClick={() => setSelectedTodo(todo)}
              className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 py-4 text-left transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className="shrink-0 text-xs font-extrabold tracking-wider text-primary">
                {todo.key}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-foreground">
                {todo.title}
              </span>
              <span className="rounded-md bg-background px-2 py-1 text-[11px] font-bold capitalize text-muted-foreground">
                {todo.status.replace("_", " ")}
              </span>
              <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-bold capitalize text-primary">
                {todo.priority}
              </span>
              <span className="shrink-0 text-xs font-bold text-muted-foreground">
                {todo.storyPoints ?? "—"} pts
              </span>
            </button>
          ))}
        </div>
      </section>

      <SprintSummary sprint={sprint} />
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xl font-extrabold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
