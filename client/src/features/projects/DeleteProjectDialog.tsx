import { AlertTriangle, X } from 'lucide-react'
import type { ProjectWithStats } from '../../types/api'

interface DeleteProjectDialogProps {
  project: ProjectWithStats
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteProjectDialog({ project, pending, onCancel, onConfirm }: DeleteProjectDialogProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-project-title" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" aria-hidden="true" /></div>
          <button type="button" aria-label="Close dialog" onClick={onCancel} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <h2 id="delete-project-title" className="mt-5 text-xl font-extrabold text-foreground">Delete {project.name}?</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">This permanently deletes <strong className="text-foreground">{project.name}</strong> and all of its todos and sprints. This action cannot be undone.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="h-11 cursor-pointer rounded-xl border border-border px-5 text-sm font-bold text-foreground hover:bg-background">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={pending} className="h-11 cursor-pointer rounded-xl bg-destructive px-5 text-sm font-extrabold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Deleting…' : 'Delete project'}</button>
        </div>
      </section>
    </div>
  )
}
