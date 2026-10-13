# JobTracker

JobTracker is a React and Express application for managing job applications.

## Local configuration

Copy `.env.example` to `.env` for the Vite client, and copy
`server/.env.example` to `server/.env` for the API. Replace placeholder values;
never commit either real `.env` file.

The backend requires `MONGO_URI` and `JWT_SECRET`. Production additionally
requires an explicit comma-separated `CORS_ORIGINS` allowlist and a JWT secret
of at least 32 characters. The frontend uses `VITE_API_URL` for the API base
URL and falls back to `http://localhost:4000/api` during local development.

Run the API with `npm run dev` from `server/`, and the client with `npm run dev`
from the repository root.

Authentication rate limits use an in-memory store. This is appropriate for one
small API instance, but a shared external store is required before scaling to
multiple instances so limits remain consistent across processes.

## Validation

- `npm run lint` from the repository root
- `npm run build` from the repository root
- `npm test` from `server/`

## Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
