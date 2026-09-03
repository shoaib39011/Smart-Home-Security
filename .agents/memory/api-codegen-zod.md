---
name: OpenAPI codegen and Zod compatibility
description: Orval's current Zod generator emits Zod 4 top-level helpers such as int().
---

The workspace API codegen currently requires Zod 4 compatibility because generated response schemas use top-level helpers such as `zod.int()`.

**Why:** Keeping the workspace catalog on Zod 3 makes codegen succeed but fails the required library typecheck.

**How to apply:** When expanding the OpenAPI contract, keep the workspace Zod catalog on a compatible Zod 4 release and rerun codegen plus `pnpm run typecheck`.