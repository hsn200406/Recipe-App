import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
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

  useFocusEffect(
    useCallback(() => {
      const loadSaved = async () => {
        try {
          const data = await recipeAPI.getSaved(token);
          setSavedRecipes(data || []);
        } catch (err) {
          console.log("Saved recipes error:", err.message);
        }
      };

      if (token) {
        loadSaved();
      }
    }, [token]),
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
                  <View
                    style={[
                      s.cardGlow,
                      { backgroundColor: recipe.accentColor + "55" },
                    ]}
                  />
                  <Text style={{ fontSize: 36, zIndex: 1 }}>
                    {recipe.emoji}
                  </Text>
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
                      onPress={async () => {
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

                  <View style={s.pillRow}>
                    <View
                      style={[
                        s.pill,
                        {
                          backgroundColor: theme.accentSoft,
                          borderColor: theme.accent + "33",
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 10, color: theme.accent }}>
                        {recipe.meal}
                      </Text>
                    </View>
                    <View
                      style={[
                        s.pill,
                        {
                          backgroundColor: theme.pillBg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 10, color: theme.pillText }}>
                        {recipe.cuisine}
                      </Text>
                    </View>
                    <View
                      style={[
                        s.pill,
                        {
                          backgroundColor: theme.pillBg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 10, color: theme.pillText }}>
                        ⏱ {recipe.time}
                      </Text>
                    </View>
                  </View>

                  <View style={s.statsRow}>
                    <Stars rating={recipe.rating} size={11} />
                    <Text style={[s.statsText, { color: theme.muted }]}>
                      {recipe.rating} · {recipe.calories} kcal
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
    overflow: "hidden",
    borderWidth: 1,
  },
  cardHero: { width: 100, alignItems: "center", justifyContent: "center" },
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
