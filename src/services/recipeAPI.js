import { API_BASE_URL } from '../context/AuthContext';

export const recipeAPI = {
  getFeed: async () => {
    const res = await fetch(`${API_BASE_URL}/recipes`);

    if (!res.ok) {
      throw new Error('Failed to load recipes');
    }

    return res.json();
  },
};