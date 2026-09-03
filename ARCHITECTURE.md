# Architecture

```text
React + Vite
    ↓ generated React Query client
OpenAPI contract
    ↓
Express service boundary (portable to FastAPI)
    ↓
Security services
    ├── RecognitionService (InsightFace/OpenCV worker seam)
    ├── AttendanceService
    ├── VisitorService
    ├── EventService
    ├── PinService
    ├── AlertService
    └── LockService
            ↓
    LockController interface
            ↓
    SimulatedLockController (Phase 1)
```

## Runtime boundary

The managed workspace uses an Express/TypeScript API service and a React/Vite web artifact. The API contract in `lib/api-spec/openapi.yaml` is the source of truth, and generated clients prevent the frontend from guessing request or response shapes.

## Recognition pipeline target

The production pipeline is intentionally separable:

```text
Camera capture
  → frame processing
  → face detection
  → embedding generation
  → embedding matching
  → liveness verification
  → tracking/debounce
  → event + attendance services
  → lock service
```

Unknown faces never call unlock. Match scores are displayed as match scores rather than uncalibrated confidence percentages.

## Data and privacy

The preview service contains a small in-process demo store so the product is immediately usable. Production deployment should replace it with SQLite or PostgreSQL repositories and object storage for enrollment/evidence images. Store only image paths and metadata in database rows, never raw PINs or SMTP credentials. Disable users instead of deleting them so audit records remain intact.

## Phase 2 hardware integration

Implement the existing controller contract with a transport adapter:

```python
class LockController:
    def lock(self) -> bool: ...
    def unlock(self) -> bool: ...
    def status(self) -> str: ...
```

An Arduino or ESP32 adapter can send newline-delimited `LOCK`, `UNLOCK`, and `STATUS` commands over serial, Wi-Fi, or MQTT. Only the controller implementation changes; recognition, attendance, events, and UI continue to call `LockService`.