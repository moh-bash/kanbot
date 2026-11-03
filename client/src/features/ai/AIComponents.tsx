import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, LoaderCircle, MessageCircle, RefreshCw, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ChatMessage, DraftTodo, Sprint, TodoPriority, TodoType } from '../../types/api'
import { ApiError } from '../../api/client'
import { useAIChat, useAIStatus, useCreateAISprint, useGenerateSprintSummary, useGenerateTodos, usePlanSprint, useSaveGeneratedTodos } from '../../hooks/useAI'
import { useBacklog } from '../../hooks/useBacklog'
import { useToastStore } from '../../components/toast-store'
import { MarkdownRenderer } from '../../components/MarkdownRenderer'

const shell = 'fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/45'
const field = 'mt-2 h-11 w-full rounded-xl border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-ring/20'
const todoTypes: TodoType[] = ['task', 'story', 'bug']
const priorities: TodoPriority[] = ['low', 'medium', 'high', 'urgent']
const points = ['', '1', '2', '3', '5', '8', '13']

export function AIAssistantDrawer({ projectId, onClose, onGenerateTodos, onPlanSprint, onSummarizeSprint }: { projectId: string; onClose: () => void; onGenerateTodos: () => void; onPlanSprint: () => void; onSummarizeSprint: () => void }) {
  const status = useAIStatus()
  const mutation = useAIChat(projectId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const reset = () => { setMessages([]); setInput('') }
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, mutation.isPending])
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  const send = async () => {
    const content = input.trim()
    if (!content || mutation.isPending) return
    const next = [...messages, { role: 'user' as const, content }]
    if (next.length > 30) return
    setMessages(next)
    try { const response = await mutation.mutateAsync({ messages: next }); if (response) { setMessages([...next, response.message]); setInput('') } }
    catch { setMessages(messages) }
  }
  return <div className={shell}><aside className="flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl"><header className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bot className="h-5 w-5" /></span><div><h2 className="font-extrabold text-foreground">Kanbot AI</h2><div className="flex items-center gap-2 text-xs text-muted-foreground">{status.data?.mode === 'mock' && <span className="rounded-full bg-secondary/10 px-2 py-0.5 font-bold text-secondary">Mock AI</span>}<span>AI teammate</span></div></div></div><div className="flex items-center gap-1"><button type="button" onClick={reset} className="rounded-lg px-2 py-2 text-xs font-bold text-muted-foreground hover:bg-background">New chat</button><button type="button" aria-label="Close AI assistant" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-background"><X className="h-5 w-5" /></button></div></header><div className="flex-1 overflow-y-auto px-5 py-5"><div className="mb-5 rounded-2xl border border-primary/15 bg-primary/5 p-4"><p className="text-sm font-bold text-foreground">What can I help you ship?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Ask about your project, backlog, or sprint.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={onGenerateTodos} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40">Create todos</button><button type="button" onClick={onPlanSprint} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40">Plan sprint</button><button type="button" onClick={onSummarizeSprint} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40">Summarize sprint</button></div></div>{messages.length === 0 && <div className="py-12 text-center"><MessageCircle className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 text-sm font-bold text-foreground">Start with a question</p><p className="mt-1 text-xs text-muted-foreground">Try “What should I work on next?”</p></div>}{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground'}`}>{message.role === 'assistant'   ? <MarkdownRenderer content={message.content} /> : message.content}</div></div>)}{mutation.isPending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Thinking...</div>}{mutation.isError && <div className="mt-3 flex items-center justify-between rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"><span>{mutation.error instanceof ApiError ? mutation.error.message : 'AI request failed.'}</span><button type="button" onClick={() => void send()} className="font-extrabold underline">Try again</button></div>}<div ref={endRef} /></div><div className="border-t border-border p-4"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} rows={3} placeholder="Ask Kanbot AI..." className="w-full resize-none rounded-xl border border-border bg-input p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20" disabled={mutation.isPending} /><div className="mt-2 flex items-center justify-between"><p className="text-[11px] text-muted-foreground">AI can make mistakes. Review before saving.</p><button type="button" disabled={!input.trim() || mutation.isPending} onClick={() => void send()} className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50" aria-label="Send message"><Send className="h-4 w-4" /></button></div></div></aside></div>
}

