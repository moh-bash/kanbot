# Kanbot client

The frontend is a React 19 + TypeScript application built with Vite.

## Development

```bash
npm install
npm run dev
```

The API base URL defaults to `http://localhost:4000/api`. Override it with
`VITE_API_URL` in a local `.env` file.

## Architecture choices

- **React Router** owns the route table and guest/private route guards.
- **TanStack Query** is reserved for server state and cache invalidation.
- **React Hook Form + Zod** will provide typed form state and validation.
- **dnd-kit** will provide accessible keyboard and pointer drag-and-drop.
- AI responses use a small safe Markdown renderer that treats response text as
  text and never renders raw HTML.
- **Tailwind CSS** is available through the Vite plugin; foundational styles
  remain in `src/index.css` until the design system is built.
- **lucide-react** provides the icon set without introducing a larger UI
  component library.

## Design system

Kanbot uses Inter with system fallbacks and a semantic token system defined in
`src/index.css`. The brand palette is Indigo `#4F46E5`, Green `#22C55E`, and
Dark Navy `#111827`.

Use semantic Tailwind utilities such as `bg-background`, `bg-surface`,
`text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`,
`bg-secondary`, `text-destructive`, and `ring-ring` instead of hardcoded
colors. Tokens automatically switch between light and dark themes.

`ThemeProvider` supports `light`, `dark`, and `system` preferences. The
preference is stored in `localStorage` under `kanbot_theme`, follows the system
preference by default, and is exposed through `useTheme`. Use `ThemeToggle`
for a consistent accessible theme selector.

Project management uses TanStack Query keys `['projects']` and
`['project', projectId]`. Project CRUD lives in `src/api/projects.ts` and
`src/hooks/useProjects.ts`; pages and dialogs consume those hooks without
duplicating server data in local state. The authenticated project workspace
shell includes Backlog, Board, and Sprints navigation.

AI features live in `src/features/ai/AIComponents.tsx`, with API functions in
`src/api/ai.ts` and mutations/query state in `src/hooks/useAI.ts`. The Ask AI
drawer keeps stateless chat history in memory, resets when its project changes,
and sends the complete conversation on every request. Generated todos and
planned sprints remain editable drafts until the user explicitly confirms
saving. AI status is cached indefinitely through the `['ai', 'status']` query.
Sprint summaries can be generated or regenerated for active and completed
sprints; planned sprints are excluded.
