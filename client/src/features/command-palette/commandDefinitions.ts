import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  ListChecks,
  LayoutDashboard,
  Rows3,
  UserRound,
  Plus,
  Keyboard,
} from "lucide-react";

export interface Command {
  type: "command";
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  shortcut?: string;
  keywords?: readonly string[];
  requiresProject?: boolean;
}

export const COMMAND_DEFINITIONS = {
  navigation: [
    {
      type: "command" as const,
      id: "goto-projects",
      label: "Go to Projects",
      description: "View all projects",
      icon: FolderKanban,
      keywords: ["projects", "list", "home"] as const,
    },
    {
      type: "command" as const,
      id: "goto-backlog",
      label: "Go to Backlog",
      description: "View current project backlog",
      icon: ListChecks,
      keywords: ["backlog", "todos", "tasks"] as const,
      requiresProject: true,
    },
    {
      type: "command" as const,
      id: "goto-board",
      label: "Go to Board",
      description: "View current project board",
      icon: LayoutDashboard,
      shortcut: "G → B",
      keywords: ["board", "kanban", "sprint"] as const,
      requiresProject: true,
    },
    {
      type: "command" as const,
      id: "goto-sprints",
      label: "Go to Sprints",
      description: "View sprint history",
      icon: Rows3,
      keywords: ["sprints", "history"] as const,
      requiresProject: true,
    },
    {
      type: "command" as const,
      id: "goto-profile",
      label: "Go to Profile",
      description: "View your profile",
      icon: UserRound,
      keywords: ["profile", "account", "settings"] as const,
    },
  ] satisfies Command[],
  actions: [
    {
      type: "command" as const,
      id: "create-todo",
      label: "Create todo",
      description: "Create a new todo",
      icon: Plus,
      shortcut: "C",
      keywords: ["create", "new", "todo", "task"] as const,
    },
    {
      type: "command" as const,
      id: "create-project",
      label: "Create project",
      description: "Create a new project",
      icon: FolderKanban,
      keywords: ["create", "new", "project"] as const,
    },
    {
      type: "command" as const,
      id: "show-shortcuts",
      label: "Keyboard shortcuts",
      description: "View all keyboard shortcuts",
      icon: Keyboard,
      shortcut: "?",
      keywords: ["shortcuts", "keyboard", "help"] as const,
    },
  ] satisfies Command[],
} as const;
