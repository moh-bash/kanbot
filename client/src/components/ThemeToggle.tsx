import { Laptop, Moon, Sun } from "lucide-react";
import { type ThemePreference } from "../theme/ThemeProvider";
import { useTheme } from "../theme/useTheme";

const preferences: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "Use system theme", icon: Laptop },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1"
      aria-label="Theme preference"
    >
      {preferences.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={preference === value}
          onClick={() => setPreference(value)}
          className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-extrabold transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface ${
            preference === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label.replace(" theme", "")}</span>
        </button>
      ))}
    </div>
  );
}