const generateSchema = z.object({ prompt: z.string().trim().min(3, 'Describe a feature').max(2000), count: z.coerce.number().int().min(1).max(10) })
export function GenerateTodosDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const mutation = useGenerateTodos(projectId)
  const save = useSaveGeneratedTodos(projectId)
  const toast = useToastStore((state) => state.addToast)
  const [drafts, setDrafts] = useState<Array<DraftTodo & { selected: boolean }>>([])
  const form = useForm({ resolver: zodResolver(generateSchema), defaultValues: { prompt: '', count: 5 } })
  const submit = form.handleSubmit(async (values) => { try { const result = await mutation.mutateAsync(values); if (result) setDrafts(result.todos.map((todo) => ({ ...todo, selected: true }))) } catch { /* the form stays intact for retry */ } })
  const update = (index: number, patch: Partial<DraftTodo & { selected: boolean }>) => setDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  const selected = drafts.filter((draft) => draft.selected)
  const saveDrafts = async () => { try { await save.mutateAsync({ todos: selected.map((todo) => ({ title: todo.title, description: todo.description, type: todo.type, priority: todo.priority, storyPoints: todo.storyPoints })) }); toast(`Added ${selected.length} todos to the backlog.`); onClose() } catch { /* preserve drafts for retry */ } }
  return <Modal title="Generate todos with AI" onClose={onClose}>{mutation.isError && <AIError error={mutation.error} retry={() => void form.handleSubmit(async (values) => { const result = await mutation.mutateAsync(values); if (result) setDrafts(result.todos.map((todo) => ({ ...todo, selected: true }))) })()} />}<form onSubmit={submit} className="space-y-4"><Field label="Feature description" error={form.formState.errors.prompt?.message}><textarea rows={4} placeholder="Describe a feature..." className={`${field} h-auto py-3`} {...form.register('prompt')} /></Field><Field label="Number of todos" error={form.formState.errors.count?.message}><input type="number" min={1} max={10} className={field} {...form.register('count')} /></Field><p className="text-xs text-muted-foreground">AI can make mistakes. Review before saving.</p><button type="submit" disabled={mutation.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground disabled:opacity-60">{mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}Generate</button></form>{drafts.length > 0 && <div className="mt-6 border-t border-border pt-5"><div className="flex items-center justify-between"><h3 className="font-extrabold text-foreground">Generated drafts</h3><button type="button" onClick={() => setDrafts((items) => items.map((item) => ({ ...item, selected: !items.every((draft) => draft.selected) })))} className="text-xs font-bold text-primary">{drafts.every((draft) => draft.selected) ? 'Deselect all' : 'Select all'}</button></div><div className="mt-3 space-y-3">{drafts.map((draft, index) => <DraftRow key={index} draft={draft} onChange={(patch) => update(index, patch)} />)}</div><button type="button" disabled={!selected.length || save.isPending} onClick={() => void saveDrafts()} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-extrabold text-white disabled:opacity-50">{save.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}Add {selected.length} to backlog</button></div>}</Modal>
}

const planSchema = z.object({ capacity: z.coerce.number().int().min(1).max(200), focus: z.string().max(300) })
export function PlanSprintDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const mutation = usePlanSprint(projectId)
  const create = useCreateAISprint(projectId)
  const toast = useToastStore((state) => state.addToast)
  const backlog = useBacklog(projectId, {})
  const [plan, setPlan] = useState<{ goal: string; todoIds: string[]; reasoning: string; capacity: number } | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const form = useForm({ resolver: zodResolver(planSchema), defaultValues: { capacity: 20, focus: '' } })
  const submit = form.handleSubmit(async (values) => { try { const result = await mutation.mutateAsync(values); if (result) { setPlan({ goal: result.goal, todoIds: result.todoIds, reasoning: result.reasoning, capacity: values.capacity }); setSelected(result.todoIds) } } catch { /* preserve form */ } })
  const todos = backlog.data?.todos ?? []
  const selectedPoints = selected.reduce((sum, id) => sum + (todos.find((todo) => todo.id === id)?.storyPoints ?? 0), 0)
  const createSprint = async () => { if (!plan || selectedPoints > plan.capacity) return; try { await create.mutateAsync({ goal: plan.goal, todoIds: selected }); toast('Planned sprint created.'); onClose() } catch { /* preserve generated plan */ } }
  return <Modal title="Plan sprint with AI" onClose={onClose}><form onSubmit={submit} className="space-y-4"><Field label="Capacity (story points)" error={form.formState.errors.capacity?.message}><input type="number" min={1} max={200} className={field} {...form.register('capacity')} /></Field><Field label="Focus" error={form.formState.errors.focus?.message}><textarea rows={3} className={`${field} h-auto py-3`} placeholder="What should this sprint prioritize?" {...form.register('focus')} /></Field><button type="submit" disabled={mutation.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground disabled:opacity-60">{mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}Suggest plan</button></form>{plan && <div className="mt-6 border-t border-border pt-5"><Field label="Suggested sprint goal"><textarea value={plan.goal} onChange={(event) => setPlan({ ...plan, goal: event.target.value })} rows={2} className={`${field} h-auto py-3`} /></Field><div className="rounded-xl bg-primary/5 p-3 text-sm font-bold text-foreground">{selectedPoints} / {plan.capacity} points · {Math.max(0, plan.capacity - selectedPoints)} remaining</div><div className="mt-3 space-y-2">{plan.todoIds.map((id) => { const todo = todos.find((item) => item.id === id); if (!todo) return <p key={id} className="text-xs text-muted-foreground">A suggested todo is no longer in the backlog.</p>; return <label key={id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3"><input type="checkbox" checked={selected.includes(id)} onChange={(event) => setSelected((items) => event.target.checked ? [...items, id] : items.filter((item) => item !== id))} /><span className="text-xs font-extrabold text-primary">{todo.key}</span><span className="text-sm font-bold text-foreground">{todo.title}</span><span className="ml-auto text-xs font-bold text-muted-foreground">{todo.storyPoints ?? 0} pts</span></label> })}</div><div className="mt-4 rounded-xl border border-border p-3"><p className="text-xs font-extrabold text-foreground">AI reasoning</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{plan.reasoning}</p></div><button type="button" disabled={!selected.length || selectedPoints > plan.capacity || create.isPending} onClick={() => void createSprint()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-extrabold text-white disabled:opacity-50">Create sprint with {selected.length} todos</button></div>}</Modal>
}

