import type {
  CreateTodoRequest,
  MoveTodoRequest,
  Todo,
  TodoListQuery,
  TodoListResponse,
  UpdateTodoRequest,
  BulkCreateTodosRequest,
  BulkCreateTodosResponse,
} from "../types/api";
import { request } from "./client";

function toQueryString(query: TodoListQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function listTodos(projectId: string, query: TodoListQuery = {}) {
  return request<TodoListResponse>(
    "GET",
    `/projects/${projectId}/todos${toQueryString(query)}`,
  );
}

export function getTodo(todoId: string) {
  return request<{ todo: Todo }>("GET", `/todos/${todoId}`);
}

export function createTodo(projectId: string, body: CreateTodoRequest) {
  return request<{ todo: Todo }>("POST", `/projects/${projectId}/todos`, body);
}

export function updateTodo(todoId: string, body: UpdateTodoRequest) {
  return request<{ todo: Todo }>("PATCH", `/todos/${todoId}`, body);
}

export function deleteTodo(todoId: string) {
  return request<void>("DELETE", `/todos/${todoId}`);
}

export function moveTodo(todoId: string, body: MoveTodoRequest) {
  return request<{ todo: Todo }>("POST", `/todos/${todoId}/move`, body);
}

export function bulkCreateTodos(
  projectId: string,
  body: BulkCreateTodosRequest,
) {
  return request<BulkCreateTodosResponse>(
    "POST",
    `/projects/${projectId}/todos/bulk`,
    body,
  );
}
