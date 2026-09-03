# Sentinel/home

Sentinel/home is an AI-ready smart home security cockpit for a laptop or local network. It gives a homeowner a clear view of camera health, authorized identities, unknown visitor evidence, attendance, access events, temporary PINs, and a software-simulated front-door lock.

## What is included

- Responsive security dashboard with live API-backed status
- Camera start/stop telemetry surface
- Guided face-enrollment workflow with multi-image selection
- Registered user create, edit, view, and disable flows
- Unknown visitor review records
- Attendance time-in / time-out view
- Searchable event history with evidence details
- Securely hashed temporary PIN creation, verification, expiry, usage limits, and revocation
- Lock, unlock, emergency unlock, and auto-lock state transitions
- Security settings and test-alert action
- OpenAPI contract with generated React Query and Zod clients
- Phase 2-ready separation between recognition, services, and lock control

## Technology

- React, Vite, TypeScript, Wouter, Tailwind CSS
- Express 5 API service in the shared workspace runtime
- OpenAPI + Orval-generated typed client
- Zod request validation
- Node crypto for secure PIN hashing and generation

The source contract and service boundary are intentionally portable. A Python companion can later host the InsightFace/OpenCV worker and FastAPI routes without changing the React API client or the lock abstraction.

## Run

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/smart-home-security run dev
```

The managed workflows in Replit start both services automatically. Open the root preview to use the cockpit.

## API

FastAPI-style interactive documentation is represented by the OpenAPI contract at `lib/api-spec/openapi.yaml`. The running service exposes the same routes under `/api`.

Regenerate typed clients after contract changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Testing and checks

```bash
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/smart-home-security run typecheck
pnpm run typecheck
```

## Phase 1 limitations

This build uses a simulated camera telemetry feed and simulated lock controller in the local preview. The API and UI are real, but connecting a laptop webcam to InsightFace/OpenCV and persisting evidence files requires the Python computer-vision worker described in `ARCHITECTURE.md`.

## Phase 2 hardware path

The recognition layer should call `LockService`, not a physical device. Replace `SimulatedLockController` with an `ArduinoLockController`, `ESP32LockController`, or GPIO/relay implementation that supports `LOCK`, `UNLOCK`, and `STATUS`. The face-recognition and React layers remain unchanged.