import { Link, Outlet, useLocation, useParams } from 'react-router'
import { LayoutDashboard, ListChecks, LogOut, PanelsTopLeft, Rows3 } from 'lucide-react'
import { useAuth } from './features/auth/useAuth'
import { useTheme } from './theme/useTheme'
import { ThemeToggle } from './components/ThemeToggle'
import { ProjectSwitcher } from './features/projects/ProjectSwitcher'
import logo from './assets/logo/kanbot-logo.svg'
import darkLogo from './assets/logo/kanbot-logo-dark.svg'

export function AppShell() {
  const { projectId } = useParams()
  const { user, logout } = useAuth()
  const location = useLocation()
  const { resolvedTheme } = useTheme()
  const inProject = Boolean(projectId)
  const navItems = projectId ? [
    { label: 'Backlog', icon: ListChecks, to: `/projects/${projectId}/backlog` },
    { label: 'Board', icon: LayoutDashboard, to: `/projects/${projectId}/board` },
    { label: 'Sprints', icon: Rows3, to: `/projects/${projectId}/sprints` },
  ] : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-surface px-5 py-6 lg:flex">
        <Link to="/projects" className="mb-8 flex items-center" aria-label="Kanbot projects">
          <img src={logo} alt="Kanbot" className="h-9 w-auto dark:hidden" />
          <img src={darkLogo} alt="Kanbot" className="hidden h-9 w-auto dark:block" />
        </Link>
        <ProjectSwitcher />
        {inProject && <nav className="mt-8 space-y-1" aria-label="Project navigation">{navItems.map(({ label, icon: Icon, to }) => <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${location.pathname === to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>)}</nav>}
        <div className="mt-auto border-t border-border pt-5">
          <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">{user?.name.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-extrabold text-foreground">{user?.name}</p><p className="truncate text-xs text-muted-foreground">{user?.email}</p></div></div>
          <button type="button" onClick={logout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3"><PanelsTopLeft className="h-5 w-5 text-primary" aria-hidden="true" /><div><p className="text-sm font-extrabold text-foreground">{inProject ? 'Project workspace' : 'Projects'}</p><p className="hidden text-xs text-muted-foreground sm:block">{inProject ? 'Plan, prioritize, and make progress.' : 'Your personal workspaces.'}</p></div></div>
          <div className="flex items-center gap-3"><ThemeToggle /><button type="button" onClick={logout} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground lg:hidden" aria-label="Log out"><LogOut className="h-4 w-4" /></button><span className="hidden text-xs text-muted-foreground sm:inline">{resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'}</span></div>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}

export function RoutePlaceholder() {
  return null
}
