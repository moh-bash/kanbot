import { KeyRound, LogOut, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../../theme/useTheme";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { preference, setPreference } = useTheme();
  const initials = user?.name.slice(0, 1).toUpperCase() ?? "?";

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:py-12">
      <header className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Profile &amp; Settings
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Manage your account and application preferences.
        </p>
      </header>

      <div className="mt-8 space-y-5">
        <SettingsSection
          title="Profile information"
          description="Your account details are managed by Kanbot."
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-foreground">
                {user?.name}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Choose how Kanbot looks for you. Changes apply immediately."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ThemeOption
              selected={preference === "light"}
              icon={<Sun />}
              title="Light"
              description="A bright, focused workspace."
              onClick={() => setPreference("light")}
            />
            <ThemeOption
              selected={preference === "dark"}
              icon={<Moon />}
              title="Dark"
              description="Easy on the eyes in low light."
              onClick={() => setPreference("dark")}
            />
          </div>
          {preference === "system" && (
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              Your theme is currently following your device. Choose Light or
              Dark to set a preference.
            </p>
          )}
        </SettingsSection>

        <SettingsSection
          title="Account actions"
          description="Manage your active Kanbot session."
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-foreground">
                  Log out of Kanbot
                </p>
                <p className="text-sm text-muted-foreground">
                  You can sign back in at any time.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 text-sm font-extrabold text-destructive hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/15"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-base font-extrabold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function ThemeOption({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-ring ${selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-background"}`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold text-foreground">
          {title}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <span
        className={`ml-auto h-4 w-4 rounded-full border-2 ${selected ? "border-primary bg-primary ring-2 ring-primary/20" : "border-border"}`}
        aria-hidden="true"
      />
    </button>
  );
}
