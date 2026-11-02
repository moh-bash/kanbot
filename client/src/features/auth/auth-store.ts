import { create } from 'zustand'
import type { User } from '../../types/api'

interface AuthState {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('kanbot_token'),
  user: null,
  setSession: (token, user) => {
    localStorage.setItem('kanbot_token', token)
    set({ token, user })
  },
  clearSession: () => {
    localStorage.removeItem('kanbot_token')
    set({ token: null, user: null })
  },
}))
