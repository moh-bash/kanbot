import { Bot, Sparkles, Zap } from "lucide-react";

const capabilities = [
  {
    icon: Sparkles,
    title: "Generate todos",
    description:
      "Describe a feature in plain language. Get a structured list of tasks ready to review and add to your backlog.",
  },
  {
    icon: Zap,
    title: "Plan sprints",
    description:
      "Tell AI your capacity and focus. Get a suggested sprint plan that matches your priorities and story points.",
  },
  {
    icon: Bot,
    title: "Summarize progress",
    description:
      "Complete a sprint and let AI generate a summary of what shipped, what didn't, and key insights for next time.",
  },
];

export function AICapabilities() {
  return (
    <section
      id="ai-features"
      className="landing-section scroll-mt-20 border-t border-border bg-surface px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-indigo-subtle px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-brand-indigo">
              <Sparkles className="h-3.5 w-3.5" />
              AI Assistant
            </div>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              AI that helps, not decides
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Use AI to draft todos, shape sprints, and reflect on progress.
              Every suggestion is reviewed before it's saved. You stay in
              control.
            </p>

            <div className="mt-10 space-y-6">
              {capabilities.map((capability) => {
                const Icon = capability.icon;
                return (
                  <div key={capability.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
                      <Icon
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold">
                        {capability.title}
                      </h3>
                      <p className="mt-1 leading-relaxed text-muted-foreground">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl border border-accent-amber/30 bg-accent-amber-subtle p-4">
              <p className="text-sm font-semibold leading-relaxed text-foreground">
                <span className="font-extrabold text-accent-amber">
                  AI suggestions
                </span>{" "}
                are drafts, not decisions. You review, edit, and approve before
                anything is saved.
              </p>
            </div>
          </div>

          {/* AI Chat Preview */}
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-indigo-subtle">
                  <Bot className="h-5 w-5 text-brand-indigo" />
                </div>
                <span className="font-extrabold">AI Assistant</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-subtle px-2.5 py-1 text-xs font-extrabold text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Ready
              </span>
            </div>

            <div className="space-y-4">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3">
                  <p className="text-sm font-semibold text-primary-foreground">
                    Generate 5 todos for implementing user authentication
                  </p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3">
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Here are 5 todos for user authentication:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">1.</span>
                      <span>Set up authentication API endpoints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">2.</span>
                      <span>Create login form with validation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">3.</span>
                      <span>Implement JWT token management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">4.</span>
                      <span>Add password reset flow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">5.</span>
                      <span>Write authentication tests</span>
                    </li>
                  </ul>
                  <button className="mt-3 text-xs font-bold text-primary hover:underline">
                    Add to backlog →
                  </button>
                </div>
              </div>

              {/* Input Preview */}
              <div className="mt-4 rounded-lg border border-border bg-surface-hover p-3">
                <p className="text-sm text-muted-foreground">
                  Ask me anything about your project...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