export function SprintSummary({ sprint, onUpdated }: { sprint: Sprint; onUpdated?: (sprint: Sprint) => void }) {
  const mutation = useGenerateSprintSummary(sprint.id)
  const current = sprint.summary
  const generate = async () => { try { const result = await mutation.mutateAsync(); if (result) onUpdated?.(result.sprint) } catch { /* preserve existing summary */ } }
  if (sprint.status === 'planned') return null
  return <section className="mt-6 rounded-2xl border border-primary/20 bg-primary/[0.03] p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-extrabold text-foreground">AI sprint summary</h2></div><button type="button" onClick={() => void generate()} disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground disabled:opacity-50">{mutation.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}{current ? 'Regenerate' : 'Generate summary'}</button></div>{current ? <><div className="mt-4 text-sm leading-7 text-foreground  "><MarkdownRenderer content={current.content} /></div><p className="mt-4 text-xs text-muted-foreground">Generated {new Date(current.generatedAt).toLocaleString()} · {current.source}</p></> : <p className="mt-3 text-sm text-muted-foreground">Generate a review of this sprint’s progress.</p>}<p className="mt-3 text-[11px] text-muted-foreground">AI can make mistakes. Review before saving.</p></section>
}

function DraftRow({ draft, onChange }: { draft: DraftTodo & { selected: boolean }; onChange: (patch: Partial<DraftTodo & { selected: boolean }>) => void }) { return <div className={`rounded-xl border p-3 ${draft.selected ? 'border-primary/30 bg-primary/[0.03]' : 'border-border opacity-60'}`}><div className="flex items-center gap-2"><input type="checkbox" checked={draft.selected} onChange={(event) => onChange({ selected: event.target.checked })} /><input value={draft.title} onChange={(event) => onChange({ title: event.target.value })} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-foreground outline-none" /></div><div className="mt-2 grid grid-cols-3 gap-2"><select value={draft.type} onChange={(event) => onChange({ type: event.target.value as TodoType })} className="rounded-lg border border-border bg-input px-2 py-2 text-xs text-foreground">{todoTypes.map((type) => <option key={type}>{type}</option>)}</select><select value={draft.priority} onChange={(event) => onChange({ priority: event.target.value as TodoPriority })} className="rounded-lg border border-border bg-input px-2 py-2 text-xs text-foreground">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select><select value={draft.storyPoints ?? ''} onChange={(event) => onChange({ storyPoints: event.target.value ? Number(event.target.value) as DraftTodo['storyPoints'] : null })} className="rounded-lg border border-border bg-input px-2 py-2 text-xs text-foreground">{points.map((point) => <option key={point} value={point}>{point || 'No points'}</option>)}</select></div></div> }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])
  return <div className={shell}><div role="dialog" aria-modal="true" className="m-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-extrabold text-foreground">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-muted-foreground hover:bg-background"><X className="h-5 w-5" /></button></div>{children}</div></div>
}
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="block text-sm font-bold text-foreground">{label}{children}{error && <span className="mt-1 block text-xs font-semibold text-destructive">{error}</span>}</label> }
function AIError({ error, retry }: { error: unknown; retry: () => void }) { return <div className="mb-4 flex items-center justify-between rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"><span>{error instanceof ApiError ? error.message : 'AI request failed.'}</span><button type="button" onClick={retry} className="font-extrabold underline">Try again</button></div> }
