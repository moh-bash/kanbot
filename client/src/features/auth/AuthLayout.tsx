import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import kanbotIcon from "../../assets/logo/kanbot-icon.png";
import { ThemeToggle } from "../../components/ThemeToggle";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  brandHeadline: string;
  brandSubtext: string;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
  brandHeadline,
  brandSubtext,
}: AuthLayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !layoutRef.current) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

      timeline
        .from(".auth-brand-panel", {
          x: -30,
          opacity: 0,
          duration: 0.7,
        })
        .from(
          ".auth-form-panel",
          {
            x: 30,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.5",
        );
    }, layoutRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={layoutRef}
      className="relative flex min-h-screen flex-col bg-background text-foreground lg:flex-row"
    >
      {/* Brand Panel - Desktop */}
      <div className="auth-brand-panel relative hidden w-full flex-col justify-between overflow-hidden bg-surface-elevated p-8 lg:flex lg:w-[45%] lg:p-12 xl:w-1/2 xl:p-16">
        {/* Header */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
            aria-label="Kanbot home"
          >
            <img src={kanbotIcon} alt="" className="h-10 w-10" />
            <span className="text-2xl font-extrabold tracking-tight">
              kanbot
            </span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight tracking-[-0.03em] text-foreground xl:text-5xl">
            {brandHeadline}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {brandSubtext}
          </p>

          {/* Product preview */}
          <div className="mt-10">
            <AuthProductPreview />
          </div>
        </div>

        {/* Footer accent */}
        <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>AI-powered planning assistant included</span>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel flex w-full flex-col lg:w-[55%] xl:w-1/2">
        {/* Mobile header */}
        <header className="flex items-center justify-between p-5 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label="Kanbot home"
          >
            <img src={kanbotIcon} alt="" className="h-8 w-8" />
            <span className="text-xl font-extrabold tracking-tight">
              kanbot
            </span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Desktop theme toggle */}
        <div className="hidden items-center justify-end p-8 lg:flex">
          <ThemeToggle />
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            {children}

            <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthProductPreview() {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !previewRef.current) return;

    const ctx = gsap.context(() => {
      // Subtle floating animation
      gsap.to(".preview-sprint-card", {
        y: -6,
        duration: 2.5,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Animate progress bar
      gsap.to(".preview-progress", {
        scaleX: 0.7,
        duration: 2,
        delay: 0.8,
        ease: "power2.out",
      });
    }, previewRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={previewRef}
      className="preview-sprint-card rounded-xl border border-border bg-surface p-5 shadow-xl"
    >
      {/* Sprint header */}
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sprint 3
          </p>
          <h3 className="mt-1.5 text-base font-extrabold leading-tight">
            Ship core features
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">5 days left</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-subtle px-2.5 py-1 text-xs font-bold text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Active
        </span>
      </div>

      {/* Mini board */}
      <div className="mt-4 space-y-2">
        {[
          { title: "Landing page redesign", status: "done" },
          { title: "Auth flow improvements", status: "progress" },
          { title: "API optimization", status: "todo" },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                item.status === "done"
                  ? "bg-secondary"
                  : item.status === "progress"
                    ? "bg-primary"
                    : "bg-border"
              }`}
            />
            <span className="text-xs font-semibold text-foreground">
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">12 of 18 points</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div className="preview-progress h-full origin-left scale-x-0 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
