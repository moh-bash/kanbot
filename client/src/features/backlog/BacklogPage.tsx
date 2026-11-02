import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, CirclePlus, GripVertical, ListFilter, Plus, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Todo, TodoPriority, TodoType } from '../../types/api'
import { ApiError, fieldErrors } from '../../api/client'
import { useCreateTodo, useBacklog, useMoveTodo } from '../../hooks/useBacklog'
import { useProject } from '../../hooks/useProjects'
import { TodoDetailsPanel } from '../todos/TodoDetailsPanel'

const priorityOptions: Array<TodoPriority | ''> = ['', 'urgent', 'high', 'medium', 'low']
const typeOptions: Array<TodoType | ''> = ['', 'task', 'story', 'bug']

export function BacklogPage() {
  const { projectId = '' } = useParams()
  const projectQuery = useProject(projectId)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [priority, setPriority] = useState<TodoPriority | ''>('')
  const [type, setType] = useState<TodoType | ''>('')
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const query = useMemo(() => ({ ...(debouncedSearch ? { search: debouncedSearch } : {}), ...(priority ? { priority } : {}), ...(type ? { type } : {}) }), [debouncedSearch, priority, type])
  const backlogQuery = useBacklog(projectId, query)
  const moveMutation = useMoveTodo(projectId, query)
  const createMutation = useCreateTodo(projectId)
  const quickCreateRef = useRef<HTMLInputElement>(null)
  const [quickTitle, setQuickTitle] = useState('')
  const [quickError, setQuickError] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const todos = backlogQuery.data?.todos ?? []
  const totalPoints = todos.reduce((sum, todo) => sum + (todo.storyPoints ?? 0), 0)
  const filtered = Boolean(debouncedSearch || priority || type)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const createQuickTodo = async () => {
    const title = quickTitle.trim()
    if (!title || createMutation.isPending) return
    setQuickError('')
    try {
      await createMutation.mutateAsync({ title, type: 'task', priority: 'medium', storyPoints: null })
      setQuickTitle('')
      quickCreateRef.current?.focus()
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = fieldErrors(error)
        setQuickError(errors.title ?? error.message)
      } else {
        setQuickError('Unable to create this todo.')
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (filtered || !event.over || event.active.id === event.over.id) return
    const oldIndex = todos.findIndex((todo) => todo.id === event.active.id)
    const newIndex = todos.findIndex((todo) => todo.id === event.over?.id)
    if (oldIndex >= 0 && newIndex >= 0) {
      moveMutation.mutate({ todoId: String(event.active.id), body: { position: newIndex } })
    }
  }

  const moveTo = (todo: Todo, position: number) => {
    if (!filtered) moveMutation.mutate({ todoId: todo.id, body: { position } })
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Link to="/projects" className="hover:text-primary">Projects</Link><span>/</span><span>{projectQuery.data?.project.key ?? 'Project'}</span></div><div className="mt-3 flex items-center gap-3"><h1 className="text-3xl font-extrabold tracking-tight text-foreground">Backlog</h1>{projectQuery.data?.project.key && <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-extrabold tracking-wider text-primary">{projectQuery.data.project.key}</span>}</div><p className="mt-2 text-sm text-muted-foreground">{projectQuery.data?.project.name ?? 'Your project'} · Everything you might work on next.</p></div>
        <div className="flex gap-3"><button type="button" onClick={() => quickCreateRef.current?.focus()} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring/25"><Plus className="h-4 w-4" /> Create todo</button></div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Backlog todos" value={todos.length} /><Stat label="Story points" value={totalPoints} /><Stat label="Showing" value={filtered ? `${todos.length} filtered` : 'All items'} /><Stat label="Project total" value={projectQuery.data?.project.stats.totalTodos ?? '—'} /></div>
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, key, description, or labels…" className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-3 cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Clear search"><X className="h-4 w-4" /></button>}</div><div className="flex gap-3"><FilterSelect label="Priority" value={priority} options={priorityOptions} onChange={setPriority} /><FilterSelect label="Type" value={type} options={typeOptions} onChange={setType} />{filtered && <button type="button" onClick={() => { setSearch(''); setPriority(''); setType('') }} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-bold text-muted-foreground hover:bg-surface hover:text-foreground"><X className="h-4 w-4" /> Clear</button>}</div></div>
      {filtered && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ListFilter className="h-4 w-4" /> Reordering is disabled while search or filters are active.</p>}
      {backlogQuery.isLoading && <SkeletonRows />}
      {backlogQuery.isError && <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center"><p className="font-extrabold text-foreground">Couldn’t load the backlog</p><button type="button" onClick={() => backlogQuery.refetch()} className="mt-4 cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground">Try again</button></div>}
      {!backlogQuery.isLoading && !backlogQuery.isError && todos.length === 0 && <EmptyBacklog filtered={filtered} onCreate={() => quickCreateRef.current?.focus()} />}
      {!backlogQuery.isLoading && !backlogQuery.isError && todos.length > 0 && <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}><div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">{todos.map((todo) => <SortableTodoRow key={todo.id} todo={todo} disabled={filtered} onOpen={() => setSelectedTodo(todo)} onMoveTo={moveTo} />)}</div></SortableContext></DndContext>}
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-3">{quickError && <p className="mb-2 px-2 text-xs font-semibold text-destructive" role="alert">{quickError}</p>}<div className="flex items-center gap-3"><CirclePlus className="h-5 w-5 shrink-0 text-primary" /><input ref={quickCreateRef} value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void createQuickTodo() } if (event.key === 'Escape') { setQuickTitle(''); setQuickError('') } }} placeholder="+ Create todo" disabled={createMutation.isPending} className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground" /><span className="hidden text-xs font-semibold text-muted-foreground sm:inline">Press Enter to add</span></div></div>
      {selectedTodo && <TodoDetailsPanel todo={selectedTodo} onClose={() => setSelectedTodo(null)} onDeleted={() => setSelectedTodo(null)} />}
    </div>
  )
}

function SortableTodoRow({ todo, disabled, onOpen, onMoveTo }: { todo: Todo; disabled: boolean; onOpen: () => void; onMoveTo: (todo: Todo, position: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })
  const [menuOpen, setMenuOpen] = useState(false)
  const style = { transform: CSS.Transform.toString(transform), transition }
  return <div ref={setNodeRef} style={style} className={`group flex min-h-20 items-center gap-3 border-b border-border px-3 py-3 last:border-0 sm:gap-4 sm:px-5 ${isDragging ? 'relative z-10 bg-primary/5 shadow-lg' : 'hover:bg-background'}`}><button type="button" disabled={disabled} aria-label={`Reorder ${todo.key}`} {...attributes} {...listeners} className="cursor-grab touch-none rounded-lg p-2 text-disabled hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-40"><GripVertical className="h-5 w-5" /></button><button type="button" onClick={onOpen} className="min-w-0 flex-1 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface"><div className="flex min-w-0 flex-wrap items-center gap-2"><span className="text-xs font-extrabold tracking-wider text-primary">{todo.key}</span><span className="truncate text-sm font-extrabold text-foreground">{todo.title}</span></div><div className="mt-2 flex flex-wrap items-center gap-2"><Badge value={todo.type} tone="primary" /><Badge value={todo.priority} tone={todo.priority === 'urgent' || todo.priority === 'high' ? 'danger' : 'muted'} />{todo.storyPoints && <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-extrabold text-foreground">{todo.storyPoints} pts</span>}{todo.labels.slice(0, 4).map((label) => <span key={label} className="rounded-md bg-secondary/10 px-2 py-0.5 text-[11px] font-bold text-secondary">{label}</span>)}</div></button><div className="relative"><button type="button" aria-label={`Actions for ${todo.key}`} onClick={() => setMenuOpen((value) => !value)} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground"><ChevronDown className="h-4 w-4" /></button>{menuOpen && <div className="absolute right-0 top-10 z-10 w-44 rounded-xl border border-border bg-surface p-1 shadow-xl"><button type="button" disabled={disabled} onClick={() => { setMenuOpen(false); onMoveTo(todo, 0) }} className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-bold text-foreground hover:bg-background disabled:opacity-50">Move to top</button><button type="button" disabled={disabled} onClick={() => { setMenuOpen(false); onMoveTo(todo, Number.MAX_SAFE_INTEGER) }} className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-bold text-foreground hover:bg-background disabled:opacity-50">Move to bottom</button><button type="button" onClick={() => { setMenuOpen(false); onOpen() }} className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-bold text-foreground hover:bg-background">Edit todo</button></div>}</div></div>
}

function Badge({ value, tone }: { value: string; tone: 'primary' | 'danger' | 'muted' }) { return <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold capitalize ${tone === 'primary' ? 'bg-primary/10 text-primary' : tone === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-background text-muted-foreground'}`}>{value.replace('_', ' ')}</span> }
function Stat({ label, value }: { label: string; value: number | string }) { return <div className="rounded-2xl border border-border bg-surface px-4 py-4"><p className="text-xl font-extrabold text-foreground">{value}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p></div> }
function FilterSelect<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void }) { return <label className="relative"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value as T)} className="h-11 cursor-pointer appearance-none rounded-xl border border-border bg-surface py-0 pl-3 pr-9 text-sm font-bold capitalize text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-ring/20"><option value="">All {label}</option>{options.filter(Boolean).map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" /></label> }
function SkeletonRows() { return <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="flex h-20 animate-pulse items-center gap-4 border-b border-border px-5"><div className="h-5 w-5 rounded bg-background" /><div className="flex-1"><div className="h-4 w-1/3 rounded bg-background" /><div className="mt-2 h-3 w-1/4 rounded bg-background" /></div></div>)}</div> }
function EmptyBacklog({ filtered, onCreate }: { filtered: boolean; onCreate: () => void }) { return <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center"><ListFilter className="h-8 w-8 text-primary" /><h2 className="mt-4 text-xl font-extrabold text-foreground">{filtered ? 'No matching todos' : 'Your backlog is empty'}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{filtered ? 'Try adjusting your search or filters.' : 'Capture the work you want to make progress on next.'}</p>{!filtered && <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={onCreate} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground"><Plus className="h-4 w-4" /> Create todo</button><button type="button" disabled className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-muted-foreground"><Sparkles className="h-4 w-4" /> Generate with AI</button></div>}</div> }
