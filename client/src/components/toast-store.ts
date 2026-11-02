import { create } from 'zustand'

interface Toast {
  id: number
  message: string
  tone: 'success' | 'error'
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, tone?: Toast['tone']) => void
  removeToast: (id: number) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, tone = 'success') => {
    const id = Date.now()
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
    window.setTimeout(
      () => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      4000,
    )
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
