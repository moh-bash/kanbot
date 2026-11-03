import { closestCorners, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, CheckCircle2, Clock3, GripVertical, ListChecks, MoveRight, Target } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import type { Todo, TodoStatus } from '../../types/api'
import { useMoveBoardTodo, useSprintBoard, useSprints } from '../../hooks/useSprints'
import { TodoDetailsPanel } from '../todos/TodoDetailsPanel'
import { SprintSummary } from '../ai/AIComponents'
import { CompleteSprintDialog } from '../sprints/SprintDialogs'

const columns: Array<{ status: TodoStatus; label: string; tone: string }> = [
  { status: 'todo', label: 'To Do', tone: 'border-slate-400/30' },
  { status: 'in_progress', label: 'In Progress', tone: 'border-primary/30' },
  { status: 'in_review', label: 'In Review', tone: 'border-amber-400/30' },
  { status: 'done', label: 'Done', tone: 'border-secondary/30' },
]

export function SprintBoardPage() {
  const { projectId = '' } = useParams()
  const sprintsQuery = useSprints(projectId)
  const active = sprintsQuery.data?.sprints.find((sprint) => sprint.status === 'active')
  const boardQuery = useSprintBoard(active?.id ?? '')
  if (sprintsQuery.isLoading || (active && boardQuery.isLoading)) return <BoardSkeleton />
  if (sprintsQuery.isError || boardQuery.isError) return <State title="Couldn’t load the sprint board" retry={() => { void sprintsQuery.refetch(); void boardQuery.refetch() }} />
  if (!active || !boardQuery.data) return <EmptyBoard projectId={projectId} />
  return <BoardContent projectId={projectId} sprint={boardQuery.data.sprint} board={boardQuery.data.columns} />
}

function BoardContent({ projectId, sprint, board }: { projectId: string; sprint: NonNullable<ReturnType<typeof useSprintBoard>['data']>['sprint']; board: NonNullable<ReturnType<typeof useSprintBoard>['data']>['columns'] }) {
  const moveMutation = useMoveBoardTodo(sprint.id)
  const sprintsQuery = useSprints(projectId)
  const [selected, setSelected] = useState<Todo | null>(null)
  const [dragged, setDragged] = useState<Todo | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [now] = useState(() => Date.now())
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const activeDays = sprint.endDate ? Math.max(0, Math.ceil((new Date(`${sprint.endDate}T23:59:59`).getTime() - now) / 86400000)) : null
  const totalPoints = sprint.stats.totalPoints
  const pointsPercent = totalPoints ? Math.round((sprint.stats.donePoints / totalPoints) * 100) : 0
  const todoPercent = sprint.stats.totalTodos ? Math.round((sprint.stats.doneTodos / sprint.stats.totalTodos) * 100) : 0
  const handleDragEnd = (event: DragEndEvent) => {
    setDragged(null)
    if (!event.over) return
    const todo = Object.values(board).flat().find((item) => item.id === event.active.id)
    if (!todo) return
    const targetStatus = columns.some((column) => column.status === event.over?.id) ? event.over.id as TodoStatus : Object.entries(board).find(([, todos]) => todos.some((item) => item.id === event.over?.id))?.[0] as TodoStatus | undefined
    if (!targetStatus) return
    const position = board[targetStatus].findIndex((item) => item.id === event.over?.id)
    if (todo.status !== targetStatus || todo.id !== event.over.id) moveMutation.mutate({ todoId: todo.id, body: { status: targetStatus, position: position < 0 ? board[targetStatus].length : position } })
  }
  const plannedSprints = (sprintsQuery.data?.sprints ?? []).filter((item) => item.status === 'planned')
  return <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:py-10"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><Link to={`/projects/${projectId}/sprints`} className="text-sm font-bold text-muted-foreground hover:text-primary">Sprints</Link><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{sprint.name}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{sprint.goal || 'Focus the team on the most valuable work.'}</p><div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{sprint.startDate ?? 'No start'} — {sprint.endDate ?? 'No end'}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{activeDays === null ? 'No end date' : `${activeDays} days remaining`}</span></div></div><div className="flex flex-wrap gap-2"><Link to={`/projects/${projectId}/sprints/${sprint.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-foreground hover:bg-surface"><Target className="h-4 w-4" /> Sprint details</Link><button type="button" onClick={() => setCompleteOpen(true)} className="inline-flex h-10 items-center rounded-xl bg-secondary px-4 text-sm font-extrabold text-white hover:bg-secondary-hover">Complete sprint</button></div></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ProgressCard label="Todo progress" value={`${sprint.stats.doneTodos}/${sprint.stats.totalTodos}`} percent={todoPercent} icon={<ListChecks className="h-4 w-4" />} /><ProgressCard label="Story points" value={`${sprint.stats.donePoints}/${sprint.stats.totalPoints}`} percent={pointsPercent} icon={<Target className="h-4 w-4" />} /><ProgressCard label="Completed todos" value={sprint.stats.doneTodos} percent={todoPercent} icon={<CheckCircle2 className="h-4 w-4" />} /><ProgressCard label="Total todos" value={sprint.stats.totalTodos} percent={100} icon={<ListChecks className="h-4 w-4" />} />  </div><SprintSummary sprint={sprint} /><DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(event) => setDragged(Object.values(board).flat().find((todo) => todo.id === event.active.id) ?? null)} onDragEnd={handleDragEnd}><div className="mt-8 grid min-w-[980px] grid-cols-4 gap-4 overflow-x-auto pb-4 lg:min-w-0">{columns.map((column) => <BoardColumn key={column.status} {...column} todos={board[column.status]} onOpen={setSelected} />)}</div><DragOverlay>{dragged && <TodoCard todo={dragged} overlay />}</DragOverlay></DndContext>{selected && <TodoDetailsPanel todo={selected} onClose={() => setSelected(null)} onDeleted={() => setSelected(null)} />}{completeOpen && <CompleteSprintDialog projectId={projectId} sprint={sprint} plannedSprints={plannedSprints} onClose={() => setCompleteOpen(false)} />}</div>
}

