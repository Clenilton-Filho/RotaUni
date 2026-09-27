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
- The current booking stores a reference to the selected ride rather than duplicating the complete ride object.

## Ride finalization

A ride must be finalized before it can be rated.

The finalization flow is:

```text
Active booking
    ↓
Finalize
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
Ratings are associated with the user and ride.
Ratings are preserved after logout.
Ratings are preserved after the booking is finalized.
History
History contains finalized rides only.
Cancelled bookings do not appear in history.
History entries reference the ride instead of storing a complete duplicate of the ride.
Historical rides can be opened after finalization.
A historical ride can be rated later if it has not already been rated.
Reset

The development reset functionality is intentionally different from logout.

Logout:

clears the current session;
clears the active booking;
preserves accounts;
preserves profiles;
preserves history;
preserves ratings.

Development reset:

clears local accounts;
clears profiles;
clears session;
clears active booking;
clears history;
clears ratings.

Do not use development reset behavior as the implementation of normal logout.