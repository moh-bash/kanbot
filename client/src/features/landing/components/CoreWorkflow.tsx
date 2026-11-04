import { Layers, Target, ListChecks, Kanban } from "lucide-react";

const steps = [
  {
    icon: Layers,
    title: "Organize your backlog",
    description:
      "Capture every idea and task. Prioritize what matters. Keep it all in one place.",
    color: "primary",
  },
  {
    icon: Target,
    title: "Plan focused sprints",
    description:
      "Choose realistic goals. Select the right work. Use AI to match capacity and priorities.",
    color: "brand-indigo",
  },
  {
    icon: Kanban,
    title: "Track on the board",
    description:
      "Move cards through To Do, In Progress, In Review, and Done. See progress at a glance.",
    color: "secondary",
  },
  {
    icon: ListChecks,
    title: "Review and iterate",
    description:
      "Complete sprints. Generate AI summaries. Learn from what worked and what didn't.",
    color: "accent-amber",
  },
];

export function CoreWorkflow() {
  return (
    <section
      id="workflow"
      className="landing-section scroll-mt-20 border-t border-border px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            From first idea to finished sprint
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A clear workflow that helps you stay organized, prioritize
            effectively, and ship with confidence.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorClasses = {
              primary: "bg-primary-subtle text-primary",
              "brand-indigo": "bg-brand-indigo-subtle text-brand-indigo",
              secondary: "bg-secondary-subtle text-secondary",
              "accent-amber": "bg-accent-amber-subtle text-accent-amber",
            };

            return (
              <div
                key={step.title}
                className="landing-card group relative rounded-2xl border border-border bg-surface p-8 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[step.color as keyof typeof colorClasses]}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-bold text-muted-foreground">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-extrabold">{step.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
