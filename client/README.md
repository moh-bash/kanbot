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
- **react-markdown** will render AI responses without enabling raw HTML.
- **date-fns** will handle date formatting and comparisons.
- **Tailwind CSS** is available through the Vite plugin; foundational styles
  remain in `src/index.css` until the design system is built.
- **lucide-react** provides the icon set without introducing a larger UI
  component library.

Feature pages are intentionally not implemented yet. The current scaffold
establishes the API boundary, typed backend contract, route table, auth
provider, and query provider for the implementation phases that follow.
