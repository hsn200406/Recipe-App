# RecipeSocial — Setup Guide
## Expo SDK 54 · React Native 0.76 · Navigation v7

---

## Prerequisites — Install Once

| Tool | Download | Verify |
|------|----------|--------|
| **Node.js 18+** | https://nodejs.org → "LTS" | `node -v` |
| **Expo Go app** | App Store → search "Expo Go" | open it |

---

## Step 1 — Unzip the Project

Unzip `RecipeSocial.zip` anywhere you like, then open a terminal inside the folder:

```bash
cd path/to/RecipeSocial
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

Takes 1–3 minutes. A `node_modules/` folder appears — this is normal and expected.

---

## Step 3 — Start the Dev Server

```bash
npx expo start
```

You will see a QR code printed in the terminal, like this:

```
› Metro waiting on exp://192.168.1.42:8081
```

---

## Step 4 — Open on Your iPhone

1. Your iPhone and laptop **must be on the same Wi-Fi network**
2. Open your iPhone **Camera app**
3. Point it at the **QR code** in the terminal
4. Tap the yellow **"Open in Expo Go"** banner
5. The app loads live on your phone ✅

> **If the QR code doesn't work:** In the Expo Go app tap "Enter URL manually"
> and type the `exp://192.168.x.x:8081` address shown in your terminal.

> **On a restricted network (university Wi-Fi, etc.):**
> Run `npx expo start --tunnel` instead — this routes through a public relay
> and works on any network.

---

## Making Changes

Save any file → your phone updates instantly (Hot Reload).

- **Shake your phone** → opens dev menu (reload, inspect, etc.)
- **`r` in terminal** → force full reload
- **`ctrl+c`** → stop the server

---

## Project Structure

```
RecipeSocial/
├── App.js                             ← Root: wraps everything in providers
├── app.json                           ← Expo config (SDK version, permissions)
├── package.json                       ← All dependencies (SDK 54 aligned)
├── babel.config.js
│
└── src/
    ├── context/
    │   ├── ThemeContext.js            ← Dark/light mode + full color palette
    │   └── AuthContext.js            ← JWT login/logout via expo-secure-store
    │
    ├── data/
    │   └── mockData.js               ← 7 recipes, 4 creators, notifications (mock)
    │
    ├── services/
    │   └── api.js                    ← Every backend endpoint pre-written
    │
    ├── components/
    │   └── SharedComponents.js       ← Avatar, Pill, Stars, MacroBar, Toggle…
    │
    ├── navigation/
    │   └── RootNavigator.js          ← Tab bar + stack navigator
    │
    └── screens/
        ├── HomeScreen.js             ← Feed (For You + Following), recommendations
        ├── SearchScreen.js           ← Search + cuisine/meal/macro filters
        ├── CreateScreen.js           ← 4-step form, video upload, AI capture
        ├── SavedScreen.js            ← Bookmarked recipes
        ├── ProfileScreen.js          ← Your profile, stats, recipes, liked
        ├── RecipeDetailScreen.js     ← Full recipe: ingredients/steps/reviews
        ├── CreatorScreen.js          ← Creator bio, featured recipes, follow
        ├── NotificationsScreen.js    ← Likes/follows/comments/shares
        ├── SettingsScreen.js         ← Dark mode toggle + all settings
        └── LoginScreen.js            ← Sign in / Create account / Guest
```

---

## Connecting a Real Backend

When you're ready to wire up your Node/Express API:

### 1. Find your laptop's local IP

**Mac:** System Preferences → Network → Wi-Fi → IP Address
**PC:** Run `ipconfig` in Command Prompt → IPv4 Address

It will look like `192.168.1.42`.

### 2. Update the API URL

Open `src/services/api.js` and change line 1:

```js
export const API_BASE_URL = 'http://192.168.1.42:5000/api';
//                                    ↑ your actual IP
```

> ⚠️ Do NOT use `localhost` — your phone can't reach your laptop's localhost.
> You must use the LAN IP address, and both devices must be on the same Wi-Fi.

### 3. Replace mock data with API calls

Each screen imports from `../data/mockData`. When you have a backend running,
swap those out for the pre-written calls in `src/services/api.js`:

```js
// Before (mock):
import { RECIPES } from '../data/mockData';

// After (real backend):
import { recipeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { token } = useAuth();
const recipes = await recipeAPI.getFeed(token);
```

---

## APIs You Need to Sign Up For

These are for the AI features (stretch goal). All free tiers available.

### Google Vision API (ingredient scanning)
1. Go to https://console.cloud.google.com
2. Create a project → Enable **"Vision API"**
3. Go to **Credentials** → **Create Credentials** → **API Key**
4. Add to your **backend** `.env`:
   ```
   GOOGLE_VISION_API_KEY=AIzaSy...your_key_here
   ```

### OpenAI Whisper API (voice transcription)
1. Go to https://platform.openai.com
2. Click your name → **API Keys** → **Create new secret key**
3. Add to your **backend** `.env`:
   ```
   OPENAI_API_KEY=sk-...your_key_here
   ```

### MongoDB Atlas (database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster (M0 — always free)
3. Create a database user + allow network access
4. Click **Connect** → **Connect your application** → copy the URI
5. Add to your **backend** `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/recipesocial
   ```

> ⚠️ **NEVER put API keys in the React Native app.**
> Keys go in your Node.js backend `.env` file ONLY.
> The app calls your backend → your backend calls Google/OpenAI.

---

## Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| `npm install` fails | Delete `node_modules/` and try again |
| QR code won't scan | Type the URL manually in Expo Go. Make sure both devices are on same Wi-Fi. |
| "Unable to connect to Metro" | Run `npx expo start --tunnel` |
| Blank white screen | Shake phone → Reload. Check terminal for red error messages. |
| "Module not found" | Run `npm install` again, then `npx expo start --clear` |
| Camera/mic don't work | These work in Expo Go. For TestFlight you'll need `npx expo run:ios`. |
| API calls failing | Use LAN IP not `localhost`. Check backend is running on port 5000. |

---

## Useful Commands

```bash
npx expo start              # Normal start
npx expo start --clear      # Start + clear Metro cache
npx expo start --tunnel     # Works on any network (university Wi-Fi etc.)
npx expo install <pkg>      # Install Expo-compatible packages
```
