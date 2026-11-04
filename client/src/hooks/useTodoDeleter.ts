import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteTodo } from "../api/todos";
import { useToastStore } from "../components/toast-store";
import type { Todo, SprintBoardResponse, TodoStatus } from "../types/api";

interface PendingDeletion {
  id: string;
  projectId: string;
  todo: Todo;
  timeoutId: number;
  toastId: number;
  state: "pending" | "cancelled" | "committing" | "committed" | "failed";
  cacheSnapshots: Map<string, unknown>;
}

/**
 * Frontend-only delayed deletion with undo.
 * 
 * When delete is initiated:
 * 1. Todo is removed from UI immediately (optimistic)
 * 2. No DELETE request is sent
 * 3. Undo toast appears with 5 second timeout
 * 4. If user clicks Undo: restore from cache, cancel timeout
 * 5. If timeout expires: send DELETE request to backend
 */
export function useTodoDeleter() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const pendingDeletionsRef = useRef<Map<string, PendingDeletion>>(new Map());

  const deleteWithUndo = (projectId: string, todo: Todo) => {
    // Generate unique operation ID
    // eslint-disable-next-line react-hooks/purity -- This is an event handler, not render code
    const timestamp = Date.now();
    const operationId = `${todo.id}-${timestamp}`;
    
    // Cancel any existing deletion for this todo
    const existing = Array.from(pendingDeletionsRef.current.values()).find(
      (op) => op.todo.id === todo.id
    );
    if (existing) {
      cancelDeletion(existing.id);
    }

    // Capture cache snapshots before removal
    const cacheSnapshots = new Map<string, unknown>();
    
    // Capture todos list cache
    const todosQueries = queryClient.getQueriesData<{ todos: Todo[] }>({
      queryKey: ["todos", projectId],
    });
    todosQueries.forEach(([queryKey, data]) => {
      if (data) {
        cacheSnapshots.set(JSON.stringify(queryKey), data);
      }
    });

    // Capture board cache if this todo is in a sprint
    if (todo.sprintId) {
      const boardData = queryClient.getQueryData(["board", todo.sprintId]);
      if (boardData) {
        cacheSnapshots.set(
          JSON.stringify(["board", todo.sprintId]),
          boardData
        );
      }
    }

    // Optimistically remove from cache
    queryClient.setQueriesData<{ todos: Todo[] }>(
      { queryKey: ["todos", projectId] },
      (current) => {
        if (!current) return current;
        return {
          todos: current.todos.filter((t) => t.id !== todo.id),
        };
      }
    );

    // Remove from board cache if in sprint
    if (todo.sprintId) {
      queryClient.setQueriesData<SprintBoardResponse>(
        { queryKey: ["board", todo.sprintId] },
        (current) => {
          if (!current || !current.columns) return current;
          const newColumns: Record<TodoStatus, Todo[]> = {
            todo: [],
            in_progress: [],
            in_review: [],
            done: [],
          };
          for (const [status, todos] of Object.entries(current.columns)) {
            if (Array.isArray(todos)) {
              newColumns[status as TodoStatus] = todos.filter((t) => t.id !== todo.id);
            }
          }
          return {
            ...current,
            columns: newColumns,
          };
        }
      );
    }

    // Create undo toast with custom ID
    const toastId = timestamp + 1;
    let toastRemoved = false;

    const undoCallback = async () => {
      const operation = pendingDeletionsRef.current.get(operationId);
      if (!operation || operation.state !== "pending") {
        throw new Error("This deletion can no longer be undone");
      }

      // Cancel the deletion
      cancelDeletion(operationId);
      toastRemoved = true;
    };

    // Add toast manually using the store's method
    const toastStore = useToastStore.getState();
    toastStore.toasts.push({
      id: toastId,
      message: "Todo deleted",
      tone: "success",
      undo: undoCallback,
    });
    useToastStore.setState({ toasts: [...toastStore.toasts] });

    // Set timeout for actual deletion
    const timeoutId = window.setTimeout(() => {
      void commitDeletion(operationId);
    }, 5000);

    // Auto-remove toast after 5 seconds if not already removed
    window.setTimeout(() => {
      if (!toastRemoved) {
        useToastStore.setState((state) => ({
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }));
      }
    }, 5000);

    // Store pending operation
    pendingDeletionsRef.current.set(operationId, {
      id: operationId,
      projectId,
      todo,
      timeoutId,
      toastId,
      state: "pending",
      cacheSnapshots,
    });
  };

  const cancelDeletion = (operationId: string) => {
    const operation = pendingDeletionsRef.current.get(operationId);
    if (!operation || operation.state !== "pending") {
      return;
    }

    // Clear the timeout
    window.clearTimeout(operation.timeoutId);

    // Mark as cancelled
    operation.state = "cancelled";

    // Restore cache snapshots
    operation.cacheSnapshots.forEach((data, key) => {
      const queryKey = JSON.parse(key) as unknown[];
      queryClient.setQueryData(queryKey, data);
    });

    // Remove toast
    useToastStore.setState((state) => ({
      toasts: state.toasts.filter((t) => t.id !== operation.toastId),
    }));

    // Clean up
    pendingDeletionsRef.current.delete(operationId);
  };

  const commitDeletion = async (operationId: string) => {
    const operation = pendingDeletionsRef.current.get(operationId);
    if (!operation || operation.state !== "pending") {
      return;
    }

    // Transition to committing state (prevents undo from succeeding)
    operation.state = "committing";

    try {
      // Send DELETE request to backend
      await deleteTodo(operation.todo.id);

      // Mark as committed
      operation.state = "committed";

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["todos", operation.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", operation.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["sprints", operation.projectId] });
      
      if (operation.todo.sprintId) {
        queryClient.invalidateQueries({
          queryKey: ["board", operation.todo.sprintId],
        });
        queryClient.invalidateQueries({
          queryKey: ["sprint", operation.todo.sprintId],
        });
      }

      // Clean up
      pendingDeletionsRef.current.delete(operationId);
    } catch (error) {
      // Mark as failed
      operation.state = "failed";

      // Restore from snapshots
      operation.cacheSnapshots.forEach((data, key) => {
        const queryKey = JSON.parse(key) as unknown[];
        queryClient.setQueryData(queryKey, data);
      });

      // Show error toast
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to delete todo. It has been restored.",
        "error"
      );

      // Clean up
      pendingDeletionsRef.current.delete(operationId);
    }
  };

  return {
    deleteWithUndo,
  };
}
