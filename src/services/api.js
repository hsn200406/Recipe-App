export const API_BASE_URL = "https://recipesocial-backend.onrender.com/api";
// export const API_BASE_URL = "http://192.168.0.103:5000/api";

export const PUBLIC_APP_URL = "https://magical-melba-9488ff.netlify.app";

export function getRecipeShareUrl(recipeId) {
  return `${PUBLIC_APP_URL}/recipe/${recipeId}`;
}

// ── Core fetch helper ─────────────────────────────────────────────────────────
async function apiFetch(path, token, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    apiFetch("/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name, handle, email, password) =>
    apiFetch("/auth/register", null, {
      method: "POST",
      body: JSON.stringify({ name, handle, email, password }),
    }),
};

// ── Recipes ───────────────────────────────────────────────────────────────────
export const recipeAPI = {
  getFeed: (token, page = 1) =>
    apiFetch(`/recipes?page=${page}&limit=20`, token),
  getFollowing: (token) => apiFetch("/recipes/following", token),
  getById: (token, id) => apiFetch(`/recipes/${id}`, token),
  getByUser: (userId) => apiFetch(`/recipes/user/${userId}`),
  create: (token, body) =>
    apiFetch("/recipes", token, { method: "POST", body: JSON.stringify(body) }),
  update: (token, id, body) =>
    apiFetch(`/recipes/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (token, id) =>
    apiFetch(`/recipes/${id}`, token, { method: "DELETE" }),
  like: (token, id) =>
    apiFetch(`/recipes/${id}/like`, token, { method: "POST" }),
  save: (token, id) =>
    apiFetch(`/recipes/${id}/save`, token, { method: "POST" }),
  getSaved: (token) => apiFetch("/recipes/saved", token),
  // search params: { q, cuisine, meal, protein, carbs, fat }
  search: (token, params) =>
    apiFetch(`/recipes/search?${new URLSearchParams(params)}`, token),
};

// ── Video Upload ──────────────────────────────────────────────────────────────
export const uploadVideo = async (token, videoUri) => {
  const formData = new FormData();
  formData.append("video", {
    uri: videoUri,
    name: "recipe_video.mp4",
    type: "video/mp4",
  });
  const res = await fetch(`${API_BASE_URL}/recipes/upload-video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.videoUrl;
};

// ── Users / Creators ──────────────────────────────────────────────────────────
export const userAPI = {
  getMe: (token) => apiFetch("/user/me", token),
  getProfile: (handle) => apiFetch(`/user/${handle}`),
  getFollowers: (userId) => apiFetch(`/user/${userId}/followers`),
  getFollowing: (userId) => apiFetch(`/user/${userId}/following`),
  updateProfile: (token, body) =>
    apiFetch("/user/me", token, { method: "PUT", body: JSON.stringify(body) }),
  deleteMe: (token) => apiFetch("/user/me", token, { method: "DELETE" }),
  follow: (token, userId) =>
    apiFetch(`/user/follow/${userId}`, token, { method: "POST" }),
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  add: (token, recipeId, body) =>
    apiFetch(`/recipes/${recipeId}/reviews`, token, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  list: (token, recipeId) => apiFetch(`/recipes/${recipeId}/reviews`, token),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (token) => apiFetch("/notifications", token),
  markAllRead: (token) =>
    apiFetch("/notifications/read-all", token, { method: "PUT" }),
  markRead: (token, id) =>
    apiFetch(`/notifications/${id}/read`, token, { method: "PUT" }),
};

// ── Share ─────────────────────────────────────────────────────────────────────
export const shareAPI = {
  shareRecipe: (token, recipeId) =>
    apiFetch(`/recipes/${recipeId}/share`, token, { method: "POST" }),
};

// ── AI (calls backend which calls Google Vision + OpenAI Whisper) ─────────────
// 🔌 API NOTE: Add to your backend .env:
//   GOOGLE_VISION_API_KEY=...    (console.cloud.google.com → Vision API)
//   OPENAI_API_KEY=...           (platform.openai.com → API keys)
// NEVER put these keys in the React Native app.
// export const aiAPI = {
//   // POST /api/ai/scan-ingredients  body: { imageBase64 }  → { ingredients: [] }
//   scanIngredients: (token, imageBase64) =>
//     apiFetch("/ai/scan-ingredients", token, {
//       method: "POST",
//       body: JSON.stringify({ imageBase64 }),
//     }),

//   // POST /api/ai/transcribe  (FormData with audio)  → { transcript, structuredRecipe }
//   transcribeAudio: async (token, audioUri) => {
//     const formData = new FormData();
//     formData.append("audio", {
//       uri: audioUri,
//       name: "recording.m4a",
//       type: "audio/m4a",
//     });
//     const res = await fetch(`${API_BASE_URL}/ai/transcribe`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: formData,
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Transcription failed");
//     return data;
//   },
// };
