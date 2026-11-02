import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ProjectWithStats } from '../../types/api'
import { ApiError, fieldErrors } from '../../api/client'
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects'

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(80, 'Project name is too long'),
  key: z.string().trim().regex(/^[a-zA-Z]{2,6}$/, 'Use 2–6 letters, or leave the key empty').or(z.literal('')),
  description: z.string().max(500, 'Description is too long'),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectDialogProps {
  project?: ProjectWithStats
  onClose: () => void
  onCreated?: (projectId: string) => void
  onSaved?: () => void
}

export function ProjectDialog({ project, onClose, onCreated, onSaved }: ProjectDialogProps) {
  const isEditing = Boolean(project)
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const mutation = isEditing ? updateMutation : createMutation
  const [serverError, setServerError] = useState('')
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '',
      key: project?.key ?? '',
      description: project?.description ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      name: project?.name ?? '',
      key: project?.key ?? '',
      description: project?.description ?? '',
    })
  }, [form, project])

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError('')
    const body = {
      name: values.name.trim(),
      ...(values.key.trim() ? { key: values.key.trim().toUpperCase() } : {}),
      ...(values.description.trim() ? { description: values.description.trim() } : {}),
    }

    try {
      if (project) {
        await updateMutation.mutateAsync({ projectId: project.id, body })
        onSaved?.()
      } else {
        const response = await createMutation.mutateAsync(body)
        if (response?.project) onCreated?.(response.project.id)
      }
      onClose()
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = fieldErrors(error)
        Object.entries(errors).forEach(([name, message]) => {
          if (name === 'name' || name === 'key' || name === 'description') {
            form.setError(name, { type: 'server', message })
          }
        })
        if (error.status === 409) {
          form.setError('key', { type: 'server', message: 'This key is already used' })
        }
        if (error.status !== 400 && error.status !== 409 && !Object.keys(errors).length) {
          setServerError(error.message)
        }
      } else {
        setServerError('Unable to save this project. Please try again.')
      }
    }
  })

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="project-dialog-title" className="text-xl font-extrabold text-foreground">{isEditing ? 'Edit project' : 'Create project'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{isEditing ? 'Keep your project details up to date.' : 'Give your next piece of work a home.'}</p>
          </div>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
          {serverError && <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive" role="alert">{serverError}</p>}
          <Field label="Name" required error={form.formState.errors.name?.message} {...form.register('name')} />
          <Field label="Key" hint="Optional. Leave empty to let Kanbot generate one." error={form.formState.errors.key?.message} {...form.register('key', { onChange: (event) => form.setValue('key', event.target.value.toUpperCase()) })} />
          {isEditing && <p className="-mt-2 text-xs text-muted-foreground">Changing the project key does not change existing task keys.</p>}
          <div>
            <label htmlFor="project-description" className="mb-2 block text-sm font-bold text-foreground">Description</label>
            <textarea id="project-description" rows={3} className="w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20" placeholder="What are you building?" {...form.register('description')} />
            {form.formState.errors.description?.message && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{form.formState.errors.description.message}</p>}
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="h-11 cursor-pointer rounded-xl border border-border px-5 text-sm font-bold text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="h-11 cursor-pointer rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60">{mutation.isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  error,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean; hint?: string; error?: string }) {
  return (
    <div>
      <label htmlFor={inputProps.id ?? inputProps.name} className="mb-2 block text-sm font-bold text-foreground">{label}{required && <span className="ml-1 text-destructive">*</span>}</label>
      <input id={inputProps.id ?? inputProps.name} className="h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20" {...inputProps} />
      {hint && !error && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-2 text-xs font-semibold text-destructive" role="alert">{error}</p>}
    </div>
  )
}
