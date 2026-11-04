import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LandingNav } from "./components/LandingNav";
import { HeroSection } from "./components/HeroSection";
import { ValueProposition } from "./components/ValueProposition";
import { CoreWorkflow } from "./components/CoreWorkflow";
import { BacklogShowcase } from "./components/BacklogShowcase";
import { BoardShowcase } from "./components/BoardShowcase";
import { AICapabilities } from "./components/AICapabilities";
import { ProductivitySection } from "./components/ProductivitySection";
import { FinalCTA } from "./components/FinalCTA";
import { LandingFooter } from "./components/LandingFooter";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !mainRef.current) return;

    const ctx = gsap.context(() => {
      // Animate sections on scroll
      const sections = gsap.utils.toArray<HTMLElement>(".landing-section");
      sections.forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });

        gsap.from(section.querySelectorAll(".landing-card"), {
          opacity: 0,
          y: 18,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        });
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={mainRef}
      className="min-h-screen overflow-hidden bg-background text-foreground"
    >
      <LandingNav />
      <HeroSection />
      <ValueProposition />
      <CoreWorkflow />
      <BacklogShowcase />
      <BoardShowcase />
      <AICapabilities />
      <ProductivitySection />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
