import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../services/api";

const AuthContext = createContext(null);

const defaultUser = {
  id: null,
  name: "",
  email: "",
  likedRecipes: [],
  savedRecipes: [],
  following: [],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Hydrate from storage ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("jwt");
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedToken && storedUser) {
          const parsed = JSON.parse(storedUser);

          setToken(storedToken);
          setUser({
            ...defaultUser,
            ...parsed,
            likedRecipes: parsed.likedRecipes || [],
            savedRecipes: parsed.savedRecipes || [],
            following: parsed.following || [],
          });
        }
      } catch (err) {
        console.log("Auth restore error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────
  const _save = async (tok, usr) => {
    await SecureStore.setItemAsync("jwt", tok);
    await SecureStore.setItemAsync("user", JSON.stringify(usr));

    setToken(tok);
    setUser({
      ...defaultUser,
      ...usr,
      likedRecipes: usr.likedRecipes || [],
      savedRecipes: usr.savedRecipes || [],
      following: usr.following || [],
    });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("jwt");
    await SecureStore.deleteItemAsync("user");

    setToken(null);
    setUser(defaultUser);
  };

  // ── Auth calls ───────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    await _save(data.token, data.user);
    return data;
  };

  const register = async (name, handle, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, handle, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    await _save(data.token, data.user);
    return data;
  };

  // ── UI state helpers ─────────────────────────────────────────────────
  const toggleLike = async (recipeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to like recipe");

      const data = await res.json();

      // update local user state to match backend
      setUser((prev) => {
        const updatedUser = {
          ...prev,
          likedRecipes: data.likedRecipes,
        };

        SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      return data;
    } catch (err) {
      console.log("Like error:", err.message);
    }
  };

  const toggleSave = async (recipeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/recipes/${recipeId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();

      setUser((prev) => {
        const updatedUser = {
          ...prev,
          savedRecipes: data.savedRecipes,
        };

        SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      return data;
    } catch (err) {
      console.log(err.message);
    }
  };

  const toggleFollow = async (creatorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/follow/${creatorId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Follow failed");
      }

      setUser((prev) => {
        const updatedUser = {
          ...prev,
          following: data.following || [],
        };

        SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      return data;
    } catch (err) {
      console.log("Follow error:", err.message);
    }
  };

  const updateCurrentUser = async (updatedUser) => {
    await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));

    setUser({
      ...defaultUser,
      ...updatedUser,
      likedRecipes: updatedUser.likedRecipes || [],
      savedRecipes: updatedUser.savedRecipes || [],
      following: updatedUser.following || [],
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        toggleLike,
        toggleSave,
        toggleFollow,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
