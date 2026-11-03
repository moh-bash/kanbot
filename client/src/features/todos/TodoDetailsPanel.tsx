import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, ChevronDown, LoaderCircle, Trash2, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Todo } from '../../types/api'
import { ApiError, fieldErrors } from '../../api/client'
import { useDeleteTodo, useProjectSprints, useUpdateTodo } from '../../hooks/useBacklog'
import { useTodo } from '../../hooks/useTodo'
import { useToastStore } from '../../components/toast-store'

const storyPoints = ['none', '1', '2', '3', '5', '8', '13'] as const
const todoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long'),
  type: z.enum(['task', 'story', 'bug']),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  storyPoints: z.enum(storyPoints),
  labels: z.string(),
  dueDate: z.string(),
  sprintId: z.string(),
})

type TodoFormValues = z.infer<typeof todoSchema>

interface TodoDetailsPanelProps {
  todo: Todo
  onClose: () => void
  onDeleted: () => void
}

export function TodoDetailsPanel({ todo, onClose, onDeleted }: TodoDetailsPanelProps) {
  const projectId = todo.projectId
  const detailsQuery = useTodo(todo.id)
  const sprintsQuery = useProjectSprints(projectId)
  const updateMutation = useUpdateTodo(projectId)
  const deleteMutation = useDeleteTodo(projectId)
  const addToast = useToastStore((state) => state.addToast)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const currentTodo = detailsQuery.data?.todo ?? todo
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: toFormValues(currentTodo),
  })

  useEffect(() => {
    form.reset(toFormValues(currentTodo))
  }, [currentTodo, form])

  const requestClose = () => {
    const hasValueChanges = JSON.stringify(form.getValues()) !== JSON.stringify(toFormValues(currentTodo))
    if (form.formState.isDirty || hasValueChanges) {
      setDiscardOpen(true)
    } else {
      onClose()
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (deleteOpen) {
        setDeleteOpen(false)
      } else if (discardOpen) {
        setDiscardOpen(false)
      } else {
        requestClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({
        todoId: currentTodo.id,
        body: {
          title: values.title.trim(),
          description: values.description,
          type: values.type,
          status: values.status,
          priority: values.priority,
          storyPoints: values.storyPoints === 'none' ? null : Number(values.storyPoints) as 1 | 2 | 3 | 5 | 8 | 13,
          labels: values.labels.split(',').map((label) => label.trim()).filter(Boolean),
          dueDate: values.dueDate || null,
          sprintId: values.sprintId === 'backlog' ? null : values.sprintId,
        },
      })
      form.reset(values)
      addToast('Todo updated successfully.')
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(fieldErrors(error)).forEach(([name, message]) => {
          if (name in todoSchema.shape) form.setError(name as keyof TodoFormValues, { type: 'server', message })
        })
      } else {
        addToast('Unable to update this todo.', 'error')
      }
    }
  })

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(currentTodo.id)
      addToast('Todo deleted successfully.')
      onDeleted()
    } catch (error) {
      addToast(error instanceof ApiError ? error.message : 'Unable to delete this todo.', 'error')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-slate-950/40" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && requestClose()} />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl" aria-label="Todo details">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-wider text-primary">{currentTodo.key}</p><h2 className="mt-1 truncate text-xl font-extrabold text-foreground">Todo details</h2></div>
          <button type="button" aria-label="Close todo details" onClick={requestClose} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <form className="flex-1 overflow-y-auto px-6 py-6" onSubmit={onSubmit} noValidate>
          <Field label="Title" error={form.formState.errors.title?.message}><input className={inputClass} {...form.register('title')} /></Field>
          <Field label="Description" error={form.formState.errors.description?.message}><textarea rows={5} className={`${inputClass} resize-none`} {...form.register('description')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Type" options={['task', 'story', 'bug']} {...form.register('type')} />
            <SelectField label="Status" options={['todo', 'in_progress', 'in_review', 'done']} {...form.register('status')} />
            <SelectField label="Priority" options={['low', 'medium', 'high', 'urgent']} {...form.register('priority')} />
            <SelectField label="Story points" options={storyPoints} {...form.register('storyPoints')} />
          </div>
          <Field label="Labels" hint="Separate labels with commas." error={form.formState.errors.labels?.message}><input className={inputClass} placeholder="frontend, polish" {...form.register('labels')} /></Field>
          <Field label="Due date" error={form.formState.errors.dueDate?.message}><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input type="date" className={`${inputClass} pl-10`} {...form.register('dueDate')} /></div></Field>
          <Field label="Sprint" error={form.formState.errors.sprintId?.message}><SelectField label="" options={['backlog', ...(sprintsQuery.data?.sprints ?? []).filter((sprint) => sprint.status !== 'completed').map((sprint) => sprint.id)]} optionLabels={Object.fromEntries((sprintsQuery.data?.sprints ?? []).map((sprint) => [sprint.id, `${sprint.name} (${sprint.status})`]))} {...form.register('sprintId')} /></Field>
          {form.formState.errors.root?.message && <p className="text-sm font-semibold text-destructive">{form.formState.errors.root.message}</p>}
        </form>
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button type="button" onClick={() => setDeleteOpen(true)} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-bold text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Delete</button>
          <div className="flex gap-3"><button type="button" onClick={requestClose} className="h-10 cursor-pointer rounded-xl border border-border px-4 text-sm font-bold text-foreground hover:bg-background">Cancel</button><button type="submit" formAction={undefined} onClick={onSubmit} disabled={updateMutation.isPending} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{updateMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}Save changes</button></div>
        </div>
      </aside>
      {discardOpen && <ConfirmDialog title="Discard changes?" message="Your unsaved todo changes will be lost." confirmLabel="Discard" onCancel={() => setDiscardOpen(false)} onConfirm={onClose} />}
      {deleteOpen && <ConfirmDialog title={`Delete ${currentTodo.key}?`} message="This todo will be permanently deleted." confirmLabel={deleteMutation.isPending ? 'Deleting…' : 'Delete'} destructive pending={deleteMutation.isPending} onCancel={() => setDeleteOpen(false)} onConfirm={handleDelete} />}
    </>
  )
}

