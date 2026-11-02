import type {
  CreateProjectRequest,
  ProjectWithStats,
  UpdateProjectRequest,
} from '../types/api'
import { request } from './client'

export interface ProjectsResponse {
  projects: ProjectWithStats[]
}

export interface ProjectResponse {
  project: ProjectWithStats
}

export function listProjects() {
  return request<ProjectsResponse>('GET', '/projects')
}

export function getProject(projectId: string) {
  return request<ProjectResponse>('GET', `/projects/${projectId}`)
}

export function createProject(body: CreateProjectRequest) {
  return request<ProjectResponse>('POST', '/projects', body)
}

export function updateProject(projectId: string, body: UpdateProjectRequest) {
  return request<ProjectResponse>('PATCH', `/projects/${projectId}`, body)
}

export function deleteProject(projectId: string) {
  return request<void>('DELETE', `/projects/${projectId}`)
}
