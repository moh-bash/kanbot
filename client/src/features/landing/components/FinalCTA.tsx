import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="landing-section border-t border-border px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-4 py-2 text-sm font-extrabold text-primary">
          <Sparkles className="h-4 w-4" />
          Free to start. No credit card required.
        </div>

        <h2 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Turn your plans into progress
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Bring your work into focus and let Kanbot help you move forward. Start
          organizing your backlog, planning sprints, and shipping with
          confidence.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-extrabold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:shadow-md sm:w-auto"
          >
            Start building for free
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            to="/login"
            className="inline-flex h-14 w-full items-center justify-center rounded-lg border-2 border-border bg-surface px-8 text-base font-bold text-foreground transition-colors hover:border-primary hover:bg-surface-elevated sm:w-auto"
          >
            I already have an account
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Join developers, freelancers, and students who are already planning
          smarter with Kanbot.
        </p>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-border pt-12">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-foreground">
              AI-Powered
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Smart planning
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-foreground">
              Free Start
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              No card needed
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-2xl font-extrabold text-foreground">
              Fast Setup
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Ready in minutes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
