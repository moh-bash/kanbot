import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  chatWithAI,
  generateSprintSummary,
  generateTodos,
  getAIStatus,
  planSprint,
} from "../api/ai";
import { bulkCreateTodos } from "../api/todos";
import type {
  BulkCreateTodosRequest,
  ChatRequest,
  CreateSprintRequest,
  GenerateTodosRequest,
  PlanSprintRequest,
} from "../types/api";
import { createSprint } from "../api/sprints";
import { boardKey, sprintKey } from "./useSprints";

export const aiStatusKey = ["ai", "status"] as const;
export function useAIStatus() {
  return useQuery({
    queryKey: aiStatusKey,
    queryFn: getAIStatus,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
export function useAIChat(projectId: string) {
  return useMutation({
    mutationFn: (body: ChatRequest) => chatWithAI(projectId, body),
  });
}
export function useGenerateTodos(projectId: string) {
  return useMutation({
    mutationFn: (body: GenerateTodosRequest) => generateTodos(projectId, body),
  });
}
export function useSaveGeneratedTodos(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BulkCreateTodosRequest) =>
      bulkCreateTodos(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
export function usePlanSprint(projectId: string) {
  return useMutation({
    mutationFn: (body: PlanSprintRequest) => planSprint(projectId, body),
  });
}
export function useCreateAISprint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSprintRequest) => createSprint(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
      queryClient.invalidateQueries({ queryKey: ["todos", projectId] });
    },
  });
}
export function useGenerateSprintSummary(sprintId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateSprintSummary(sprintId),
    onSuccess: (response) => {
      queryClient.setQueryData(sprintKey(sprintId), {
        sprint: response.sprint,
      });
      queryClient.invalidateQueries({
        queryKey: ["sprints", response.sprint.projectId],
      });
      queryClient.invalidateQueries({ queryKey: boardKey(sprintId) });
    },
  });
}
