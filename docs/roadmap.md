# RotaUni — Roadmap

## Current phase

Local-first passenger prototype.

Implemented:

- local account registration;
- local authentication;
- local session;
- user profile;
- mocked ride listing;
- ride details;
- local booking;
- booking cancellation;
- ride finalization;
- local ratings;
- ride history;
- development reset;
- logout.

## Next phase

Backend migration:

- Spring Boot backend;
- REST API;
- remote authentication;
- database;
- shared ride data;
- shared booking state;
- shared ratings;
- multiple devices communicating through the backend.

The backend will initially run on the local network during development.

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
- manage recurring rides.

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