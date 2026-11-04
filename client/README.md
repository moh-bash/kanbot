# Kanbot Client

Kanbot is a project-planning workspace for turning a todo backlog into
focused, executable sprints. This package is the React frontend: it provides
authentication, project navigation, backlog and sprint workflows, a Kanban
board, and an AI assistant while the backend owns persistence, authorization,
and business rules.

## Features and requirement status

The client currently includes:

- **Authentication**: login and registration forms with native browser
  autocomplete/password-manager semantics, protected routes, token-backed
  sessions, and session-expiration redirects.
- **Projects**: project listing, creation, editing, deletion, project
  switching, and project-scoped navigation.
- **Backlog and todos**: search/filtering, quick creation, details editing,
  field validation, deletion confirmation, labels, priorities, types, points,
  and planned-sprint sections.
- **Sprint management**: planned/active/completed sprint lifecycle views,
  sprint creation with optional dates and goals, default `Sprint N` naming,
  todo movement between eligible destinations, and sprint statistics.
- **Kanban board**: sprint todo columns, status changes, and drag-and-drop
  interactions with keyboard/menu alternatives where available.
- **AI assistant**: project-scoped chat, generated todo drafts, sprint
  planning, explicit confirmation before saving generated changes, and
  mock/real provider status display.
- **Sprint summaries**: generated summaries for active or completed sprints,
  saved-result reuse, regeneration, timestamps, and safe Markdown rendering.
- **Responsive UI and themes**: desktop sidebar, mobile navigation, light and
  dark themes, semantic focus states, and reduced-motion-aware transitions.
- **Routing errors**: separate unknown-route 404, missing-project, network,
  and other project-loading states with retry or navigation actions.

The backlog save/delete/move behavior covers the requested BL-3, BL-4, BL-5,
and BL-7 flows in the client. Sprint creation and the Sprint Details
presentation cover SPR-1 and SPR-7. These are client-side implementations;
end-to-end verification still depends on a running backend and valid session.
Optional drag-from-backlog-to-sprint behavior is not treated as a required
feature.

## Technology stack

- **React 19** and **TypeScript**: component UI with strict type checking.
- **Vite**: development server and production bundling.
- **React Router 8**: public/protected route definitions and navigation.
- **TanStack Query 5**: server-state caching, mutations, invalidation, and
  query synchronization.
- **Axios**: the authenticated HTTP client and API error normalization.
- **React Hook Form**, **Zod**, and `@hookform/resolvers`: form state and
  runtime validation.
- **Tailwind CSS 4** with `@tailwindcss/vite`: utility styling and semantic
  theme tokens.
- **dnd-kit**: accessible drag-and-drop interactions for board workflows.
- **react-markdown**, **remark-gfm**, **rehype-highlight**, and
  **highlight.js**: safe Markdown, GFM, and code-block rendering.
- **Lucide React**: consistent interface icons.
- **Zustand**: the small authentication, toast, and UI stores.
- **GSAP**: selected landing-page and navigation motion.
- **date-fns**: date display and date-related UI helpers.

## UI and design decisions

The UI uses Tailwind CSS utilities backed by CSS custom properties in
`src/index.css`, rather than a component library. This keeps product-specific
surfaces reusable while allowing the same semantic tokens to work in both
themes.

Kanbot uses Manrope with system fallbacks, a cool neutral surface palette,
indigo/electric-blue primary actions, green success states, amber emphasis,
and red destructive states. The light theme uses high-contrast white and
slate surfaces; the dark theme uses layered near-black surfaces. Components
share tokens, focus rings, rounded surface conventions, and compact metadata
patterns.

The layout is responsive by default: the desktop sidebar collapses, while
small screens use an off-canvas menu and stacked content. Motion is limited to
navigation, landing-page reveals, and useful state transitions, and should
respect reduced-motion preferences. Icons are used for compact affordances,
but important actions retain visible labels.

## Project structure

```text
src/
  api/          Axios client and endpoint wrappers
  components/   Shared Markdown, navigation, theme, toast, and UI components
  features/
    ai/         Assistant, generated todos, planning, and summaries
    auth/       Forms, session provider/store, and route guards
    backlog/    Backlog page and task-list interactions
    board/      Sprint Kanban board
    landing/    Public landing page sections
    profile/    Profile page
    projects/   Project list, switcher, and dialogs
    sprints/    Sprint history, details, and lifecycle dialogs
    todos/      Todo detail interactions
  hooks/        TanStack Query hooks and mutation synchronization
  lib/          Small shared library utilities
  theme/        Theme provider and theme context
  types/        API contract types
  App.tsx       Router provider entry component
  main.tsx      React providers and application bootstrap
  router.tsx    Route tree
  router-elements.tsx  Application shell and route-level states
  index.css     Tailwind imports and semantic design tokens
```

