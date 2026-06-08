import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Stars, StatCell } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL, recipeAPI, userAPI } from "../services/api";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("recipes");
  const [profile, setProfile] = useState(user);
  const [myRecipes, setMyRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyRecipes = async () => {
    const res = await fetch(`${API_BASE_URL}/recipes/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load your recipes");
    }

    return data;
  };

  const loadProfile = useCallback(async () => {
    if (!token) return;

    try {
      const freshUser = await userAPI.getMe(token);
      setProfile(freshUser);

      const mine = await fetchMyRecipes();
      setMyRecipes(Array.isArray(mine) ? mine : []);

      const saved = await recipeAPI.getSaved(token);
      setSavedRecipes(Array.isArray(saved) ? saved : []);

      const feed = await recipeAPI.getFeed(token);
      const recipes = Array.isArray(feed?.recipes) ? feed.recipes : feed || [];
      const likedIds = freshUser.likedRecipes || [];

      setLikedRecipes(
        recipes.filter((recipe) => likedIds.includes(recipe._id || recipe.id)),
      );
    } catch (err) {
      console.log("Profile error:", err.message);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  const displayUser = profile || user || {};
  const initial = displayUser.name?.charAt(0)?.toUpperCase() || "?";
  const recipeCount = myRecipes.length;
  const followerCount = displayUser.followers?.length || 0;
  const followingCount = displayUser.following?.length || 0;

  const confirmAction = (title, message, onConfirm) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) onConfirm();
      return;
    }

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: title.includes("Delete") ? "Delete" : "Log Out",
        style: "destructive",
        onPress: onConfirm,
      },
    ]);
  };

  const openRecipe = (recipe) => {
    const recipeId = recipe._id || recipe.id;

    navigation.navigate("RecipeDetail", {
      recipe: {
        ...recipe,
        isLiked: (displayUser.likedRecipes || []).includes(recipeId),
        isSaved: (displayUser.savedRecipes || []).includes(recipeId),
      },
    });
  };

  const deleteRecipe = (recipe) => {
    const recipeId = recipe._id || recipe.id;

    confirmAction("Delete recipe?", "Are you sure you want to delete this recipe?", async () => {
      try {
        await recipeAPI.delete(token, recipeId);
        setMyRecipes((prev) =>
          prev.filter((item) => (item._id || item.id) !== recipeId),
        );
      } catch (err) {
        Alert.alert("Delete failed", err.message);
      }
    });
  };

  const recipesToShow =
    activeTab === "recipes"
      ? myRecipes
      : activeTab === "liked"
        ? likedRecipes
        : savedRecipes;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        <View
          style={[
            s.cover,
            { backgroundColor: theme.dark ? "#1A1208" : "#F0EDE8" },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={s.topIconBtn}
          >
            <Text style={s.topIconText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={s.avatarContainer}>
          <View style={[s.avatarBorder, { borderColor: theme.bg }]}>
            <Avatar
              initial={initial}
              color={displayUser.avatarColor || theme.accent}
              size={76}
            />
          </View>
        </View>

        <View style={s.infoSection}>
          <Text style={[s.name, { color: theme.text }]}>
            {displayUser.name || "Your Profile"}
          </Text>

          <Text style={[s.handle, { color: theme.muted }]}>
            @{displayUser.handle || "username"}
          </Text>

          {!!displayUser.bio && (
            <Text style={[s.bio, { color: theme.subtext }]}>
              {displayUser.bio}
            </Text>
          )}

          {!!displayUser.specialty && (
            <View
              style={[
                s.specialtyBadge,
                {
                  backgroundColor: theme.accentSoft,
                  borderColor: theme.accent + "33",
                },
              ]}
            >
              <Text style={{ fontSize: 13 }}>🍽</Text>
              <Text
                style={{ fontSize: 12, color: theme.accent, fontWeight: "500" }}
              >
                {displayUser.specialty}
              </Text>
            </View>
          )}

          <View
            style={[
              s.statsRow,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <StatCell value={recipeCount} label="Recipes" borderRight />
            <StatCell
              value={followerCount.toLocaleString()}
              label="Followers"
              borderRight
            />
            <StatCell value={followingCount} label="Following" />
          </View>

          <View style={s.actionRow}>
            <TouchableOpacity
              style={[
                s.editBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={[s.editBtnText, { color: theme.text }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.editBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() =>
                confirmAction("Log Out", "Are you sure you want to log out?", async () => {
                  await logout();
                })
              }
            >
              <Text style={[s.editBtnText, { color: theme.text }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            s.tabs,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {[
            ["recipes", "Recipes"],
            ["liked", "Liked"],
            ["saved", "Saved"],
          ].map(([id, label]) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveTab(id)}
              style={[
                s.tabBtn,
                {
                  backgroundColor:
                    activeTab === id ? theme.accent : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: activeTab === id ? "#fff" : theme.muted,
                  fontWeight: "500",
                  fontSize: 13,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.recipeList}>
          {recipesToShow.map((recipe) => {
            const recipeId = recipe._id || recipe.id;

            return (
              <TouchableOpacity
                key={recipeId}
                onPress={() => openRecipe(recipe)}
                style={[
                  s.recipeCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    s.recipeHero,
                    { backgroundColor: recipe.cardColor || "#1A1410" },
                  ]}
                >
                  {recipe.imageUrl ? (
                    <Image
                      source={{ uri: recipe.imageUrl }}
                      style={s.recipeImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <>
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          {
                            backgroundColor:
                              (recipe.accentColor || theme.accent) + "44",
                          },
                        ]}
                      />
                      <Text style={{ fontSize: 30 }}>
                        {recipe.emoji || "🍽️"}
                      </Text>
                    </>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[s.recipeTitle, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {recipe.title}
                  </Text>

                  <Text
                    style={[s.recipeMeta, { color: theme.muted }]}
                    numberOfLines={1}
                  >
                    {[recipe.meal, recipe.cuisine]
                      .filter(Boolean)
                      .join(" · ") || "Recipe"}
                  </Text>

                  <View style={s.recipeStats}>
                    <Stars rating={recipe.rating || 0} size={11} />
                    <Text style={{ fontSize: 11, color: theme.muted }}>
                      ♥ {(recipe.likes || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={s.recipeActions}>
                  {activeTab === "recipes" && (
                    <TouchableOpacity
                      onPress={(event) => {
                        event?.stopPropagation?.();
                        deleteRecipe(recipe);
                      }}
                      style={[s.deleteRecipeBtn, { borderColor: "#EF4444" }]}
                    >
                      <Text style={s.deleteRecipeText}>Delete</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {recipesToShow.length === 0 && (
            <View style={s.emptyTab}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>
                {activeTab === "recipes"
                  ? "🍳"
                  : activeTab === "liked"
                    ? "♡"
                    : "☆"}
              </Text>
              <Text style={[s.emptyText, { color: theme.muted }]}>
                {activeTab === "recipes"
                  ? "No recipes created yet."
                  : activeTab === "liked"
                    ? "No liked recipes yet."
                    : "No saved recipes yet."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 44 },
  cover: { height: 160, position: "relative" },

  topIconBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
  },
  topIconText: { fontSize: 18, color: "#fff" },

  avatarContainer: { paddingHorizontal: 16 },
  avatarBorder: {
    marginTop: -38,
    alignSelf: "flex-start",
    borderWidth: 4,
    borderRadius: 42,
  },

  infoSection: { paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  name: { fontSize: 22, fontWeight: "700" },
  handle: { fontSize: 14, marginTop: -6 },
  bio: { fontSize: 14, lineHeight: 22 },

  specialtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },

  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  actionRow: { flexDirection: "row", gap: 10 },

  editBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  editBtnText: { fontSize: 14, fontWeight: "500" },

  tabs: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },

  recipeList: { paddingHorizontal: 16, gap: 10 },

  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  recipeHero: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  recipeTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  recipeMeta: { fontSize: 12 },
  recipeStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },

  emptyTab: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14 },
  recipeActions: {
    alignItems: "flex-end",
    gap: 8,
  },

  deleteRecipeBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  deleteRecipeText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
});
