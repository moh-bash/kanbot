import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import kanbotIcon from "../../../assets/logo/kanbot-icon.png";

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const ctx = gsap.context(() => {
      if (mobileMenuOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { x: "100%" },
          { x: 0, duration: 0.3, ease: "power2.out" },
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          x: "100%",
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }, mobileMenuRef);

    return () => ctx.revert();
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="sticky top-0 z-40 border-b border-border bg-background"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="Kanbot home"
          >
            <img src={kanbotIcon} alt="" className="h-8 w-8" />
            <span className="text-xl font-extrabold tracking-tight text-brand-indigo">
              kanbot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollToSection("workflow")}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection("ai-features")}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              AI capabilities
            </button>
            <button
              onClick={() => scrollToSection("productivity")}
              className="text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              Features
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-surface-hover md:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Get started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex rounded-lg p-2 text-foreground hover:bg-surface-hover md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/90 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            ref={mobileMenuRef}
            className="fixed right-0 top-[73px] z-50 h-[calc(100vh-73px)] w-full max-w-sm border-l border-border bg-surface p-6 shadow-sm md:hidden"
          >
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("workflow")}
                className="rounded-lg px-4 py-3 text-left text-base font-semibold text-foreground hover:bg-background"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection("ai-features")}
                className="rounded-lg px-4 py-3 text-left text-base font-semibold text-foreground hover:bg-background"
              >
                AI capabilities
              </button>
              <button
                onClick={() => scrollToSection("productivity")}
                className="rounded-lg px-4 py-3 text-left text-base font-semibold text-foreground hover:bg-background"
              >
                Features
              </button>
              <div className="my-4 border-t border-border" />
              <Link
                to="/login"
                className="rounded-lg px-4 py-3 text-center text-base font-bold text-foreground hover:bg-background"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary px-4 py-3 text-center text-base font-extrabold text-primary-foreground hover:bg-primary-hover"
              >
                Get started
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
