import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTodo, deleteTodo, listTodos, moveTodo, updateTodo } from '../api/todos'
import { listSprints } from '../api/sprints'
import type { CreateTodoRequest, MoveTodoRequest, Todo, TodoListQuery, UpdateTodoRequest } from '../types/api'
import { useToastStore } from '../components/toast-store'

export const backlogQueryKey = (projectId: string, query: TodoListQuery = {}) =>
  ['todos', projectId, 'backlog', query] as const

export function useBacklog(projectId: string, query: TodoListQuery) {
  return useQuery({
    queryKey: backlogQueryKey(projectId, query),
    queryFn: () => listTodos(projectId, { sprintId: 'backlog', ...query }),
  })
}

export function useProjectSprints(projectId: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => listSprints(projectId),
  })
}

export function useCreateTodo(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTodoRequest) => createTodo(projectId, body),
    onSuccess: (response) => {
      if (response?.todo) {
        queryClient.invalidateQueries({ queryKey: ['todos', projectId] })
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      }
    },
  })
}

export function useUpdateTodo(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ todoId, body }: { todoId: string; body: UpdateTodoRequest }) =>
      updateTodo(todoId, body),
    onSuccess: (response) => {
      if (response?.todo) {
        queryClient.invalidateQueries({ queryKey: ['todos', projectId] })
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      }
    },
  })
}

export function useDeleteTodo(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (todoId: string) => deleteTodo(todoId),
    onSuccess: (_response, todoId) => {
      queryClient.setQueriesData<{ todos: Todo[] }>({ queryKey: ['todos', projectId] }, (current) =>
        current ? { todos: current.todos.filter((todo) => todo.id !== todoId) } : current,
      )
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useMoveTodo(projectId: string, query: TodoListQuery) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  return useMutation({
    mutationFn: ({ todoId, body }: { todoId: string; body: MoveTodoRequest }) =>
      moveTodo(todoId, body),
    onMutate: async ({ todoId, body }) => {
      const key = backlogQueryKey(projectId, query)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<{ todos: Todo[] }>(key)
      if (previous && body.sprintId === undefined && body.status === undefined) {
        const todos = [...previous.todos]
        const index = todos.findIndex((todo) => todo.id === todoId)
        const [todo] = todos.splice(index, 1)
        todos.splice(Math.max(0, Math.min(body.position, todos.length)), 0, todo)
        queryClient.setQueryData(key, { todos: todos.map((item, order) => ({ ...item, order })) })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(backlogQueryKey(projectId, query), context.previous)
      }
      addToast('Could not reorder this todo. Your changes were rolled back.', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', projectId] })
    },
  })
}
