import { Link } from "react-router";
import kanbotIcon from "../../../assets/logo/kanbot-icon.png";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={kanbotIcon} alt="" className="h-8 w-8" />
              <span className="text-xl font-extrabold tracking-tight text-brand-indigo">
                kanbot
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your sprint board with an AI teammate. Plan smarter, ship faster,
              and build better with focused workflows and intelligent
              assistance.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Kanbot. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("workflow")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  How it works
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("ai-features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  AI capabilities
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    document
                      .getElementById("productivity")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </button>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
              Get Started
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/register"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            Plan clearly. Ship calmly. Build confidently.
          </p>
        </div>
      </div>
    </footer>
  );
}
