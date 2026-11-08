## Product

RotaUni is a university ridesharing application.

The current project implements the passenger application. It is source-switchable: every domain module runs either with local mock data (AsyncStorage) or integrated with a remote REST API backend over HTTP (master variable `EXPO_PUBLIC_DATA_SOURCE=http`), both branches in parity.

The application allows a passenger to:

- create an account (local in mock mode; `POST /api/v1/auth/register` in HTTP mode);
- create and maintain a profile (`GET /api/v1/users/me` in HTTP mode);
- log in (local in mock mode; `POST /api/v1/auth/login` in HTTP mode);
- view available rides (mock data in mock mode; `GET /api/v1/rides` in HTTP mode);
- inspect ride and driver information;
- choose a ride;
- cancel an active booking;
- finalize a ride;
- rate a driver after finalization;
- view completed rides in history.

## Current passenger flow

```text
Cadastro
  ↓
Login
  ↓
Home
  ↓
Lista de caronas
  ↓
Detalhes da carona
  ↓
Escolher carona
  ↓
Detalhes da reserva ativa
  ↓
Carona ativa
  ↓
Finalizar carona
  ↓
Carona finalizada
  ↓
Avaliar motorista
  ↓
Histórico

Rating is optional after finalization.

Ride information

Rides may contain:

ride ID;
driver ID;
driver name;
driver rating;
vehicle;
vehicle color;
departure time;
origin;
destination;
total capacity;
confirmed passenger count;
confirmed passenger names;
optional price.

In HTTP mode this shape comes from the remote REST API byte-compatible with the mock data (same JSON contract).
Current authentication

Authentication is simulated (no OAuth, Firebase, or a real security framework yet).

In mock mode it is entirely local to the device; passwords use salted iterative SHA-256.

In HTTP mode the backend holds the accounts (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`, returning the simulated token `bearer-token-simulado-<userId>`) and the local session is forwarded as the `X-User-Id` header on authenticated calls.

Current persistence

Mock mode persists data locally using the project's storage abstraction backed by AsyncStorage.

HTTP mode delegates persistence to the server backend in-memory repositories (no database yet; account passwords are plain text server-side until persistence becomes real).

Current limitations

The current passenger application does NOT implement:

real authentication with JWT (identity is simulated via `X-User-Id`);
a persistent backend database (the server holds data in memory);
GPS;
maps;
live location;
trip simulation;
navigation;
chat;
payments;
push notifications;
real-time synchronization;
automatic ride matching;
real driver data;
driver application;
complex recommendation algorithms.

Do not implement these features unless explicitly requested.

Separate future application

The future driver product will be a separate application:

RotaUni Passenger
RotaUni Driver

They are (and will remain) separate clients of the same server backend.

The current passenger application should not introduce driver-mode screens unless explicitly requested.
