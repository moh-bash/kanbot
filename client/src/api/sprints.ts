import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintBoardResponse,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from '../types/api'
import { request } from './client'

export function listSprints(projectId: string) {
  return request<SprintListResponse>('GET', `/projects/${projectId}/sprints`)
}

export function createSprint(projectId: string, body: CreateSprintRequest) {
  return request<{ sprint: Sprint }>('POST', `/projects/${projectId}/sprints`, body)
}

export function getSprint(sprintId: string) {
  return request<{ sprint: Sprint }>('GET', `/sprints/${sprintId}`)
}

export function getSprintBoard(sprintId: string) {
  return request<SprintBoardResponse>('GET', `/sprints/${sprintId}/todos`)
}

export function updateSprint(sprintId: string, body: UpdateSprintRequest) {
  return request<{ sprint: Sprint }>('PATCH', `/sprints/${sprintId}`, body)
}

export function deleteSprint(sprintId: string) {
  return request<void>('DELETE', `/sprints/${sprintId}`)
}

export function startSprint(sprintId: string, body: StartSprintRequest) {
  return request<{ sprint: Sprint }>('POST', `/sprints/${sprintId}/start`, body)
}

export function completeSprint(sprintId: string, body: CompleteSprintRequest) {
  return request<{ sprint: Sprint }>('POST', `/sprints/${sprintId}/complete`, body)
}
