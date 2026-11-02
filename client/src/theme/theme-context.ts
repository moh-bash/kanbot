import { createContext } from 'react'
import type { ThemePreference } from './ThemeProvider'

export interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: 'light' | 'dark'
  setPreference: (preference: ThemePreference) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
