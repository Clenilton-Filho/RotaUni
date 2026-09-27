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