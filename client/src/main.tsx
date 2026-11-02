import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider queryClient={queryClient}>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
