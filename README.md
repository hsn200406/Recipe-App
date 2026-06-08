# RecipeSocial

## Project Overview

RecipeSocial is a mobile recipe-sharing application built with React Native and Expo, backed by a Node.js, Express, and MongoDB API. The app lets users create accounts, publish recipes, discover recipes from other creators, save favorites, like recipes, follow creators, review recipes, and manage their own profile and recipe collection.

The project is structured as a full-stack application with a React Native frontend and an Express/Mongoose backend.

## Features

- User registration and login with JWT authentication
- Backend validation for name, username, email format, email domain, and password length
- User profiles with editable name, handle, bio, avatar color, and specialty
- Public recipe feed with creator information
- Recipe creation with title, description, image URL, meal type, cuisine, time, nutrition, ingredients, steps, and visibility
- Recipe detail screen with ingredients, steps, reviews, stats, nutrition, creator profile, like, save, review, and share actions
- Like and unlike recipes with backend count updates
- Save and unsave recipes with a dedicated Saved screen
- Follow and unfollow creators
- Creator profile screen with creator stats and public recipes
- Search and filtering for public recipes
- Profile screen showing created, liked, and saved recipes
- Delete own recipes with confirmation
- Delete account support from settings
- Native share support for recipes
- Dark mode support
- Basic notifications screen placeholder with empty state
- Health check route for backend deployment monitoring

## Installation Instructions

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Expo CLI or Expo Go
- MongoDB Atlas account or local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd RecipeSocial
```

### 2. Install frontend dependencies

From the project root:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Create backend environment variables

Inside the `backend` folder, create a `.env` file using `backend/.env.example` as a guide:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

Important: do not commit the real `.env` file.

### 5. Start the backend server

From the `backend` folder:

```bash
npm run dev
```

The backend should run on:

```txt
http://localhost:5000
```

You can check the backend health route at:

```txt
http://localhost:5000/api/health
```

### 6. Configure frontend API URL

In `src/services/api.js`, set `API_BASE_URL` to your backend URL.

For a real phone on the same Wi-Fi, use your computer's local IP address:

```js
export const API_BASE_URL = "http://YOUR_LOCAL_IP:5000/api";
```

For an emulator or deployed backend, use the appropriate backend URL.

### 7. Start the frontend app

From the project root:

```bash
npm start
```

Then open the app using Expo Go, an emulator, or a simulator.

## Usage

1. Open the app and create an account with a valid name, username, email, and password.
2. Log in to access the main recipe feed.
3. Browse recipes on the Home screen.
4. Use Search to find recipes by keyword, cuisine, meal type, or nutrition filters.
5. Open a recipe to view details, ingredients, steps, reviews, nutrition, and creator information.
6. Like, save, review, or share recipes from the recipe detail screen.
7. Follow creators to see their recipes in the Following feed.
8. Create a new recipe from the Create tab by adding recipe details, ingredients, and steps.
9. View your own recipes, liked recipes, and saved recipes from the Profile screen.
10. Delete your own recipes from Profile when needed.
11. Edit profile details from Profile or Settings.
12. Log out or delete your account from Settings.

## Technologies Used

### Frontend

- React Native
- Expo
- React Navigation
- Expo SecureStore
- Expo Status Bar
- Expo Image Picker
- React Native Gesture Handler
- React Native Safe Area Context
- React Native Screens

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt
- dotenv
- cors
- Node DNS promises API for email domain validation

### Development Tools

- npm
- Nodemon
- Postman for API testing
- MongoDB Atlas

## Future Improvements

- Real email verification with a provider such as Resend, SendGrid, Mailgun, or Nodemailer
- Password reset flow
- Proper image upload instead of image URL entry
- Proper cooking video upload and playback using cloud storage such as S3, Cloudflare R2, or Cloudinary
- Real notification system and notification preferences
- Default recipe visibility preference saved to user settings
- Social login with Google or Apple
- AI recipe capture features for ingredient scanning and instruction transcription
- Pagination or infinite scroll on more frontend screens
- More advanced recommendation algorithm
- Better review management, including editing or deleting reviews
- User blocking and reporting tools
- Production-ready Terms of Service and Privacy Policy pages
- Automated tests for backend routes and core frontend flows
- Improved deployment configuration for production environments
