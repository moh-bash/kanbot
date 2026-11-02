import { FolderKanban, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { ProjectWithStats } from '../../types/api'
import { ApiError } from '../../api/client'
import { useDeleteProject, useProjects } from '../../hooks/useProjects'
import { useToastStore } from '../../components/toast-store'
import { ProjectDialog } from './ProjectDialog'
import { DeleteProjectDialog } from './DeleteProjectDialog'

export function ProjectsPage() {
  const projectsQuery = useProjects()
  const deleteMutation = useDeleteProject()
  const navigate = useNavigate()
  const addToast = useToastStore((state) => state.addToast)
  const [dialog, setDialog] = useState<'create' | ProjectWithStats | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithStats | null>(null)
  const projects = projectsQuery.data?.projects ?? []

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      addToast('Project deleted successfully.')
      navigate('/projects', { replace: true })
    } catch (error) {
      addToast(error instanceof ApiError ? error.message : 'Unable to delete project.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Workspace</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Your projects</h1><p className="mt-2 text-sm text-muted-foreground">Choose a project to focus on, or start something new.</p></div>
        <button type="button" onClick={() => setDialog('create')} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring/25"><Plus className="h-4 w-4" aria-hidden="true" /> Create project</button>
      </div>
      {projectsQuery.isLoading && <ProjectSkeletons />}
      {projectsQuery.isError && <ErrorState onRetry={() => projectsQuery.refetch()} />}
      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length === 0 && <EmptyProjects onCreate={() => setDialog('create')} />}
      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 && <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} onEdit={() => setDialog(project)} onDelete={() => setDeleteTarget(project)} />)}</div>}
      {dialog && <ProjectDialog project={dialog === 'create' ? undefined : dialog} onClose={() => setDialog(null)} onCreated={(id) => navigate(`/projects/${id}/backlog`)} onSaved={() => addToast('Project updated successfully.')} />}
      {deleteTarget && <DeleteProjectDialog project={deleteTarget} pending={deleteMutation.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  )
}

function ProjectCard({ project, onEdit, onDelete }: { project: ProjectWithStats; onEdit: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <article className="group relative flex min-h-64 flex-col rounded-2xl border border-border bg-surface p-6 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FolderKanban className="h-5 w-5" aria-hidden="true" /></div><div className="relative"><button type="button" aria-label={`Actions for ${project.name}`} onClick={() => setMenuOpen((open) => !open)} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"><MoreHorizontal className="h-5 w-5" aria-hidden="true" /></button>{menuOpen && <div className="absolute right-0 top-11 z-10 w-40 rounded-xl border border-border bg-surface p-1 shadow-xl"><button type="button" onClick={() => { setMenuOpen(false); onEdit() }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-background"><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => { setMenuOpen(false); onDelete() }} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Delete</button></div>}</div></div>
      <div className="mt-5"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-extrabold text-foreground">{project.name}</h2><span className="rounded-md bg-background px-2 py-1 text-[11px] font-extrabold tracking-wider text-muted-foreground">{project.key}</span></div><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{project.description || 'No description yet.'}</p></div>
      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-5"><div><p className="text-xl font-extrabold text-foreground">{project.stats.backlogCount}</p><p className="text-xs font-semibold text-muted-foreground">Backlog items</p></div><div><p className="truncate text-sm font-extrabold text-foreground">{project.stats.activeSprint?.name ?? 'None'}</p><p className="text-xs font-semibold text-muted-foreground">Active sprint</p></div></div>
      <Link to={`/projects/${project.id}/backlog`} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-background text-sm font-extrabold text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring">Open workspace</Link>
    </article>
  )
}

function ProjectSkeletons() { return <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-border bg-surface p-6"><div className="h-11 w-11 rounded-xl bg-background" /><div className="mt-5 h-5 w-2/3 rounded bg-background" /><div className="mt-3 h-10 rounded bg-background" /></div>)}</div> }
function EmptyProjects({ onCreate }: { onCreate: () => void }) { return <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FolderKanban className="h-7 w-7" /></div><h2 className="mt-5 text-xl font-extrabold text-foreground">Your workspace is ready</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Create your first project to organize ideas, plan focused sprints, and make progress visible.</p><button type="button" onClick={onCreate} className="mt-6 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover"><Plus className="h-4 w-4" /> Create your first project</button></div> }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="mt-10 flex flex-col items-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center"><p className="text-base font-extrabold text-foreground">We couldn’t load your projects</p><p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p><button type="button" onClick={onRetry} className="mt-5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground hover:bg-background"><RefreshCw className="h-4 w-4" /> Try again</button></div> }
