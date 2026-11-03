import { ArrowRight, Bot, CheckCircle2, ListChecks, Rows3, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import logo from '../../assets/logo/kanbot-logo.svg'
import darkLogo from '../../assets/logo/kanbot-logo-dark.svg'
import { ThemeToggle } from '../../components/ThemeToggle'

const workflow = [
  { title: 'Collect the work', text: 'Keep ideas in one prioritized backlog instead of scattered notes.', icon: ListChecks },
  { title: 'Plan the sprint', text: 'Choose a realistic slice of work and give it a clear finish line.', icon: Rows3 },
  { title: 'Ship with focus', text: 'Move through a calm board and see the work that is actually moving.', icon: CheckCircle2 },
]

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" aria-label="Kanbot home">
          <img src={logo} alt="Kanbot" className="h-9 w-auto dark:hidden" />
          <img src={darkLogo} alt="Kanbot" className="hidden h-9 w-auto dark:block" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-bold text-foreground hover:bg-surface sm:inline-flex">Log in</Link>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground hover:bg-primary-hover">Create account <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20 lg:pb-28 lg:pt-24">
        <div>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-6xl">Your sprint board with an AI teammate.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">Kanbot turns a noisy backlog into a focused plan, then helps you keep momentum until the sprint is done.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-extrabold text-primary-foreground hover:bg-secondary-hover">Start planning for free <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-extrabold text-foreground hover:border-primary">I have an account</Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">A calm home for the work you want to finish.</p>
        </div>
        <ProductPreview />
      </section>

      <section className="border-y border-border bg-surface px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">From first idea to finished sprint.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">The workflow stays visible, so the next decision is always close at hand.</p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {workflow.map(({ title, text, icon: Icon }) => <article key={title} className="border-t-2 border-primary/25 pt-5"><Icon className="h-5 w-5 text-primary" aria-hidden="true" /><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-28">
        <div>
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">Make room for the work that matters.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Use AI to draft todos, shape a sprint, or reflect on what shipped. You stay in control: nothing is saved without your review.</p>
        </div>
        <div className="flex items-center gap-4 border-l-2 border-secondary pl-6">
          <Bot className="h-7 w-7 text-secondary" aria-hidden="true" />
          <div><p className="font-extrabold">Helpful by default</p><p className="mt-1 text-sm text-muted-foreground">Suggestions, not surprises.</p></div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><img src={logo} alt="" className="h-6 w-auto dark:hidden" /><img src={darkLogo} alt="" className="hidden h-6 w-auto dark:block" /><span>© {new Date().getFullYear()} Kanbot</span></div>
          <p>Plan clearly. Ship calmly.</p>
        </div>
      </footer>
    </main>
  )
}

function ProductPreview() {
  return (
    <div className="relative border border-border bg-surface p-4 shadow-xl shadow-primary/10 sm:p-6">
      <div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-xs font-bold text-muted-foreground">PROJECT / NORTHSTAR</p><h2 className="mt-1 text-lg font-extrabold">Sprint 04 · Make it useful</h2></div><span className="rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-extrabold text-secondary">In progress</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PreviewColumn title="To do" items={['Clarify onboarding', 'Add empty state']} />
        <PreviewColumn title="In progress" items={['Draft launch page']} active />
        <PreviewColumn title="Done" items={['Define project goal']} done />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-muted-foreground"><span>8 of 13 points complete</span><span className="inline-flex items-center gap-1.5 text-primary"><Sparkles className="h-3.5 w-3.5" /> AI teammate ready</span></div>
    </div>
  )
}

function PreviewColumn({ title, items, active = false, done = false }: { title: string; items: string[]; active?: boolean; done?: boolean }) {
  return <div className={`min-h-36 bg-background p-3 ${active ? 'ring-1 ring-primary/40' : ''}`}><div className="flex items-center justify-between text-xs font-extrabold"><span>{title}</span><span className="text-muted-foreground">{items.length}</span></div><div className="mt-3 space-y-2">{items.map((item, index) => <div key={item} className="flex items-start gap-2 border border-border bg-surface p-2.5 text-xs font-bold"><span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${done || (active && index === 0) ? 'border-secondary bg-secondary' : 'border-primary/40'}`} />{item}</div>)}</div></div>
}
