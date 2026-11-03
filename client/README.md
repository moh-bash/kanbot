# Kanbot client

Kanbot is a React 19 + TypeScript frontend for turning a backlog into focused
sprints with an AI teammate.

## Run locally

```bash
npm install
npm run dev
```

The API defaults to `http://localhost:4000/api`. Set `VITE_API_URL` in
`.env` to use another backend. Production checks are:

```bash
npm run lint
npm run build
```

## Architecture

- React Router owns public/private routes and redirect guards.
- TanStack Query owns server state, cache invalidation, and optimistic moves.
- Zustand stores only the JWT session and small UI stores such as toasts.
- React Hook Form and Zod provide typed form validation.
- `src/api/` is the only request layer and `src/types/api.ts` is the API
  contract source of truth.
- dnd-kit provides pointer and keyboard drag-and-drop. Every move also has a
  status or position menu alternative.
- AI Markdown is rendered with `react-markdown`, GFM, and syntax highlighting
  without enabling raw HTML.

## Design direction

Kanbot uses a quiet, high-contrast workspace visual language: indigo
`#4F46E5` for navigation and action, green `#22C55E` for progress, and dark
navy `#111827` for the brand anchor. Semantic tokens in `src/index.css`
support light, dark, and system themes. The landing page uses a left-aligned
product promise, a real interface preview, and a three-step workflow instead
of generic feature-card marketing.

The application shell keeps the project context and primary navigation stable.
At tablet widths the sidebar becomes a compact horizontal navigation, while
boards retain intentional horizontal scrolling. Focus rings, reduced-motion
support, loading states, empty states, retry states, and destructive
confirmations are part of the shared interaction language.

## Included functionality

Authentication, session persistence, protected routes, project CRUD, project
switching, backlog search and filters, quick todo creation, todo details and
deletion, sprint planning and history, active sprint board movement, AI chat,
AI todo generation, AI sprint planning, and sprint summaries are implemented
against the existing backend contract. AI-generated changes remain drafts
until the user explicitly confirms them.

## Known limitations

The backend must be running to verify API flows. Browser-level focus-trap
verification and real-provider AI verification require an interactive browser
session and provider credentials; the frontend build and lint checks do not
prove those external behaviors.
