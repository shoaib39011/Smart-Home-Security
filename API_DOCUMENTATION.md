# API documentation

All endpoints are mounted below `/api`.

## Read endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/healthz` | Service health |
| GET | `/dashboard` | Dashboard totals, recent events, and today's attendance |
| GET | `/camera/status` | Camera telemetry |
| GET | `/users` | Registered users; supports `search` |
| GET | `/users/:id` | User detail |
| GET | `/events` | Events; supports `search`, `eventType`, `status`, and `limit` |
| GET | `/visitors` | Unknown visitor records |
| GET | `/attendance` | Attendance sessions |
| GET | `/lock/status` | Simulated door state |
| GET | `/pins` | Active temporary PIN metadata |
| GET | `/settings` | Security settings |

## Mutations

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/camera/start` | Start camera service |
| POST | `/camera/stop` | Stop camera service |
| POST | `/users` | Create an identity |
| PATCH | `/users/:id` | Update an identity |
| DELETE | `/users/:id` | Disable an identity, retaining audit history |
| POST | `/lock/unlock` | Unlock simulated door |
| POST | `/lock/lock` | Lock simulated door |
| POST | `/emergency/unlock` | Emergency unlock with audit event |
| POST | `/pins` | Create a hashed temporary PIN |
| POST | `/pins/verify` | Verify a PIN and unlock on success |
| DELETE | `/pins/:id` | Revoke a PIN |
| PUT | `/settings` | Save security settings |
| POST | `/alerts/test` | Record a test alert event |

Generated TypeScript hooks are in `lib/api-client-react/src/generated/api.ts`. Request validation schemas are in `lib/api-zod/src/generated/api.ts`.