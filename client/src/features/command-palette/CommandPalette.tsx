import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Search,
  X,
  ListChecks,
  Check,
  ChevronRight,
} from "lucide-react";
import { useProjects } from "../../hooks/useProjects";
import { useBacklog } from "../../hooks/useBacklog";
import type { Project, Todo } from "../../types/api";
import { COMMAND_DEFINITIONS, type Command } from "./commandDefinitions";

interface CommandPaletteProps {
  onClose: () => void;
  onCreateTodo?: () => void;
  onCreateProject?: () => void;
  onShowHelp?: () => void;
  onOpenTodo?: (todo: Todo) => void;
}

export function CommandPalette({
  onClose,
  onCreateTodo,
  onCreateProject,
  onShowHelp,
  onOpenTodo,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { projectId } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const projectsQuery = useProjects();
  const backlogQuery = useBacklog(
    projectId ?? "",
    query.trim() ? { search: query.trim() } : {},
  );

  // Memoize data to avoid unnecessary updates
  const projects = useMemo(() => projectsQuery.data?.projects ?? [], [projectsQuery.data?.projects]);
  const todos = useMemo(() => backlogQuery.data?.todos ?? [], [backlogQuery.data?.todos]);

  // Build filtered results
  const results = useMemo(() => {
    const searchTerm = query.toLowerCase().trim();
    const groups: Array<{ title: string; items: Array<Command | Project | Todo> }> = [];

    if (!searchTerm) {
      // Show default commands when no search
      groups.push({
        title: "Navigation",
        items: COMMAND_DEFINITIONS.navigation.filter(
          (cmd) => !(cmd as { requiresProject?: boolean }).requiresProject || projectId,
        ) as Command[],
      });
      groups.push({
        title: "Actions",
        items: COMMAND_DEFINITIONS.actions as unknown as Command[],
      });
      groups.push({
        title: "Projects",
        items: projects.slice(0, 5),
      });
    } else {
      // Filter commands
      const matchingNavigation = COMMAND_DEFINITIONS.navigation.filter(
        (cmd) => {
          const typedCmd = cmd as { requiresProject?: boolean; label: string; keywords?: readonly string[] };
          return (!typedCmd.requiresProject || projectId) &&
            (typedCmd.label.toLowerCase().includes(searchTerm) ||
              typedCmd.keywords?.some((k) => k.toLowerCase().includes(searchTerm)));
        }
      ) as Command[];
      const matchingActions = COMMAND_DEFINITIONS.actions.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(searchTerm) ||
          cmd.keywords?.some((k) => k.toLowerCase().includes(searchTerm)),
      ) as Command[];

      if (matchingNavigation.length > 0) {
        groups.push({ title: "Navigation", items: matchingNavigation });
      }
      if (matchingActions.length > 0) {
        groups.push({ title: "Actions", items: matchingActions });
      }

      // Filter projects
      const matchingProjects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.key.toLowerCase().includes(searchTerm),
      );
      if (matchingProjects.length > 0) {
        groups.push({ title: "Projects", items: matchingProjects });
      }

      // Filter todos (only if we have a query)
      if (searchTerm && (projectId || todos.length > 0)) {
        const matchingTodos = todos.filter(
          (t) =>
            t.title.toLowerCase().includes(searchTerm) ||
            t.key.toLowerCase().includes(searchTerm) ||
            t.description.toLowerCase().includes(searchTerm),
        );
        if (matchingTodos.length > 0) {
          groups.push({ title: "Todos", items: matchingTodos.slice(0, 10) });
        }
      }
    }

    return groups;
  }, [query, projects, todos, projectId]);

  // Calculate total items
  const totalItems = results.reduce((sum, group) => sum + group.items.length, 0);

  const executeCommand = useCallback((item: Command | Project | Todo) => {
    if ("type" in item && item.type === "command") {
      const command = item as Command;
      switch (command.id) {
        case "goto-projects":
          navigate("/projects");
          break;
        case "goto-backlog":
          if (projectId) navigate(`/projects/${projectId}/backlog`);
          break;
        case "goto-board":
          if (projectId) navigate(`/projects/${projectId}/board`);
          break;
        case "goto-sprints":
          if (projectId) navigate(`/projects/${projectId}/sprints`);
          break;
        case "goto-profile":
          navigate("/profile");
          break;
        case "create-todo":
          onCreateTodo?.();
          break;
        case "create-project":
          onCreateProject?.();
          break;
        case "show-shortcuts":
          onShowHelp?.();
          break;
      }
      onClose();
    } else if ("key" in item && "title" in item) {
      // It's a Todo
      const todo = item as Todo;
      onOpenTodo?.(todo);
      onClose();
    } else if ("name" in item && "key" in item) {
      // It's a Project
      const project = item as Project;
      navigate(`/projects/${project.id}/backlog`);
      onClose();
    }
  }, [navigate, projectId, onClose, onCreateTodo, onCreateProject, onShowHelp, onOpenTodo]);

  const executeSelectedCommand = useCallback(() => {
    let currentIndex = 0;
    for (const group of results) {
      for (const item of group.items) {
        if (currentIndex === selectedIndex) {
          executeCommand(item);
          return;
        }
        currentIndex++;
      }
    }
  }, [results, selectedIndex, executeCommand]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Handle arrow keys and enter
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(totalItems - 1, 0) : prev - 1,
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        executeSelectedCommand();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalItems, executeSelectedCommand]);

  // Reset selected index when results change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-4 pt-[15vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search
            className="h-5 w-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, todos, or type a command..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-border bg-background px-2 py-1 text-xs font-bold text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-palette-results"
          className="max-h-[60vh] overflow-y-auto"
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                No results found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching for projects, todos, or commands
              </p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((group, groupIndex) => {
                let groupStartIndex = 0;
                for (let i = 0; i < groupIndex; i++) {
                  groupStartIndex += results[i].items.length;
                }

                return (
                  <div key={group.title} className="mb-4 last:mb-0">
                    <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item, itemIndex) => {
                        const absoluteIndex = groupStartIndex + itemIndex;
                        return (
                          <CommandItem
                            key={getItemKey(item)}
                            item={item}
                            selected={absoluteIndex === selectedIndex}
                            currentProjectId={projectId}
                            onClick={() => executeCommand(item)}
                            dataIndex={absoluteIndex}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-background px-4 py-2.5">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-surface px-1.5 text-[10px] font-bold">
                ↑
              </kbd>
              <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-surface px-1.5 text-[10px] font-bold">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-surface px-1.5 text-[10px] font-bold">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommandItemProps {
  item: Command | Project | Todo;
  selected: boolean;
  currentProjectId?: string;
  onClick: () => void;
  dataIndex: number;
}

function CommandItem({
  item,
  selected,
  currentProjectId,
  onClick,
  dataIndex,
}: CommandItemProps) {
  if ("type" in item && item.type === "command") {
    const command = item as Command;
    return (
      <button
        type="button"
        onClick={onClick}
        data-index={dataIndex}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          selected
            ? "bg-primary-subtle text-primary"
            : "text-foreground hover:bg-surface-hover"
        }`}
        role="option"
        aria-selected={selected}
      >
        {command.icon && <command.icon className="h-5 w-5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{command.label}</p>
          {command.description && (
            <p className="truncate text-xs text-muted-foreground">
              {command.description}
            </p>
          )}
        </div>
        {command.shortcut && (
          <kbd className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {command.shortcut}
          </kbd>
        )}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  if ("title" in item && "key" in item && "projectId" in item) {
    const todo = item as Todo;
    return (
      <button
        type="button"
        onClick={onClick}
        data-index={dataIndex}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
          selected
            ? "bg-primary-subtle text-primary"
            : "text-foreground hover:bg-surface-hover"
        }`}
        role="option"
        aria-selected={selected}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <ListChecks className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-primary">
              {todo.key}
            </span>
            <span className="min-w-0 truncate text-sm font-bold">
              {todo.title}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {todo.status.replace("_", " ")} · {todo.priority}
            {todo.storyPoints && ` · ${todo.storyPoints} pts`}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  const project = item as Project;
  const isCurrentProject = project.id === currentProjectId;
  const projectStats = (project as unknown as { stats?: { backlogCount?: number } }).stats;

  return (
    <button
      type="button"
      onClick={onClick}
      data-index={dataIndex}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        selected
          ? "bg-primary-subtle text-primary"
          : "text-foreground hover:bg-surface-hover"
      }`}
      role="option"
      aria-selected={selected}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-indigo-subtle text-xs font-bold text-brand-indigo">
        {project.key.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{project.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {project.key}
          {projectStats?.backlogCount !== undefined &&
            ` · ${projectStats.backlogCount} in backlog`}
        </p>
      </div>
      {isCurrentProject && (
        <Check className="h-4 w-4 shrink-0 text-primary" aria-label="Current project" />
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function getItemKey(item: Command | Project | Todo): string {
  if ("type" in item && item.type === "command") {
    return `command-${(item as Command).id}`;
  }
  if ("title" in item && "key" in item && "projectId" in item) {
    return `todo-${(item as Todo).id}`;
  }
  return `project-${(item as Project).id}`;
}
