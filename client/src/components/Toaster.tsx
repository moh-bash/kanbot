import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useToastStore } from './toast-store'

export function Toaster() {
  const { toasts, removeToast } = useToastStore()
  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-sm font-semibold text-foreground shadow-lg">
          {toast.tone === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />}
          <span className="flex-1">{toast.message}</span>
          <button type="button" className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      ))}
    </div>
  )
}
