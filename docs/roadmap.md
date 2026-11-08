# RotaUni — Roadmap

## Current phase

Client-server passenger application: all domain modules are integrated with the remote REST API backend in HTTP mode (master variable `EXPO_PUBLIC_DATA_SOURCE=http`), running in parity with the local mock implementations.

Implemented:

- [x] rides HTTP integration (listing and details, `GET /api/v1/rides`);
- [x] auth HTTP integration (register/login, `POST /api/v1/auth/*`);
- [x] user HTTP integration (profile, `GET /api/v1/users/me`);
- [x] booking HTTP integration (create/active/cancel, `POST /api/v1/bookings`, `GET /bookings/active`, `DELETE /bookings/{id}`);
- [x] history HTTP integration (finalization and history, `POST /api/v1/bookings/{id}/finalize`, `GET /api/v1/rides/history`);
- [x] rating HTTP integration (driver rating, `POST /api/v1/ratings`, `historyId` resolved from history);
- [x] master data-source keying (`EXPO_PUBLIC_DATA_SOURCE`) + per-module overrides + fail-fast + boot logs;
- [x] local prototype features (mock accounts, mock rides, local booking/history/ratings, development reset, logout) — preserved as the `mock` branch.

## Backlog

- [ ] Real authentication with JWT (replace simulated identity via `X-User-Id` and the fake token);
- [ ] Persistent database in the backend (replace in-memory repositories);
- [ ] RotaUni Driver application (separate client; `Ride FINISHED` global completion belongs there).

## Driver application

Create a separate RotaUni Driver application.

Potential functionality:

- driver profile;
- create rides;
- configure destination;
- configure departure time;
- configure capacity;
- configure price/free ride;
- configure stops;
- manage passengers;
- approve/select passengers;
- manage recurring rides;
- global ride completion (`Ride FINISHED`) creating history entries for all passengers.

This functionality does not belong in the current passenger application.

## Later possibilities

Potential future features include:

- recurring rides;
- stops;
- expanded reputation system;
- community-specific deployments;
- notifications;
- chat;
- maps;
- GPS/live location;
- payment integration.

These are future possibilities, not current requirements.

## Important

Do not implement roadmap items automatically.

A roadmap item becomes a requirement only when explicitly requested.
