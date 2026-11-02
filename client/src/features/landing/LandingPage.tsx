import { ArrowRight, Bot, CheckCircle2, ListChecks, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import type { ReactNode } from 'react'
import logo from '../../assets/logo/kanbot-icon.png'
import { ThemeToggle } from '../../components/ThemeToggle'

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center" aria-label="Kanbot home">
          <img src={logo} alt="Kanbot" className="h-10 w-auto" />
          <h1 className="ml-3 text-xl font-bold tracking-tight text-foreground">Kanbot</h1>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-surface focus:outline-none focus:ring-4 focus:ring-ring sm:inline-flex">Log in</Link>
          <Link to="/register" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-ring">Create account</Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-primary"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Focused work, less noise</p>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.04] tracking-[-0.05em] text-foreground sm:text-6xl">Make progress feel <span className="text-primary">simple.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">A personal sprint board that turns your backlog into a clear plan — with an AI teammate when you need a little momentum.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-extrabold text-primary-foreground transition hover:bg-secondary-hover focus:outline-none focus:ring-4 focus:ring-ring">Start for free <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-extrabold text-foreground transition hover:border-primary focus:outline-none focus:ring-4 focus:ring-ring">I have an account</Link>
          </div>
          <p className="mt-5 text-xs font-semibold text-muted-foreground">No teams. No busywork. Just your next best move.</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative rounded-3xl border border-border bg-surface p-5 shadow-xl shadow-primary/10 sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">This sprint</p><h2 className="mt-1 text-xl font-extrabold">Ship the essentials</h2></div>
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-extrabold text-secondary">6 days left</span>
            </div>
            <div className="mt-5 space-y-3">
              {['Set up your project foundation', 'Write the first user flow', 'Review the launch checklist'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border px-4 py-4"><CheckCircle2 className={`h-5 w-5 ${index === 0 ? 'text-secondary' : 'text-disabled'}`} aria-hidden="true" /><span className={`text-sm font-bold ${index === 0 ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item}</span></div>)}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat icon={<ListChecks />} value="12" label="todos" />
              <MiniStat icon={<Bot />} value="68%" label="complete" />
              <MiniStat icon={<Sparkles />} value="3" label="AI ideas" />
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-surface/70 px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <Feature title="A backlog you can trust" text="Keep every idea visible, ordered, and ready for the next sprint." icon={<ListChecks />} />
          <Feature title="Sprints with a finish line" text="Choose work that fits your capacity and see what progress looks like." icon={<CheckCircle2 />} />
          <Feature title="An AI teammate" text="Generate todos, plan a sprint, and learn from what you shipped." icon={<Bot />} />
        </div>
      </section>
    </main>
  )
}

function MiniStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="rounded-xl bg-background p-3"><span className="text-primary">{icon}</span><p className="mt-2 text-lg font-extrabold">{value}</p><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p></div>
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <article className="rounded-2xl border border-border bg-surface p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div><h2 className="text-base font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>
}
