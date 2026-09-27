## Product

RotaUni is a university ridesharing application.

The current project implements the passenger application as a local-first prototype.

The application allows a passenger to:

- create a local account;
- create and maintain a local profile;
- log in locally;
- view available mocked rides;
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
Confirmação
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

The current mocked rides may contain:

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
Current authentication

Authentication is local to the device.

The current prototype does not use:

a remote authentication server;
OAuth;
Firebase Authentication;
a backend authentication API.

Passwords are not stored as plaintext.

Current persistence

The prototype persists local application data using the project's storage abstraction backed by AsyncStorage.

The current prototype persists user-specific information locally.

Current prototype limitations

The current passenger application does NOT implement:

backend;
REST API;
remote database;
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

They will eventually communicate through a shared backend.

The current passenger application should not introduce driver-mode screens unless explicitly requested.