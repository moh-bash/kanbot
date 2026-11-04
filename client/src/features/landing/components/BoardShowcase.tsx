import { MoreVertical, User } from "lucide-react";

const boardColumns = [
  {
    status: "To Do",
    count: 4,
    cards: [
      { key: "KAN-23", title: "API rate limiting", points: 3, type: "task" },
      { key: "KAN-25", title: "User settings page", points: 5, type: "story" },
    ],
  },
  {
    status: "In Progress",
    count: 2,
    cards: [
      {
        key: "KAN-19",
        title: "Sprint planning dialog",
        points: 5,
        type: "story",
      },
      { key: "KAN-21", title: "Board drag & drop", points: 8, type: "task" },
    ],
  },
  {
    status: "In Review",
    count: 1,
    cards: [
      {
        key: "KAN-16",
        title: "Login authentication",
        points: 8,
        type: "story",
      },
    ],
  },
  {
    status: "Done",
    count: 6,
    cards: [
      { key: "KAN-12", title: "Design system setup", points: 5, type: "task" },
      { key: "KAN-14", title: "Project routing", points: 3, type: "task" },
    ],
  },
];

export function BoardShowcase() {
  return (
    <section className="landing-section border-t border-border px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
          {/* Board Preview */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              {/* Sprint Header */}
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-extrabold">
                    Sprint 4 — Ship core features
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Nov 3, 2026 · 2 days left
                  </p>
                </div>
                <User className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Progress Bar */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Sprint progress</span>
                  <span className="text-foreground">
                    9 of 13 todos · 21 of 34 points
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "62%" }}
                  />
                </div>
              </div>

              {/* Board Columns */}
              <div className="grid gap-3 sm:grid-cols-4">
                {boardColumns.map((column, colIndex) => (
                  <div
                    key={column.status}
                    className="rounded-lg bg-background p-3"
                    style={{
                      minHeight: colIndex === 3 ? "280px" : "320px",
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wide">
                        {column.status}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {column.count}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {column.cards.map((card) => (
                        <div
                          key={card.key}
                          className="group cursor-grab rounded-lg border border-border bg-surface p-3 transition-all hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground">
                              {card.key}
                            </span>
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <p className="mb-2 text-sm font-semibold leading-snug text-foreground">
                            {card.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {card.type === "story" ? "📖 Story" : "✓ Task"}
                            </span>
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary-subtle text-xs font-extrabold text-primary">
                              {card.points}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Execute with clarity
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Your active sprint board shows exactly what's moving through the
              workflow. Drag cards between columns. Track progress. Stay
              focused.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Four clear columns: To Do → In Progress → In Review → Done",
                "Real-time progress tracking with story points",
                "Drag and drop between columns",
                "Focus on shipping, not managing",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-subtle text-primary">
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
        </div>
      </div>
    </section>
  );
}
