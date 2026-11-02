import type { SprintListResponse } from '../types/api'
import { request } from './client'

export function listSprints(projectId: string) {
  return request<SprintListResponse>('GET', `/projects/${projectId}/sprints`)
}
