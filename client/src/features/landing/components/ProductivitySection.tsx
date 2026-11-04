import { Focus, Layers, TrendingUp, Clock } from "lucide-react";

const benefits = [
  {
    icon: Focus,
    title: "Less context switching",
    description:
      "Plan, execute, and review in one tool. Stop jumping between apps to see the full picture.",
  },
  {
    icon: Layers,
    title: "Clearer priorities",
    description:
      "Drag to reorder your backlog. See what matters most. Move the right work into each sprint.",
  },
  {
    icon: TrendingUp,
    title: "Better sprint planning",
    description:
      "Use AI to match capacity with priorities. Create realistic plans that you can actually finish.",
  },
  {
    icon: Clock,
    title: "Faster progress tracking",
    description:
      "See sprint progress at a glance. Move cards. Watch completion metrics update in real-time.",
  },
];

export function ProductivitySection() {
  return (
    <section
      id="productivity"
      className="landing-section scroll-mt-20 border-t border-border px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            A connected workflow means fewer interruptions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            When planning, execution, and AI assistance live in one place, you
            spend less time managing tools and more time shipping.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="landing-card rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-subtle">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-extrabold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Visual Comparison */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border-2 border-destructive/30 bg-destructive-subtle p-6">
            <div className="mb-4 text-sm font-extrabold uppercase tracking-wide text-destructive">
              Without Kanbot
            </div>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-destructive">✕</span>
                <span>
                  Backlog in Google Docs, tasks in Trello, notes in Notion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-destructive">✕</span>
                <span>Manual sprint planning with spreadsheets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-destructive">✕</span>
                <span>No clear view of what's actually in progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-destructive">✕</span>
                <span>Writing todos and summaries takes forever</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border-2 border-secondary/30 bg-secondary-subtle p-6">
            <div className="mb-4 text-sm font-extrabold uppercase tracking-wide text-secondary">
              With Kanbot
            </div>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-secondary">✓</span>
                <span>Everything organized in one workspace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-secondary">✓</span>
                <span>AI suggests realistic sprint plans in seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-secondary">✓</span>
                <span>Active sprint board shows real-time progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-secondary">✓</span>
                <span>Generate todos and summaries with AI assistance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
