import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      timeline
        .from(".hero-headline", {
          y: 30,
          opacity: 0,
          duration: 0.8,
        })
        .from(
          ".hero-subtext",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4",
        )
        .from(
          ".hero-cta",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3",
        )
        .from(
          ".hero-preview",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20"
    >
      {/* Content */}
      <div className="relative z-10">
        <h1 className="hero-headline max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
          Plan smarter. Ship faster. Build better with AI.
        </h1>
        <p className="hero-subtext mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Bring your backlog, sprints, team workflow, and AI assistance together
          in one focused workspace.
        </p>
        <div className="hero-cta mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-extrabold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-md"
          >
            Start building
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            onClick={() =>
              document
                .getElementById("workflow")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 text-base font-bold text-foreground transition-colors hover:border-primary hover:bg-surface-elevated"
          >
            Explore the workflow
          </button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Free to start. No credit card required.
        </p>
      </div>

      {/* Product Preview */}
      <div className="hero-preview relative">
        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !previewRef.current) return;

    const ctx = gsap.context(() => {
      // Subtle floating animation for cards
      gsap.to(".preview-card", {
        y: -8,
        duration: 2.5,
        ease: "power1.inOut",
        stagger: 0.3,
        repeat: -1,
        yoyo: true,
      });

      // Animate progress bar
      gsap.to(".preview-progress-bar", {
        scaleX: 0.62,
        duration: 2,
        delay: 1,
        ease: "power2.out",
      });
    }, previewRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={previewRef}
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      {/* Sprint Header */}
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Active Sprint
          </p>
          <h3 className="mt-1.5 text-lg font-extrabold">
            Sprint 4 — Ship core features
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Oct 20 – Nov 3 · 2 days left
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-subtle px-3 py-1 text-xs font-extrabold text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          In progress
        </span>
      </div>

      {/* Board Columns */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PreviewColumn
          title="To Do"
          count={3}
          items={["Auth flow", "API integration"]}
        />
        <PreviewColumn
          title="In Progress"
          count={2}
          items={["Landing page", "AI assistant"]}
          active
        />
        <PreviewColumn
          title="Done"
          count={5}
          items={["Design system", "Project setup"]}
          done
        />
      </div>

      {/* Sprint Progress */}
      <div className="mt-5 space-y-2.5 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">8 of 13 story points</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="preview-progress-bar h-full origin-left scale-x-0 rounded-full bg-primary"
            style={{ transformOrigin: "left" }}
          />
        </div>
        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>AI teammate ready</span>
        </div>
      </div>
    </div>
  );
}

function PreviewColumn({
  title,
  count,
  items,
  active = false,
  done = false,
}: {
  title: string;
  count: number;
  items: string[];
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div
      className={`min-h-32 rounded-lg bg-background p-3 ${
        active ? "ring-2 ring-primary/40" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wide text-foreground">
          {title}
        </span>
        <span className="text-xs font-bold text-muted-foreground">{count}</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="preview-card flex items-start gap-2 rounded-lg border border-border bg-surface p-2.5"
          >
            <span
              className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${
                done
                  ? "border-secondary bg-secondary"
                  : active
                    ? "border-primary bg-primary"
                    : "border-border"
              }`}
            />
            <span className="text-xs font-bold leading-snug text-foreground">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
