/**
 * ─────────────────────────────────────────────────────────────────────────────
 * API SERVICE  —  src/services/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All HTTP calls to your Node/Express backend live here.
 *
 * 🔌 SETUP: Replace API_BASE_URL below with your backend address.
 *
 *  LOCAL DEV (phone + laptop on same Wi-Fi):
 *    1. Find your laptop's LAN IP:
 *       Mac  → System Preferences → Network → Wi-Fi → IP Address
 *       PC   → cmd → ipconfig → IPv4 Address
 *    2. Set: http://192.168.x.x:5000/api   ← use your actual IP
 *       Do NOT use http://localhost  — your phone cannot reach it.
 *
 *  AFTER DEPLOYING BACKEND (Railway, Render, Heroku…):
 *    Set: https://your-app.railway.app/api
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 🔌 CHANGE THIS ↓
export const API_BASE_URL = 'http://192.168.0.103:5000/api';

// ── Core fetch helper ─────────────────────────────────────────────────────────
async function apiFetch(path, token, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res  = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password)               => apiFetch('/auth/login',    null, { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, handle, email, password) => apiFetch('/auth/register', null, { method: 'POST', body: JSON.stringify({ name, handle, email, password }) }),
};

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipeAPI = {
  getFeed:      (token, page = 1) => apiFetch(`/recipes?page=${page}&limit=20`, token),
  getFollowing: (token)           => apiFetch('/recipes/following', token),
  getById:      (token, id)       => apiFetch(`/recipes/${id}`, token),
  create:       (token, body)     => apiFetch('/recipes',      token, { method: 'POST',   body: JSON.stringify(body) }),
  update:       (token, id, body) => apiFetch(`/recipes/${id}`, token, { method: 'PUT',   body: JSON.stringify(body) }),
  delete:       (token, id)       => apiFetch(`/recipes/${id}`, token, { method: 'DELETE' }),
  like:         (token, id)       => apiFetch(`/recipes/${id}/like`, token, { method: 'POST' }),
  save:         (token, id)       => apiFetch(`/recipes/${id}/save`, token, { method: 'POST' }),
  getSaved:     (token)           => apiFetch('/recipes/saved', token),
  // search params: { q, cuisine, meal, protein, carbs, fat }
  search:       (token, params)   => apiFetch(`/recipes/search?${new URLSearchParams(params)}`, token),
};

// ── Video Upload ──────────────────────────────────────────────────────────────
// 🔌 API NOTE: backend stores video to S3/Cloudflare R2 → returns { videoUrl }
export const uploadVideo = async (token, videoUri) => {
  const formData = new FormData();
  formData.append('video', { uri: videoUri, name: 'recipe_video.mp4', type: 'video/mp4' });
  const res  = await fetch(`${API_BASE_URL}/recipes/upload-video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data.videoUrl;
};

// ── Users / Creators ──────────────────────────────────────────────────────────
export const userAPI = {
  getMe:         (token)         => apiFetch('/user/me', token),
  getProfile:    (handle)        => apiFetch(`/user/${handle}`),
  updateProfile: (token, body)   => apiFetch('/user/me', token, { method: 'PUT', body: JSON.stringify(body) }),
  follow:        (token, userId) => apiFetch(`/user/follow/${userId}`, token, { method: 'POST' }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  add:  (token, recipeId, body) => apiFetch(`/recipes/${recipeId}/reviews`, token, { method: 'POST', body: JSON.stringify(body) }),
  list: (token, recipeId)       => apiFetch(`/recipes/${recipeId}/reviews`, token),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:      (token) => apiFetch('/notifications', token),
  markAllRead: (token) => apiFetch('/notifications/read-all', token, { method: 'PUT' }),
};

// ── Share ─────────────────────────────────────────────────────────────────────
export const shareAPI = {
  // toUserId — share with another app user
  shareWithUser: (token, recipeId, toUserId) =>
    apiFetch(`/recipes/${recipeId}/share`, token, { method: 'POST', body: JSON.stringify({ toUserId }) }),
};

// ── AI (calls backend which calls Google Vision + OpenAI Whisper) ─────────────
// 🔌 API NOTE: Add to your backend .env:
//   GOOGLE_VISION_API_KEY=...    (console.cloud.google.com → Vision API)
//   OPENAI_API_KEY=...           (platform.openai.com → API keys)
// NEVER put these keys in the React Native app.
export const aiAPI = {
  // POST /api/ai/scan-ingredients  body: { imageBase64 }  → { ingredients: [] }
  scanIngredients: (token, imageBase64) =>
    apiFetch('/ai/scan-ingredients', token, { method: 'POST', body: JSON.stringify({ imageBase64 }) }),

  // POST /api/ai/transcribe  (FormData with audio)  → { transcript, structuredRecipe }
  transcribeAudio: async (token, audioUri) => {
    const formData = new FormData();
    formData.append('audio', { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' });
    const res  = await fetch(`${API_BASE_URL}/ai/transcribe`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Transcription failed');
    return data;
  },
};
