# RotaUni — Business Rules

These rules describe intentional application behavior.

Do not change them unless the task explicitly requests a change to the corresponding rule.

## Accounts

- Each account has a unique normalized email.
- Email comparison is case-insensitive.
- An account has one associated user profile.
- Account credentials are separate from the user profile.
- Passwords must never be stored as plaintext.

## Passwords

- Password material is generated using a random salt.
- Password derivation uses SHA-256 iteratively.
- The current password iteration count is defined by `PASSWORD_ITERATIONS`.
- The password salt, derived hash, and iteration count are stored as password material.
- Password verification derives the candidate password using the stored salt and iteration count and compares the result with the stored hash.

Do not replace this mechanism with plaintext passwords or a single unsalted SHA-256 operation.

## Sessions

- Only one local session is active at a time.
- A session identifies the account through `accountId`.
- Session persistence is handled through `SessionRepository`.
- The current local implementation uses `LocalSessionRepository`.
- In HTTP mode, the `accountId` from the local session is sent to the backend as the `X-User-Id` header (simulated server identity; backend falls back to a default test user when the header is missing).
- Logout clears the current session.
- Logout also removes the active booking in the current prototype.
- Logout does not delete completed ride history.
- Logout does not delete ratings.
- Logout does not delete the account.

## Profiles

A user profile is separate from the authentication account.

The profile contains user-facing information such as:

- name;
- university/faculty;
- campus.

Authentication credentials must not be treated as profile data.

## Rides

- Current rides are mocked/local data.
- Mock rides are shared device data rather than being owned by one local account.
- A ride may have a destination, departure time, capacity, confirmed passengers and optional price.
- The passenger chooses among available rides.

## Bookings

- A user can have at most one active booking.
- Creating a second active booking is invalid, even if it refers to a different ride.
- `BookingAlreadyExistsError` represents this intentional business rule.
- An active booking can be cancelled.
- Cancelling a booking removes the active booking.
- A cancelled booking does not create ride history.
- Finalizing a booking removes the active booking.
- Finalizing a booking creates a history entry.
- In HTTP mode, booking creation is decided by the backend: a full ride is rejected (400), creating the seat-occupancy state server-side; cancellation returns the seat to the ride; passenger finalization does not return the seat.
- The current booking stores a reference to the selected ride rather than duplicating the complete ride object.

## Ride finalization

A ride must be finalized before it can be rated.

Two finalizations exist and are different:

Passenger finalization (the only one implemented today):

- `POST /api/v1/bookings/{id}/finalize` transitions the Booking status to `COMPLETED`;
- it creates the passenger's individual history entry;
- it does NOT release the ride seat;
- it enables rating the driver (see Ratings).

Driver global completion (`Ride FINISHED`):

- belongs to the future Driver application;
- will end the ride globally and create history entries for all its passengers;
- do not implement it inside passenger endpoints.

The passenger flow is either mode (mock/HTTP identical in effect):

```text
Active booking
    ↓
Finalize (Booking → COMPLETED)
    ↓
Remove active booking
    ↓
Create history entry
    ↓
Show finalized ride screen
Ratings
Only finalized rides can be rated.
Active rides cannot be rated.
Cancelled rides cannot be rated.
A user can create at most one rating for a given ride.
In HTTP mode this single-rating rule is enforced by the backend (`POST /api/v1/ratings` rejects a second evaluation with 400 "Carona já avaliada.").
In HTTP mode the rating is linked to the backend history entry (`historyId`), even though the front keeps treating it by `rideId`.
Ratings are preserved after logout.
Ratings are preserved after the booking is finalized.
History
History contains finalized rides only.
Cancelled bookings do not appear in history.
History entries reference the ride instead of storing a complete duplicate of the ride.
Historical rides can be opened after finalization.
A historical ride can be rated later if it has not already been rated.
Reset

The development reset functionality is intentionally different from logout, and it is data-source aware (Profile screen).

Logout (both modes):

clears the current session;
clears the active booking;
preserves accounts;
preserves profiles;
preserves history;
preserves ratings.

Development reset (Profile screen):

In mock mode (local data):

clears local accounts;
clears profiles;
clears session;
clears active booking;
clears history;
clears ratings.

In HTTP mode (server data):

clears the local session only;
server-side data (accounts, profiles, bookings, history, ratings) is NOT deleted because it belongs to the backend;
server-side cleanup requires a backend-provided mechanism (none exists today; restarting the backend resets its in-memory state).

The confirm dialog states explicitly what will be cleared in the active mode. Do not use development reset behavior as the implementation of normal logout.