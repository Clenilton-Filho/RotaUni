# RotaUni — Architecture

## Architectural goal

The project uses a local-first architecture that should allow the persistence mechanism to be replaced by a backend later without requiring major changes to the UI.

Current:

```text
React Native UI
    ↓
Hooks
    ↓
Services / Repositories
    ↓
Storage
    ↓
AsyncStorage

Future:

React Native UI
    ↓
Hooks
    ↓
Services / Repositories
    ↓
HTTP / JSON
    ↓
Spring Boot
    ↓
Database
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

Repository interfaces and implementations plus application services.

Examples:

src/services/auth/
src/services/booking/
src/services/history/
src/services/rating/
src/services/rides/

Repository interfaces define what the application needs.

Local implementations provide the current persistence mechanism.

src/state/

Application-wide React state.

AppProvider is responsible for coordinating application state and hydration.

It should not become a replacement for every repository/service.

src/storage/

Persistence infrastructure.

Examples:

storage adapter;
AsyncStorage implementation;
storage keys.

Application code should preferably use the storage abstraction instead of accessing AsyncStorage directly.

Navigation structure

Expo Router route groups:

- (app): authenticated tab area. Three tabs (Caronas / Histórico / Perfil) rendered by the classic Tabs navigator. The tab bar is text-only, with an accent indicator on the active tab and no icons.
- (flows): secondary screens (ride details, booking confirmation, ride finalization, driver rating, profile editing). Keeping them outside the tab group pushes them on the root stack; the tab bar of the navigator is restored there by the presentational PersistentTabBar component, so the bottom bar stays visible on every authenticated screen. It occupies space in the layout (no overlap), reuses the tab-bar visual, and switching tabs from a secondary screen replaces the screen (no extra history entries).
- (onboarding): login and cadastro.

Tab highlight on secondary screens comes from the origin tab declared per screen: Caronas origin for ride details, confirmation, finalization and rating; Histórico origin for history details; Perfil origin for profile editing. Rating opened later from the history detail screen keeps the documented Caronas fallback. Direct URL access uses the same declared fallback.

Profile editing intercepts tab switches: clean forms switch immediately; a form with unsaved changes shows the existing discard dialog (cancel keeps editing and values; confirm discards and switches).

Both (app) and (flows) layouts contain the same minimal session guard: nothing is rendered until hydration, and without an account/profile the user is redirected to /login.

Secondary screens carry navigation fallbacks: when there is nothing in the navigation stack to go back to (direct URL access), ScreenHeader and secondary back actions replace to a coherent fixed route instead of a no-op back action.

Repository pattern

A repository interface describes application operations without exposing the persistence implementation.

Example:

Repository interface
        ↑
        |
Local implementation

Later:

Repository interface
        ↑
        |
REST implementation

The UI should not need to know whether the data came from AsyncStorage or an HTTP API.

Authentication architecture

Authentication concerns are separated into:

Account
Session
Profile
Password material

These concepts should not be merged into a single generic user object unless explicitly justified.

Current local persistence

The current prototype uses:

AsyncStorage
    ↓
asyncStorageAdapter
    ↓
Local repositories

Storage keys are centralized in the storage layer.

Backend migration

The planned backend is Java + Spring Boot.

The intended future architecture is:

RotaUni Passenger
        ↓
      REST
        ↓
Spring Boot
        ↓
     Database

RotaUni Driver
        ↓
      REST
        ↓
Spring Boot
        ↓
     Database

The Passenger and Driver applications are separate clients of the same backend.