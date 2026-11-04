import { useQuery } from "@tanstack/react-query";
import { getTodo } from "../api/todos";

export function useTodo(todoId: string | null) {
  return useQuery({
    queryKey: ["todo", todoId],
    queryFn: () => getTodo(todoId as string),
    enabled: Boolean(todoId),
  });
}
