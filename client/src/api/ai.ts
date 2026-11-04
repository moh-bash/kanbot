import { z } from "zod";
import { ApiError, request } from "./client";
import type {
  AiStatusResponse,
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
  Sprint,
  SprintSummaryResponse,
} from "../types/api";

const aiSourceSchema = z.enum(["mock", "ai"]);
const storyPointsSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(5),
  z.literal(8),
  z.literal(13),
  z.null(),
]);
const draftTodoSchema = z
  .object({
    title: z.string().min(1),
    description: z.string(),
    type: z.enum(["task", "story", "bug"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    storyPoints: storyPointsSchema,
  })
  .passthrough();
const chatMessageSchema = z.object({
  role: z.literal("assistant"),
  content: z.string().min(1),
});
const summarySchema = z.object({
  content: z.string().min(1),
  source: aiSourceSchema,
  generatedAt: z.string().min(1),
});

const aiStatusSchema = z.object({
  mode: aiSourceSchema,
  model: z.string().nullable(),
});
const chatResponseSchema = z.object({
  message: chatMessageSchema,
  source: aiSourceSchema,
});
const generateTodosResponseSchema = z.object({
  todos: z.array(draftTodoSchema),
  source: aiSourceSchema,
});
const planSprintResponseSchema = z.object({
  goal: z.string(),
  todoIds: z.array(z.string()),
  totalPoints: z.number(),
  reasoning: z.string(),
  source: aiSourceSchema,
});
const sprintSummaryResponseSchema = z.object({
  sprint: z.custom<Sprint>(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      "projectId" in value &&
      "summary" in value,
  ),
  summary: summarySchema,
});

async function requestAIResponse<T>(
  path: string,
  schema: z.ZodType<T>,
  label: string,
  body?: unknown,
): Promise<T> {
  const response = await request<unknown>("POST", path, body);
  const parsed = schema.safeParse(response);
  if (!parsed.success) {
    throw new ApiError(
      502,
      "AI_ERROR",
      `The AI returned an invalid ${label} response. Please try again.`,
    );
  }
  return parsed.data;
}

export async function getAIStatus(): Promise<AiStatusResponse> {
  const response = await request<unknown>("GET", "/ai/status");
  const parsed = aiStatusSchema.safeParse(response);
  if (!parsed.success) {
    throw new ApiError(
      502,
      "AI_ERROR",
      "The AI status response was invalid. Please try again.",
    );
  }
  return parsed.data;
}

export function chatWithAI(projectId: string, body: ChatRequest) {
  return requestAIResponse<ChatResponse>(
    `/projects/${projectId}/ai/chat`,
    chatResponseSchema,
    "chat",
    body,
  );
}

export function generateTodos(projectId: string, body: GenerateTodosRequest) {
  return requestAIResponse<GenerateTodosResponse>(
    `/projects/${projectId}/ai/generate-todos`,
    generateTodosResponseSchema,
    "generated todos",
    body,
  );
}

export function planSprint(projectId: string, body: PlanSprintRequest) {
  return requestAIResponse<PlanSprintResponse>(
    `/projects/${projectId}/ai/plan-sprint`,
    planSprintResponseSchema,
    "sprint plan",
    body,
  );
}

export function generateSprintSummary(sprintId: string) {
  return requestAIResponse<SprintSummaryResponse>(
    `/sprints/${sprintId}/ai/summary`,
    sprintSummaryResponseSchema,
    "sprint summary",
  );
}