function toFormValues(todo: Todo): TodoFormValues {
  return { title: todo.title, description: todo.description, type: todo.type, status: todo.status, priority: todo.priority, storyPoints: todo.storyPoints ? String(todo.storyPoints) as TodoFormValues['storyPoints'] : 'none', labels: todo.labels.join(', '), dueDate: todo.dueDate ?? '', sprintId: todo.sprintId ?? 'backlog' }
}

const inputClass = 'mt-2 h-11 w-full rounded-xl border border-border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20'

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <div className="mb-5"><label className="block text-sm font-bold text-foreground">{label}</label>{children}{hint && !error && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}{error && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{error}</p>}</div>
}

function SelectField({ label, options, optionLabels = {}, ...props }: { label: string; options: readonly string[]; optionLabels?: Record<string, string> } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <div className={label ? 'mb-5' : ''}>{label && <label className="block text-sm font-bold text-foreground">{label}</label>}<div className="relative"><select className={`${inputClass} appearance-none ${label ? '' : 'mt-0'}`} {...props}>{options.map((option) => <option key={option} value={option}>{optionLabels[option] ?? option.replace('_', ' ')}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-5 h-4 w-4 text-muted-foreground" /></div></div>
}

function ConfirmDialog({ title, message, confirmLabel, destructive = false, pending = false, onCancel, onConfirm }: { title: string; message: string; confirmLabel: string; destructive?: boolean; pending?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"><h3 className="text-lg font-extrabold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="h-10 cursor-pointer rounded-xl border border-border px-4 text-sm font-bold text-foreground">Cancel</button><button type="button" disabled={pending} onClick={onConfirm} className={`h-10 cursor-pointer rounded-xl px-4 text-sm font-extrabold text-white disabled:opacity-60 ${destructive ? 'bg-destructive' : 'bg-primary'}`}>{confirmLabel}</button></div></div></div>
}
