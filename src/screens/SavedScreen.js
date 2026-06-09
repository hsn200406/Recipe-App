import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Stars } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CREATORS } from "../data/mockData";
import { recipeAPI } from "../services/api";

export default function SavedScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { token, toggleSave } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);

  const loadSaved = useCallback(async () => {
    try {
      const data = await recipeAPI.getSaved(token);
      setSavedRecipes(data || []);
    } catch (err) {
      console.log("Saved recipes error:", err.message);
    }
  }, [token]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSaved();
    setRefreshing(false);
  }, [loadSaved]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadSaved();
      }
    }, [token, loadSaved]),
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View
        style={[
          s.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[s.title, { color: theme.text }]}>Saved Recipes</Text>
        <Text style={[s.count, { color: theme.muted }]}>
          {savedRecipes.length} saved
        </Text>
      </View>

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
        {savedRecipes.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🔖</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>
              Nothing saved yet
            </Text>
            <Text style={[s.emptyDesc, { color: theme.muted }]}>
              Tap the bookmark icon on any recipe to save it here for later.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Search")}
              style={[s.discoverBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                Discover Recipes
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedRecipes.map((recipe) => {
            const creator =
              typeof recipe.creatorId === "object"
                ? recipe.creatorId
                : CREATORS[recipe.creatorId] || {};
            return (
              <TouchableOpacity
                key={recipe._id || recipe.id}
                activeOpacity={0.88}
                onPress={() => navigation.navigate("RecipeDetail", { recipe })}
                style={[
                  s.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                {/* Left: emoji hero */}
                <View
                  style={[s.cardHero, { backgroundColor: recipe.cardColor }]}
                >
                  {recipe.imageUrl ? (
                    <Image
                      source={{ uri: recipe.imageUrl }}
                      style={s.cardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <>
                      <View
                        style={[
                          s.cardGlow,
                          {
                            backgroundColor:
                              (recipe.accentColor || theme.accent) + "55",
                          },
                        ]}
                      />
                      <Text style={{ fontSize: 36, zIndex: 1 }}>
                        {recipe.emoji || "🍽️"}
                      </Text>
                    </>
                  )}
                </View>

                {/* Right: info */}
                <View style={s.cardInfo}>
                  <View style={s.cardTop}>
                    <Text
                      style={[s.cardTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {recipe.title}
                    </Text>
                    <TouchableOpacity
                      onPress={async (event) => {
                        event?.stopPropagation?.();
                        const recipeId = recipe._id || recipe.id;

                        setSavedRecipes((prev) =>
                          prev.filter((r) => (r._id || r.id) !== recipeId),
                        );
                        await toggleSave(recipeId);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={{ fontSize: 22, color: theme.gold }}>
                        {" "}
                        ★
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={s.metaRow}>
                    <Avatar
                      initial={
                        creator.initial || creator.name?.charAt(0) || "?"
                      }
                      color={creator.avatarColor || theme.accent}
                      size={16}
                    />
                    <Text style={[s.metaText, { color: theme.muted }]}>
                      @{creator.handle}
                    </Text>
                  </View>

                  {[
                    recipe.meal,
                    recipe.cuisine,
                    recipe.time && `⏱ ${recipe.time}`,
                  ]
                    .filter(Boolean)
                    .map((label, index) => (
                      <View
                        key={label}
                        style={[
                          s.pill,
                          {
                            backgroundColor:
                              index === 0 ? theme.accentSoft : theme.pillBg,
                            borderColor:
                              index === 0 ? theme.accent + "33" : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: index === 0 ? theme.accent : theme.pillText,
                          }}
                        >
                          {label}
                        </Text>
                      </View>
                    ))}

                  <View style={s.statsRow}>
                    <Stars rating={recipe.rating} size={11} />
                    <Text style={[s.statsText, { color: theme.muted }]}>
                      {recipe.rating || 0} ·{" "}
                      {recipe.calories ? `${recipe.calories} kcal` : "N/A"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  title: { fontSize: 24, fontWeight: "700" },
  count: { fontSize: 13 },
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  discoverBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 106,
    overflow: "hidden",
  },

  cardHero: {
    width: 88,
    height: 106,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },

  cardImage: {
    width: 88,
    height: 106,
    backgroundColor: "#111",
  },
  cardGlow: { ...StyleSheet.absoluteFillObject },
  cardInfo: { flex: 1, padding: 12, gap: 6 },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12 },
  pillRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statsText: { fontSize: 11 },
});
