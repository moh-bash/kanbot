import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTodo,
  getTodo,
  listTodos,
  moveTodo,
  updateTodo,
} from "../api/todos";
import { listSprints } from "../api/sprints";
import type {
  CreateTodoRequest,
  MoveTodoRequest,
  Todo,
  TodoListQuery,
  UpdateTodoRequest,
} from "../types/api";
import { useToastStore } from "../components/toast-store";
import { ApiError } from "../api/client";
import { useTodoDeleter } from "./useTodoDeleter";

export const backlogQueryKey = (projectId: string, query: TodoListQuery = {}) =>
  ["todos", projectId, "backlog", query] as const;

export function useBacklog(projectId: string, query: TodoListQuery) {
  return useQuery({
    queryKey: backlogQueryKey(projectId, query),
    queryFn: () => listTodos(projectId, { sprintId: "backlog", ...query }),
  });
}

export function useProjectSprints(projectId: string) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => listSprints(projectId),
  });
}

export function useCreateTodo(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTodoRequest) => createTodo(projectId, body),
    onSuccess: (response) => {
      if (response?.todo) {
        queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      }
    },
  });
}

export function useUpdateTodo(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      todoId,
      body,
    }: {
      todoId: string;
      body: UpdateTodoRequest;
    }) => updateTodo(todoId, body),
    onSuccess: (response, variables) => {
      if (response?.todo) {
        queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["todo", variables.todoId] });
      }
    },
  });
}

export function useDeleteTodo(projectId: string) {
  const deleter = useTodoDeleter();
  
  return {
    mutate: ({ todo }: { todoId: string; todo: Todo }) => {
      deleter.deleteWithUndo(projectId, todo);
    },
    mutateAsync: async ({ todo }: { todoId: string; todo: Todo }) => {
      deleter.deleteWithUndo(projectId, todo);
    },
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: () => {},
  };
}

export function useMoveTodo(projectId: string, query: TodoListQuery) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const addUndoToast = useToastStore((state) => state.addUndoToast);
  return useMutation({
    mutationFn: ({
      todoId,
      body,
    }: {
      todoId: string;
      body: MoveTodoRequest;
      previousTodo: Todo;
    }) => moveTodo(todoId, body),
    onMutate: async ({ todoId, body }) => {
      const key = backlogQueryKey(projectId, query);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<{ todos: Todo[] }>(key);
      if (
        previous &&
        body.sprintId === undefined &&
        body.status === undefined
      ) {
        const todos = [...previous.todos];
        const index = todos.findIndex((todo) => todo.id === todoId);
        if (index < 0) return { previous };
        const [todo] = todos.splice(index, 1);
        todos.splice(
          Math.max(0, Math.min(body.position, todos.length)),
          0,
          todo,
        );
        queryClient.setQueryData(key, {
          todos: todos.map((item, order) => ({ ...item, order })),
        });
      }
      return { previous };
    },
    onSuccess: (response, variables) => {
      const movedTodo = response?.todo;
      if (!movedTodo) return;
      addUndoToast("Todo moved", async () => {
        const todoResponse = await getTodo(variables.todoId);
        if (!todoResponse?.todo) {
          throw new Error("Todo not found.");
        }
        const current = todoResponse.todo;
        if (
          current.sprintId !== movedTodo.sprintId ||
          current.status !== movedTodo.status ||
          current.order !== movedTodo.order
        ) {
          throw new Error("This todo changed after it was moved.");
        }
        await moveTodo(variables.todoId, {
          sprintId: variables.previousTodo.sprintId,
          status: variables.previousTodo.status,
          position: variables.previousTodo.order,
        });
        queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
        queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
        queryClient.invalidateQueries({ queryKey: ["board"] });
        queryClient.invalidateQueries({ queryKey: ["sprint"] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          backlogQueryKey(projectId, query),
          context.previous,
        );
      }
      addToast(
        _error instanceof ApiError
          ? _error.message
          : "Could not move this todo. Your changes were rolled back.",
        "error",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["sprint"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
