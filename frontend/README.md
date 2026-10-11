# Smart Expense Manager frontend

React/TypeScript, Vite, and Tailwind. Requires Node.js 22 and npm.

Run npm ci, then npm run dev. The Vite server proxies /api to the local backend; start the API with its dev profile from the parent directory.

Use npm test, npm run lint, and npm run build for verification. Tests cover refresh/session races, sign-out, demo isolation, safe AI text, and CSV escaping. Four Fast Refresh export warnings remain; lint has no errors.

Open ?demo=1 for an isolated sample-data workspace. Live API failures are displayed and are not converted into demo data. Password recovery requires configured backend SMTP. Support and integration previews are not connected services.

See ../README.md and ../docs/IMPLEMENTATION_REPORT.md for full setup, changes, limitations, and deployment checks.
