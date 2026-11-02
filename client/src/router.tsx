import { Navigate, createBrowserRouter } from 'react-router'
import { GuestRoute, ProtectedRoute } from './features/auth/RouteGuards'
import { AppShell, RoutePlaceholder } from './router-elements'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <RoutePlaceholder /> },
          { path: '/register', element: <RoutePlaceholder /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <Navigate to="/projects" replace /> },
          { path: '/projects', element: <RoutePlaceholder /> },
          { path: '/projects/:projectId', element: <Navigate to="backlog" replace /> },
          { path: '/projects/:projectId/backlog', element: <RoutePlaceholder /> },
          { path: '/projects/:projectId/board', element: <RoutePlaceholder /> },
          { path: '/projects/:projectId/sprints', element: <RoutePlaceholder /> },
          { path: '/projects/:projectId/sprints/:sprintId', element: <RoutePlaceholder /> },
        ],
      },
      { path: '*', element: <RoutePlaceholder /> },
    ],
  },
])
