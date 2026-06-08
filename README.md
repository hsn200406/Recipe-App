# RecipeSocial

Live app: [LIVE_APP_URL](https://magical-melba-9488ff.netlify.app/) <!-- replace with real URL -->

## Project Overview

RecipeSocial is a mobile recipe-sharing application built with React Native (Expo) and a Node.js/Express backend using MongoDB. The app provides user accounts, recipe creation, discovery, social interactions (likes, saves, follows), reviews, and basic profile management.

This repository contains two main parts:

- Frontend: React Native + Expo app in the project root (`App.js`, `src/`)
- Backend: Node.js + Express API located under `backend/`

## Quick feature summary

- User registration and login (JWT-based authentication)
- Profile management (name, handle, bio, avatar color, specialty)
- Create, edit, and delete recipes with ingredients, steps, nutrition, and visibility
- Recipe feed with likes, saves, follow, and search/filtering
- Recipe detail view with reviews, nutrition, and sharing
- Local validation for registration and forms; backend re-validation
- Dark mode support and theme context
- Basic notifications screen placeholder and health-check endpoint

## Screens (frontend)

- `LoginScreen` — Sign in / create account flow
- `HomeScreen` — Main feed (recipes)
- `SearchScreen` — Search and filter recipes
- `RecipeDetailScreen` — Full recipe view, reviews, actions
- `CreateScreen` — Multi-step recipe creation (details, ingredients, steps, publish)
- `ProfileScreen` / `EditProfileScreen` — View and edit user profile
- `SavedScreen` — Saved recipes
- `NotificationsScreen` — Placeholder notifications
- `SettingsScreen` — App/account settings

## Installation & running (full-stack)

Prereqs:

- Node.js & npm
- Expo CLI (optional: `npm install -g expo-cli`)
- MongoDB Atlas account or local MongoDB

1. Clone

```bash
git clone <your-repo-url>
cd RecipeSocial
```

2. Frontend dependencies

```bash
npm install
```

3. Backend dependencies

```bash
cd backend
npm install
```

4. Backend environment

Create `backend/.env` (do not commit). Example values:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/recipes
JWT_SECRET=very_long_random_secret
PORT=5000
```

5. Start backend (development)

```bash
cd backend
npm run dev
```

Default backend URL: `http://localhost:5000` (health: `/api/health`).

6. Configure frontend API

Edit `src/services/api.js` and set `API_BASE_URL` to your backend API base (e.g. `http://YOUR_LOCAL_IP:5000/api` for testing on a real device).

7. Start frontend (Expo)

From project root:

```bash
npm start
```

Open with Expo Go (mobile) or an emulator/simulator.

## Environment variables (summary)

- `MONGODB_URI` — MongoDB connection string (backend)
- `JWT_SECRET` — JWT signing secret (backend)
- `PORT` — backend port (optional, defaults used in code)

## API summary (high level)

Key backend routes are under `/api` — examples implemented in `backend/routes/`:

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login → returns JWT
- `GET /api/recipes` — list/search recipes
- `POST /api/recipes` — create recipe (authenticated)
- `GET /api/recipes/:id` — recipe detail
- `POST /api/reviews` — add review (authenticated)

Refer to `backend/routes/` for the full list and parameters.

## Testing keyboard/input UX locally

1. Start backend (`npm run dev` in `backend/`).
2. Start Expo (`npm start` in project root).
3. Open app on device or emulator. Navigate to `Login`, `Create`, `Search`, `Edit Profile`, and `Recipe Detail` screens and verify:
   - Tapping outside inputs dismisses keyboard
   - Next/Done keys move focus between inputs
   - Inputs sit slightly above the keyboard (modern offset)

## Troubleshooting

- If the app cannot reach the backend from a real phone, set `API_BASE_URL` to `http://<your-computer-local-ip>:5000/api` and ensure both devices share a network and firewall allows the connection.
- MongoDB connection errors: confirm `MONGODB_URI` and network access (Atlas IP whitelist or VPC rules).
- If native modules fail on emulator, try clearing Expo cache: `npm start -- --clear`.

## Contributing

Contributions welcome. Please open issues for bugs or feature requests and submit PRs against the `main` branch.
