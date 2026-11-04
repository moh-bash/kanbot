import { create } from "zustand";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
  undo?: () => Promise<void>;
  undoPending?: boolean;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, tone?: Toast["tone"]) => void;
  addUndoToast: (message: string, undo: () => Promise<void>) => void;
  undoToast: (id: number) => Promise<void>;
  removeToast: (id: number) => void;
}

let nextToastId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, tone = "success") => {
    const id = nextToastId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 4000);
  },
  addUndoToast: (message, undo) => {
    const id = nextToastId++;
    set((state) => ({
      toasts: [...state.toasts, { id, message, tone: "success", undo }],
    }));
    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 7000);
  },
  undoToast: async (id) => {
    const toast = get().toasts.find((item) => item.id === id);
    if (!toast?.undo || toast.undoPending) return;
    
    set((state) => ({
      toasts: state.toasts.map((item) =>
        item.id === id ? { ...item, undoPending: true } : item,
      ),
    }));
    
    try {
      await toast.undo();
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to undo this action.";
      set((state) => ({
        toasts: state.toasts.map((item) =>
          item.id === id
            ? {
                id,
                message,
                tone: "error" as const,
              }
            : item,
        ),
      }));
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