`src/types/api.ts` mirrors the backend contract and should not be reformatted
or edited independently of the backend contract. The API wrappers in
`src/api/` are the only request layer.

## Prerequisites

- Node.js compatible with the repository's current Vite and TypeScript
  toolchain.
- npm.
- A running Kanbot backend API. The frontend does not provide the backend,
  database, or AI provider.

The exact dependency versions are recorded in `package.json` and
`package-lock.json`.

## Installation and running

From this directory:

```bash
npm install
npm run dev
```

The Vite development server prints its local URL, normally
`http://localhost:5173`. The backend must be started separately.

Useful checks:

```bash
npm run lint
npm run build
npm run format
npm run format:check
npm run preview
```

`format` targets TypeScript, TSX, CSS, and `package.json` in this client.
The copied API contract is intentionally excluded from formatting. Run
`format:check` in CI or before submitting a change.

## Environment variables

The frontend reads one Vite environment variable:

```dotenv
VITE_API_URL=http://localhost:4000/api
```

`VITE_API_URL` is optional and defaults to
`http://localhost:4000/api`. Vite exposes `VITE_*` values to browser code, so
do not place secrets, database credentials, or AI provider keys in this file.

## Backend integration

The Axios client uses `VITE_API_URL`, sends JSON, and attaches the session
token from `localStorage` as an `Authorization` header. The backend API
returns the response body directly; normalized `ApiError` instances preserve
HTTP status, API error code, message, and field-level details.

TanStack Query owns project, todo, sprint, board, authentication, and AI
server state. Mutations invalidate or update the affected project-scoped
queries so backlog counts, sprint statistics, and destination lists stay
consistent. The frontend follows the existing backend API contract copied in
`src/types/api.ts`; it does not change backend routes or request types.

Authentication is handled by the backend. The client stores only the session
token needed to authenticate requests, clears it on unauthorized responses,
clears the query cache, and redirects to login with a session-expired
message.

## AI configuration

The frontend calls the backend AI endpoints and reads `GET /ai/status` to
show the current mode:

- **Mock AI** is the backend's built-in rule-based mode and does not require
  an external provider credential.
- **AI teammate** mode means the backend has a configured real provider.

AI provider selection, credentials, rate limits, and model configuration
belong to the backend environment, never to the frontend `.env` file. AI
generated todos and sprint plans remain drafts until the user confirms them.

## Known issues and limitations

### Confirmed bugs

No client bug was identified by the lint, formatting, TypeScript, or
production-build checks performed for this version.

### Confirmed limitations

- Real-provider AI flows cannot be fully verified without backend provider
  credentials; mock mode is the safe local option.
- Browser-level authentication, autofill, and drag-and-drop behavior require
  a running backend and an interactive browser session.
- The production bundle currently emits a non-blocking large-chunk warning
  from Vite because the SPA includes the full application and editor/rendering
  dependencies.

### Not claimed as complete

- **Incomplete feature**: end-to-end browser verification is environment
  dependent and is not represented as a passing automated test here.
- Optional drag-and-drop from a backlog section directly into a planned sprint
  is not required for the BL-7 menu/dialog implementation and is not
  documented as supported here.
- This package does not provide backend deployment, database migrations, or
  AI provider setup.

### Optional enhancements

- Add direct drag-and-drop from a backlog section into an eligible planned
  sprint if the existing drag-and-drop architecture can support it without
  duplicating the move mutation.

## Development notes

- Keep TypeScript strictness and the existing API contract intact.
- Prefer feature-local components and hooks; put cross-feature behavior in
  `src/components`, `src/hooks`, or `src/lib`.
- Use TanStack Query for server state. After mutations, invalidate every
  affected project, todo, sprint, board, and detail query rather than
  maintaining a second local copy of server data.
- Preserve `ApiError` status/code handling. In particular, keep 401 session
  expiration separate from 404 resources, network failures, empty states, and
  generic server errors.
- Use the configured Prettier scripts for formatting and ESLint for static
  checks. Avoid formatting `src/types/api.ts`.
- Preserve responsive behavior, visible labels, keyboard access, focus
  states, and light/dark token usage when changing UI.