function BoardColumn({ status, label, tone, todos, onOpen }: { status: TodoStatus; label: string; tone: string; todos: Todo[]; onOpen: (todo: Todo) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return <section ref={setNodeRef} className={`min-h-[460px] rounded-2xl border-2 bg-surface/70 p-3 ${tone} ${isOver ? 'bg-primary/5' : ''}`} aria-label={label}><div className="flex items-center justify-between px-2 py-2"><h2 className="text-sm font-extrabold text-foreground">{label}</h2><span className="rounded-full bg-background px-2 py-1 text-xs font-extrabold text-muted-foreground">{todos.length}</span></div><SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}><div className="mt-2 space-y-3">{todos.map((todo) => <SortableCard key={todo.id} todo={todo} onOpen={() => onOpen(todo)} />)}</div></SortableContext>{todos.length === 0 && <p className="px-2 py-8 text-center text-xs font-semibold text-muted-foreground">Drop todos here</p>}</section>
}
function SortableCard({ todo, onOpen }: { todo: Todo; onOpen: () => void }) { const { setNodeRef, transform, transition, attributes, listeners } = useSortable({ id: todo.id }); return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}><TodoCard todo={todo} onOpen={onOpen} attributes={attributes} listeners={listeners} /></div> }
function TodoCard({ todo, onOpen, attributes, listeners, overlay = false }: { todo: Todo; onOpen?: () => void; attributes?: ReturnType<typeof useSortable>['attributes']; listeners?: ReturnType<typeof useSortable>['listeners']; overlay?: boolean }) { return <article className={`rounded-xl border border-border bg-surface p-4 shadow-sm ${overlay ? 'rotate-2 shadow-xl' : 'hover:border-primary/40 hover:shadow-md'}`}><div className="flex items-start gap-2"><button type="button" aria-label={`Reorder ${todo.key}`} {...attributes} {...listeners} className="mt-0.5 cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground"><GripVertical className="h-4 w-4" /></button><button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring"><p className="text-[11px] font-extrabold tracking-wider text-primary">{todo.key}</p><h3 className="mt-1 text-sm font-extrabold text-foreground">{todo.title}</h3></button></div><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-extrabold capitalize"><span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{todo.type}</span><span className={`rounded-md px-2 py-1 ${todo.priority === 'urgent' || todo.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-background text-muted-foreground'}`}>{todo.priority}</span>{todo.storyPoints && <span className="rounded-md bg-background px-2 py-1 text-foreground">{todo.storyPoints} pts</span>}</div></article> }
function ProgressCard({ label, value, percent, icon }: { label: string; value: string | number; percent: number; icon: ReactNode }) { return <div className="rounded-2xl border border-border bg-surface p-4"><div className="flex items-center justify-between text-muted-foreground"><span className="inline-flex items-center gap-2 text-xs font-bold">{icon}{label}</span><span className="text-sm font-extrabold text-foreground">{value}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, percent)}%` }} /></div></div> }
function EmptyBoard({ projectId }: { projectId: string }) { return <div className="mx-auto max-w-3xl px-5 py-20 text-center"><Target className="mx-auto h-10 w-10 text-primary" /><h1 className="mt-5 text-2xl font-extrabold text-foreground">No active sprint</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Plan and start a sprint from the backlog to bring work onto the board.</p><Link to={`/projects/${projectId}/backlog`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-primary-foreground">Go to backlog <MoveRight className="h-4 w-4" /></Link></div> }
function State({ title, retry }: { title: string; retry: () => void }) { return <div className="mx-auto max-w-3xl px-5 py-20 text-center"><h1 className="text-xl font-extrabold text-foreground">{title}</h1><button type="button" onClick={retry} className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground">Try again</button></div> }
function BoardSkeleton() { return <div className="mx-auto max-w-7xl animate-pulse px-5 py-10"><div className="h-10 w-64 rounded bg-surface" /><div className="mt-8 grid grid-cols-4 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-96 rounded-2xl bg-surface" />)}</div></div> }
