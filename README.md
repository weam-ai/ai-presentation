# AI Presentation Generator

Next.js app with an embedded App Router backend (MongoDB + Gemini + PPTX export) and a React frontend for creating and editing presentations.

## Environment variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (default `mongodb://localhost:27017/presentai`) |
| `GEMINI_API_KEY` | Google Gemini API key (required for generation) |
| `GEMINI_MODEL` | Gemini model name (default `gemini-2.0-flash`) |
| `IMAGE_PROVIDER` | `pexels`, `pixabay`, or `none` (default `pexels`) |
| `PEXELS_API_KEY` | Pexels API key (when provider is `pexels`) |
| `PIXABAY_API_KEY` | Pixabay API key (when provider is `pixabay`) |
| `NEXT_PUBLIC_COOKIE_NAME` | iron-session cookie name (must match main app) |
| `NEXT_PUBLIC_COOKIE_PASSWORD` | iron-session password (must match main app) |
| `NEXT_PUBLIC_API_BASE_PATH` | Optional nginx sub-path prefix |

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm typecheck
```

## API endpoints

All routes live under `/api` and use the Node.js runtime.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/presentations` | List presentations for the logged-in user (session cookie) |
| `POST` | `/api/presentations/outline` | Generate an outline from content |
| `POST` | `/api/presentations/from-outline` | Create a presentation from an outline |
| `POST` | `/api/presentations/generate` | Generate and save a full presentation |
| `GET` | `/api/presentations/:id` | Get one presentation |
| `PATCH` | `/api/presentations/:id` | Update title, theme, or slides |
| `DELETE` | `/api/presentations/:id` | Delete a presentation |
| `GET` | `/api/presentations/:id/export/pptx` | Download PPTX export |
| `GET` | `/api/images/search?q=` | Search stock images |
