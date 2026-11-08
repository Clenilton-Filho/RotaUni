# RotaUni — Architecture

## Architectural goal

The project uses a source-switchable architecture: every domain module has two interchangeable repository implementations (local mock and HTTP backend) behind a stable interface, so the UI never changes when the data source changes.

Current:

```text
React Native UI
    ↓
Hooks
    ↓
Services / Repositories (factories)
    ↓ (KEYING: EXPO_PUBLIC_DATA_SOURCE + module overrides)
Local branch             HTTP branch
    ↓                        ↓
AsyncStorage             HTTP / JSON
(mocks, device data)         ↓
                         Remote REST API
                             ↓
                         server data (persistent database is future work)
```

Both branches run in parity: the 6 domain modules (`rides`, `auth`, `user`, `booking`, `history`, `rating`) are fully implemented in mock and in HTTP. The active source is chosen per factory at import time; hooks and screens never know which one is active.

Directory responsibilities
src/app/

Expo Router routes and screens.

Responsible for:

navigation;
screen composition;
user interaction;
presentation logic.

Screens should avoid direct access to AsyncStorage.

src/components/

Reusable presentation components.

Examples:

ride cards;
reusable UI elements.
src/domain/

Domain types and concepts.

Examples:

user/account types;
session types;
booking types;
rating types;
ride types;
history types.

Domain types should not depend on React Native UI components.

src/hooks/

Hooks used by the UI to interact with application functionality.

Examples:

use-available-rides
use-create-booking
use-finalize-ride
use-rating
use-ride-history
use-ride

Hooks should provide a convenient interface to screens without making screens responsible for persistence details.

src/services/

Repository interfaces, factories, and mock/HTTP implementations plus application services.

Examples:

src/services/auth/
src/services/booking/
src/services/history/
src/services/rating/
src/services/rides/
src/services/user/

Repository interfaces define what the application needs.

Factories (`*.repository.ts`) resolve the active data source and are the ONLY place that reads `EXPO_PUBLIC_*` variables. Implementations live side by side:

`local-*.repository.ts` — mock branch, AsyncStorage-backed;
`http-*.repository.ts` — HTTP branch, calling the remote REST API through the shared `api-client.ts`.

src/state/

Application-wide React state.

AppProvider is responsible for coordinating application state and hydration.

It should not become a replacement for every repository/service.

src/storage/

Persistence infrastructure for the mock branch.

Examples:

storage adapter;
AsyncStorage implementation;
storage keys.

Application code should preferably use the storage abstraction instead of accessing AsyncStorage directly.

Navigation structure

Expo Router route groups:

- (app): authenticated tab area. Three tabs (Caronas / Histórico / Perfil) rendered by the classic Tabs navigator. The tab bar is text-only, with an accent indicator on the active tab and no icons.
- (flows): secondary screens (ride details/reservation, ride finalization, driver rating, profile editing). Keeping them outside the tab group pushes them on the root stack, so the tab bar is hidden and the URLs stay flat (e.g. /caronas/[rideId]).
- (onboarding): login and cadastro.

Both (app) and (flows) layouts contain the same minimal session guard: nothing is rendered until hydration, and without an account/profile the user is redirected to /login.

Secondary screens carry navigation fallbacks: when there is nothing in the navigation stack to go back to (direct URL access), ScreenHeader and secondary back actions replace to a coherent fixed route instead of a no-op back action.

Repository pattern

A repository interface describes application operations without exposing the persistence implementation.

Current resolution, applied per module:

Repository interface
        ↑
        |
Factory (`*.repository.ts`)
        ↓ (override || master || 'mock')
Local implementation        REST implementation

Environment resolution rules:

- master: `EXPO_PUBLIC_DATA_SOURCE` (`'http' | 'mock'`), applies to all modules at once;
- priority: module override (`EXPO_PUBLIC_<MODULE>_DATA_SOURCE`) || master || `'mock'`;
- `EXPO_PUBLIC_API_BASE_URL` is the backend URL (machine IP for physical devices);
- fail-fast: `http` without `EXPO_PUBLIC_API_BASE_URL` throws at boot — never silently fall back to mock in runtime;
- boot logs in `__DEV__` report the active source per module (`[RotaUni] <Module> Data Source: ...`).

The UI should not need to know whether the data came from AsyncStorage or an HTTP API.

Authentication architecture

Authentication concerns are separated into:

Account
Session
Profile
Password material

These concepts should not be merged into a single generic user object unless explicitly justified.

In HTTP mode, session identity reaches the backend as the `X-User-Id` header, resolved from the locally stored session (`LocalSessionRepository`). Authentication is still simulated server-side (token `bearer-token-simulado-<userId>`); real authentication (JWT) is future work.

Current mock persistence

The mock branch uses:

AsyncStorage
    ↓
asyncStorageAdapter
    ↓
Local repositories

Storage keys are centralized in the storage layer.

Backend (remote REST API)

The backend is a remote REST API implementing the same contracts the mock branch serves:

RotaUni Passenger
        ↓
      REST
        ↓
Server backend (in-memory repositories)
        ↓
Database (planned)

RotaUni Driver (planned)
        ↓
      REST
        ↓
Server backend
        ↓
    Database

The Passenger and Driver applications are separate clients of the same backend. Contracts must stay consistent between the backend endpoints and the matching `http-*.repository.ts` files here.
