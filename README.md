# DormLife

An iOS app for boarding students to run day-to-day dorm life: vote on the hall temperature, file maintenance requests, upvote the ones that matter, and get announcements from house staff.

I built DormLife in August and September 2025 for the boarding students at Georgetown Prep, where I boarded in 11th grade. It is a student project, not an official school app.

## What it does

**Students**
- Register with a school email, room number, and graduation year, then sign in (JWT access and refresh tokens, optional Face ID through `expo-local-authentication`)
- Vote on the temperature for their zone and see the current consensus
- Create maintenance requests by category, follow their status, and upvote other students' requests
- Read announcements and manage profile, photo, room, and notification settings

**House staff**
- An admin dashboard to review requests and move them through pending, in progress, resolved, or rejected

## Architecture

```
DormApp/   React Native (Expo SDK 53, TypeScript, Redux Toolkit, React Navigation)
backend/   Node.js + Express (TypeScript), PostgreSQL, Socket.io rooms per school and user
```

| Area | Where |
| --- | --- |
| Auth, JWT issue and refresh | `backend/src/controllers/AuthController.ts`, `backend/src/utils/jwt.ts`, `backend/src/middleware/auth.ts` |
| Temperature voting | `backend/src/controllers/TemperatureController.ts`, `DormApp/src/store/temperatureSlice.ts` |
| Requests and upvotes | `backend/src/routes/requests.ts`, `DormApp/src/store/requestsSlice.ts` |
| Request validation | Joi schemas in `backend/src/middleware/validation.ts` |
| Database schema | `backend/src/database/schema.sql` |

The backend deployed to Railway (`railway.toml`). The app went through EAS builds and App Store Connect setup.

## Run it locally

Backend:

```bash
cd backend
npm install
cp .env.example .env        # fill in your own Postgres URL and JWT secrets
createdb dormlife_dev
npm run db:migrate
npm run dev                 # http://localhost:3000
```

App:

```bash
cd DormApp
npm install
EXPO_PUBLIC_API_URL=http://localhost:3000/api npx expo start
```

## Known limits

- The staff dashboard sits behind a client-side password (`EXPO_PUBLIC_ADMIN_PASSWORD`). The backend already has role checks (`requireRole('admin')`), so the right fix is to gate the dashboard on the signed-in user's role instead.
- `schema.sql` includes tables for events, room bookings, and laundry machines that the app does not use yet.
