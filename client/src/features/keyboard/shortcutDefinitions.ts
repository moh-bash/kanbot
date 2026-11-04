export interface KeyboardShortcut {
  id: string;
  key: string;
  label: string;
  description: string;
  sequence?: string[];
  action: () => void;
}

export interface ShortcutCategory {
  title: string;
  shortcuts: Omit<KeyboardShortcut, "action">[];
}

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "General",
    shortcuts: [
      {
        id: "command-palette",
        key: "Ctrl+K",
        label: "Command palette",
        description: "Open the command palette",
      },
      {
        id: "help",
        key: "?",
        label: "Keyboard shortcuts",
        description: "Show keyboard shortcuts help",
      },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      {
        id: "goto-board",
        key: "G → B",
        sequence: ["g", "b"],
        label: "Go to Board",
        description: "Navigate to the current project's board",
      },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      {
        id: "create-todo",
        key: "C",
        label: "Create todo",
        description: "Focus the quick-create todo input",
      },
      {
        id: "focus-search",
        key: "/",
        label: "Search",
        description: "Focus the backlog search input",
      },
    ],
  },
];
