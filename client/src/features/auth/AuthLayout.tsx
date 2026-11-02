import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import logo from '../../assets/logo/kanbot-logo.svg'
import darkLogo from '../../assets/logo/kanbot-logo-dark.svg'
import { ThemeToggle } from '../../components/ThemeToggle'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="inline-flex items-center" aria-label="Kanbot home">
          <img src={logo} alt="Kanbot" className="h-10 w-auto dark:hidden" />
          <img src={darkLogo} alt="Kanbot" className="hidden h-10 w-auto dark:block" />
        </Link>
        <ThemeToggle />
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1fr_440px]">
        <div className="hidden max-w-xl lg:block">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-primary">Your calm command center</p>
          <h1 className="max-w-lg text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground">Turn a busy backlog into your next clear move.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">Kanbot keeps your work focused with simple sprints and an AI teammate that helps you plan.</p>
          <ul className="mt-8 space-y-4 text-sm font-semibold text-foreground">
            {['A focused backlog for everything you want to ship', 'Sprints that fit your real capacity', 'An AI teammate for planning and reflection'].map((item) => (
              <li key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden="true" />{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-7 shadow-xl shadow-primary/10 sm:p-9">
          <div className="mb-8"><h2 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>
          {children}
          <div className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </section>
    </main>
  )
}
