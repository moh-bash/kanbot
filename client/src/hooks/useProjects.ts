import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../api/projects";
import type {
  CreateProjectRequest,
  ProjectWithStats,
  UpdateProjectRequest,
} from "../types/api";

export const projectsQueryKey = ["projects"] as const;
type ProjectsCache = { projects: ProjectWithStats[] };

export function useProjects() {
  return useQuery({ queryKey: projectsQueryKey, queryFn: listProjects });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId as string),
    enabled: Boolean(projectId),
    placeholderData: undefined,
    retry: (failureCount, error) => {
      if (error instanceof Error && "status" in error && error.status === 404)
        return false;
      return failureCount < 2;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProjectRequest) => createProject(body),
    onSuccess: (response) => {
      if (response?.project) {
        queryClient.setQueryData<ProjectsCache>(
          projectsQueryKey,
          (current) => ({
            projects: current
              ? [...current.projects, response.project]
              : [response.project],
          }),
        );
      }
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      body,
    }: {
      projectId: string;
      body: UpdateProjectRequest;
    }) => updateProject(projectId, body),
    onSuccess: (response, variables) => {
      if (response?.project) {
        queryClient.setQueryData(["project", variables.projectId], response);
        queryClient.setQueryData<ProjectsCache>(
          projectsQueryKey,
          (current) => ({
            projects: current?.projects.map((project) =>
              project.id === variables.projectId ? response.project : project,
            ) ?? [response.project],
          }),
        );
      }
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: (_response, projectId) => {
      queryClient.setQueryData<ProjectsCache>(projectsQueryKey, (current) => ({
        projects:
          current?.projects.filter((project) => project.id !== projectId) ?? [],
      }));
      queryClient.removeQueries({ queryKey: ["project", projectId] });
    },
  });
}
