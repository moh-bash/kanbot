import { Navigate, Outlet, createBrowserRouter } from 'react-router'
import { GuestRoute, ProtectedRoute } from './features/auth/RouteGuards'
import { LoginPage, RegisterPage } from './features/auth/AuthForms'
import { LandingPage } from './features/landing/LandingPage'
import { AppShell, RoutePlaceholder } from './router-elements'
import { ProjectsPage } from './features/projects/ProjectsPage'
import { BacklogPage } from './features/backlog/BacklogPage'

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/projects', element: <ProjectsPage /> },
              { path: '/projects/:projectId', element: <Navigate to="backlog" replace /> },
              { path: '/projects/:projectId/backlog', element: <BacklogPage /> },
              { path: '/projects/:projectId/board', element: <RoutePlaceholder /> },
              { path: '/projects/:projectId/sprints', element: <RoutePlaceholder /> },
              { path: '/projects/:projectId/sprints/:sprintId', element: <RoutePlaceholder /> },
            ],
          },
        ],
      },
      { path: '*', element: <RoutePlaceholder /> },
    ],
  },
])
