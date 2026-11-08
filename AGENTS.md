# RotaUni — Agent Instructions

## Project documentation

Before making changes, read the documentation relevant to the task:

- `docs/product-scope.md` — current product scope and prototype limitations.
- `docs/business-rules.md` — intentional business rules and application behavior.
- `docs/architecture.md` — current architecture, project structure, and backend migration approach.
- `docs/roadmap.md` — planned future work and current project phase.

Do not change documented business rules, product scope, or architecture unless the task explicitly requests it.

## Data source and environment rules

The app keys each domain module between local (AsyncStorage) and HTTP (a remote REST API) via Repository Pattern factories — never via hooks or screens:

- `src/services/*/*.repository.ts` = interface + factory; `local-*.repository.ts` (mock) and `http-*.repository.ts` side by side.
- Resolution order per factory: module override (`EXPO_PUBLIC_<MODULE>_DATA_SOURCE`) || master (`EXPO_PUBLIC_DATA_SOURCE`, `'http' | 'mock'`) || `'mock'`.
- Master env: `EXPO_PUBLIC_API_BASE_URL` (backend URL; use the machine IP for physical devices, not `localhost`).
- Fail-fast: if the resolved source is `http` and `EXPO_PUBLIC_API_BASE_URL` is missing, throw at boot. Never silently fall back to mock in runtime.
- Boot logs in `__DEV__`: each factory logs `[RotaUni] <Module> Data Source: HTTP (url)` or `MOCK`.
- All 6 modules are HTTP-capable: `rides`, `auth`, `user`, `booking`, `history`, `rating`.
- The Profile reset is mode-aware: in `http` it only clears the local session (server data stays); in `mock` it clears device data.

Do not change factory logic, error contract, or environment resolution unless the task explicitly requests it.

## Mandatory verification commands

Run after any code change (all must pass):

```bash
npx tsc --noEmit
npm run lint
```

Use `npx expo start -c` to restart the bundler (required whenever `EXPO_PUBLIC_*` variables change, since they are inlined at boot).

## Expo

Read the exact versioned Expo SDK 57 documentation at:
https://docs.expo.dev/versions/v57.0.0/

Before writing or modifying Expo-related code, consult the relevant documentation.