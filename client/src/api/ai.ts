import type {
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
  SprintSummaryResponse,
  AiStatusResponse,
} from '../types/api'
import { request } from './client'

export const getAIStatus = () => request<AiStatusResponse>('GET', '/ai/status')
export const chatWithAI = (projectId: string, body: ChatRequest) =>
  request<ChatResponse>('POST', `/projects/${projectId}/ai/chat`, body)
export const generateTodos = (projectId: string, body: GenerateTodosRequest) =>
  request<GenerateTodosResponse>('POST', `/projects/${projectId}/ai/generate-todos`, body)
export const planSprint = (projectId: string, body: PlanSprintRequest) =>
  request<PlanSprintResponse>('POST', `/projects/${projectId}/ai/plan-sprint`, body)
export const generateSprintSummary = (sprintId: string) =>
  request<SprintSummaryResponse>('POST', `/sprints/${sprintId}/ai/summary`)
