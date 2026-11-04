export function ValueProposition() {
  return (
    <section className="landing-section border-t border-border bg-surface px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          One workspace. The entire workflow.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Stop jumping between apps to plan work, track progress, and understand
          what's next. Kanbot connects planning, execution, and AI assistance in
          one focused place.
        </p>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
          <div className="landing-card rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
              <span className="text-2xl font-extrabold text-primary">1</span>
            </div>
            <h3 className="text-lg font-extrabold">Unified backlog</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              All your work in priority order, not scattered across tools and
              documents.
            </p>
          </div>
          <div className="landing-card rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-indigo-subtle">
              <span className="text-2xl font-extrabold text-brand-indigo">
                2
              </span>
            </div>
            <h3 className="text-lg font-extrabold">Focused sprints</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Plan realistic sprints with clear goals, then execute with a calm
              Kanban board.
            </p>
          </div>
          <div className="landing-card rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-subtle">
              <span className="text-2xl font-extrabold text-secondary">3</span>
            </div>
            <h3 className="text-lg font-extrabold">AI assistance</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Generate todos, plan capacity, and summarize progress—with you in
              control.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
