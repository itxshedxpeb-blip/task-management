# Run Doc — TaskFlow Frontend Dev Server

## How to Reproduce Uncommitted Artifacts

No special artifacts needed. The `.env` file and `node_modules` already exist in the main checkout.

## How to Run the Server

```bash
cd frontend
npm run dev
```

This starts Next.js dev server with webpack on `http://localhost:3000` (binds to `0.0.0.0`).

- **Framework:** Next.js 16.2.6 with webpack (use `--webpack` flag)
- **Port:** 3000
- **Env:** Uses `.env` in the `frontend/` directory
- **Dependencies:** Already installed (`node_modules` present)
