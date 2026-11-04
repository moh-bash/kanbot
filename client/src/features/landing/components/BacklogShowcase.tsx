import { Search, Filter, GripVertical, Plus } from "lucide-react";

const backlogItems = [
  {
    key: "KAN-12",
    title: "Implement user authentication flow",
    type: "story",
    priority: "high",
    points: 8,
    labels: ["auth", "backend"],
  },
  {
    key: "KAN-15",
    title: "Design landing page hero section",
    type: "task",
    priority: "high",
    points: 3,
    labels: ["design"],
  },
  {
    key: "KAN-18",
    title: "Fix mobile navigation overflow bug",
    type: "bug",
    priority: "urgent",
    points: 2,
    labels: ["mobile", "ui"],
  },
  {
    key: "KAN-21",
    title: "Add project export functionality",
    type: "task",
    priority: "medium",
    points: 5,
    labels: ["feature"],
  },
];

const priorityColors = {
  urgent: "bg-destructive-subtle text-destructive border-destructive/20",
  high: "bg-accent-amber-subtle text-accent-amber border-accent-amber/20",
  medium: "bg-primary-subtle text-primary border-primary/20",
  low: "bg-surface-hover text-muted-foreground border-border",
};

const typeIcons = {
  story: "📖",
  task: "✓",
  bug: "🐛",
};

export function BacklogShowcase() {
  return (
    <section className="landing-section border-t border-border bg-surface px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Prioritize what matters
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Your backlog stays organized with drag-and-drop ordering, rich
              filters, and quick inline creation. See story points, priorities,
              and labels at a glance.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Drag to reorder by priority",
                "Filter by type, priority, and labels",
                "Quick create with keyboard shortcuts",
                "Track story points and estimates",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-subtle text-secondary">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="font-semibold text-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            {/* Backlog Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold">Backlog</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  18 items · 42 story points
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover">
                <Plus className="h-4 w-4" />
                Add todo
              </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search todos..."
                  className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled
                />
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-hover">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            {/* Backlog Items */}
            <div className="space-y-2">
              {backlogItems.map((item) => (
                <div
                  key={item.key}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="text-lg">
                    {typeIcons[item.type as keyof typeof typeIcons]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {item.key}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-xs font-bold uppercase ${priorityColors[item.priority as keyof typeof priorityColors]}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-semibold text-foreground">
                      {item.title}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {item.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-md bg-brand-indigo-subtle px-2 py-0.5 text-xs font-semibold text-brand-indigo"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-sm font-extrabold text-primary">
                    {item.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
