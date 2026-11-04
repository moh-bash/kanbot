import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeSprint,
  createSprint,
  deleteSprint,
  getSprint,
  getSprintBoard,
  listSprints,
  startSprint,
  updateSprint,
} from "../api/sprints";
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  MoveTodoRequest,
  SprintBoardResponse,
  StartSprintRequest,
  TodoStatus,
  UpdateSprintRequest,
} from "../types/api";
import { getTodo, moveTodo } from "../api/todos";
import { useToastStore } from "../components/toast-store";

export const sprintListKey = (projectId: string) =>
  ["sprints", projectId] as const;
export const sprintKey = (sprintId: string) => ["sprint", sprintId] as const;
export const boardKey = (sprintId: string) => ["board", sprintId] as const;

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: sprintListKey(projectId),
    queryFn: () => listSprints(projectId),
    enabled: Boolean(projectId),
  });
}

export function useSprint(sprintId: string) {
  return useQuery({
    queryKey: sprintKey(sprintId),
    queryFn: () => getSprint(sprintId),
    enabled: Boolean(sprintId),
  });
}

export function useSprintBoard(sprintId: string) {
  return useQuery({
    queryKey: boardKey(sprintId),
    queryFn: () => getSprintBoard(sprintId),
    enabled: Boolean(sprintId),
  });
}

function invalidateProject(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  queryClient.invalidateQueries({ queryKey: sprintListKey(projectId) });
  queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
  queryClient.invalidateQueries({ queryKey: ["project", projectId] });
}

export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSprintRequest) => createSprint(projectId, body),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useUpdateSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sprintId,
      body,
    }: {
      sprintId: string;
      body: UpdateSprintRequest;
    }) => updateSprint(sprintId, body),
    onSuccess: (response) => {
      if (response?.sprint)
        queryClient.setQueryData(sprintKey(response.sprint.id), response);
      invalidateProject(queryClient, projectId);
    },
  });
}

export function useDeleteSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) => deleteSprint(sprintId),
    onSuccess: () => invalidateProject(queryClient, projectId),
  });
}

export function useStartSprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sprintId,
      body,
    }: {
      sprintId: string;
      body: StartSprintRequest;
    }) => startSprint(sprintId, body),
    onSuccess: (response) => {
      if (response?.sprint)
        queryClient.setQueryData(sprintKey(response.sprint.id), response);
      invalidateProject(queryClient, projectId);
    },
  });
}

export function useCompleteSprint(projectId: string) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  return useMutation({
    mutationFn: ({
      sprintId,
      body,
    }: {
      sprintId: string;
      body: CompleteSprintRequest;
    }) => completeSprint(sprintId, body),
    onSuccess: (response) => {
      if (response?.sprint)
        queryClient.setQueryData(sprintKey(response.sprint.id), response);
      invalidateProject(queryClient, projectId);
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
    onError: () =>
      addToast("Could not complete the sprint. Please try again.", "error"),
  });
}

export function useMoveBoardTodo(sprintId: string) {
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
      previousTodo: import("../types/api").Todo;
    }) => moveTodo(todoId, body),
    onMutate: async ({ todoId, body }) => {
      const key = boardKey(sprintId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SprintBoardResponse>(key);
      if (previous && body.status) {
        const columns = Object.fromEntries(
          Object.entries(previous.columns).map(([status, todos]) => [
            status,
            todos.filter((todo) => todo.id !== todoId),
          ]),
        ) as Record<
          TodoStatus,
          SprintBoardResponse["columns"][TodoStatus][number][]
        >;
        const moved = Object.values(previous.columns)
          .flat()
          .find((todo) => todo.id === todoId);
        if (moved) {
          const destination = columns[body.status];
          columns[body.status] = [
            ...destination.slice(0, body.position),
            { ...moved, status: body.status },
            ...destination.slice(body.position),
          ];
          queryClient.setQueryData(key, { ...previous, columns });
        }
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
        queryClient.invalidateQueries({ queryKey: boardKey(sprintId) });
        queryClient.invalidateQueries({
          queryKey: ["todos", variables.previousTodo.projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["sprints", variables.previousTodo.projectId],
        });
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous)
        queryClient.setQueryData(boardKey(sprintId), context.previous);
      addToast(
        "Could not move this todo. Your changes were rolled back.",
        "error",
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: boardKey(sprintId) }),
  });
}
