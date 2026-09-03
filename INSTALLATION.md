# Installation

## Replit

1. Run `pnpm install`.
2. Start the managed API and web workflows.
3. Open the root preview.

## Local development

Requirements: Node.js 20+, pnpm 10+, and a modern browser.

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
```

In a second terminal:

```bash
pnpm --filter @workspace/smart-home-security run dev
```

The API listens on the workflow-provided port and the UI uses the `/api` service path. Do not hard-code localhost URLs in the frontend.

## Optional computer-vision worker

The future local worker may use Python 3.11+, OpenCV, InsightFace, NumPy, FastAPI, and SQLAlchemy. See `requirements.txt` for the companion dependency set. Model downloads and camera permissions are machine-specific and are intentionally not required to run the dashboard preview.

## Troubleshooting

- If the preview is blank, restart both managed workflows and inspect their logs.
- If the API is unavailable, check `/api/healthz`.
- If a PIN has expired or reached its usage limit, create a new one; plaintext is shown only at creation time.
- Restarting the API resets the current in-memory demo records.