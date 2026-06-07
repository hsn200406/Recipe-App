import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Pill, Stars } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { recipeAPI } from "../services/api";

const CUISINES = [
  "All",
  "Japanese",
  "Italian",
  "American",
  "Mediterranean",
  "Mexican",
  "Indian",
  "Thai",
  "Chinese",
  "Korean",
];

const MEALS = ["All", "Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

export default function SearchScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, token, toggleFollow } = useAuth();

  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [meal, setMeal] = useState("All");
  const [protein, setProtein] = useState("Any");
  const [carbs, setCarbs] = useState("Any");
  const [fat, setFat] = useState("Any");
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeFilters = [
    cuisine !== "All",
    meal !== "All",
    protein !== "Any",
    carbs !== "Any",
    fat !== "Any",
  ].filter(Boolean).length;

  const searchParams = useMemo(() => {
    const params = {};

    if (query.trim()) params.q = query.trim();
    if (cuisine !== "All") params.cuisine = cuisine;
    if (meal !== "All") params.meal = meal;
    if (protein !== "Any") params.protein = protein;
    if (carbs !== "Any") params.carbs = carbs;
    if (fat !== "Any") params.fat = fat;

    return params;
  }, [query, cuisine, meal, protein, carbs, fat]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await recipeAPI.search(token, searchParams);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Search error:", err.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [token, searchParams]);

  const clearAll = () => {
    setQuery("");
    setCuisine("All");
    setMeal("All");
    setProtein("Any");
    setCarbs("Any");
    setFat("Any");
  };

  const openRecipe = (recipe) => {
    const recipeId = recipe._id || recipe.id;

    navigation.navigate("RecipeDetail", {
      recipe: {
        ...recipe,
        isLiked: user?.likedRecipes?.includes(recipeId),
        isSaved: user?.savedRecipes?.includes(recipeId),
      },
    });
  };

  const MacroToggle = ({ label, value, onChange }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={[sf.filterLabel, { color: theme.muted }]}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["Any", "High", "Low"].map((opt) => (
          <Pill
            key={opt}
            active={value === opt}
            onPress={() => onChange(opt)}
            small
          >
            {opt}
          </Pill>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[sf.safe, { backgroundColor: theme.bg }]}>
      <View
        style={[
          sf.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[sf.headerTitle, { color: theme.text }]}>Discover</Text>

        <View
          style={[
            sf.searchRow,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>Search</Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ramen, pasta, high protein..."
            placeholderTextColor={theme.muted}
            style={[sf.searchInput, { color: theme.text }]}
            returnKeyType="search"
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={{ color: theme.muted, fontSize: 18 }}>x</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            style={[
              sf.filterToggle,
              {
                backgroundColor:
                  activeFilters > 0 ? theme.accent : theme.pillBg,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={{
                color: activeFilters > 0 ? "#fff" : theme.muted,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Filters{activeFilters > 0 ? ` ${activeFilters}` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sf.scroll}
      >
        {showFilters && (
          <View
            style={[
              sf.filterPanel,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={sf.filterPanelHeader}>
              <Text style={[sf.filterPanelTitle, { color: theme.text }]}>
                Filters
              </Text>
              <TouchableOpacity onPress={clearAll}>
                <Text
                  style={{
                    color: theme.accent,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  Reset All
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[sf.filterLabel, { color: theme.muted }]}>
              Cuisine
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
            >
              {CUISINES.map((c) => (
                <View key={c} style={{ marginRight: 6 }}>
                  <Pill
                    active={cuisine === c}
                    onPress={() => setCuisine(c)}
                    small
                  >
                    {c}
                  </Pill>
                </View>
              ))}
            </ScrollView>

            <Text style={[sf.filterLabel, { color: theme.muted }]}>
              Meal Type
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 14,
              }}
            >
              {MEALS.map((m) => (
                <Pill
                  key={m}
                  active={meal === m}
                  onPress={() => setMeal(m)}
                  small
                >
                  {m}
                </Pill>
              ))}
            </View>

            <MacroToggle
              label="Protein"
              value={protein}
              onChange={setProtein}
            />
            <MacroToggle label="Carbs" value={carbs} onChange={setCarbs} />
            <MacroToggle label="Fat" value={fat} onChange={setFat} />
          </View>
        )}

        {!showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={sf.cuisineScroll}
          >
            {CUISINES.map((c) => (
              <View key={c} style={{ marginRight: 6 }}>
                <Pill
                  active={cuisine === c}
                  onPress={() => setCuisine(c)}
                  small
                >
                  {c}
                </Pill>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={sf.resultHeader}>
          <Text style={[sf.resultCount, { color: theme.muted }]}>
            {loading
              ? "Searching..."
              : `${results.length} recipe${results.length === 1 ? "" : "s"} found`}
          </Text>
          {loading && <ActivityIndicator size="small" color={theme.accent} />}
        </View>

        {!loading && results.length === 0 ? (
          <View style={sf.emptyState}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>No results</Text>
            <Text style={[sf.emptyText, { color: theme.muted }]}>
              Try a different search or filter.
            </Text>
            <TouchableOpacity
              onPress={clearAll}
              style={[sf.clearBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          results.map((recipe) => {
            const recipeId = recipe._id || recipe.id;
            const creator =
              typeof recipe.creatorId === "object" ? recipe.creatorId : null;
            const creatorId = creator?._id || recipe.creatorId;
            const currentUserId = user?._id || user?.id;
            const isOwnRecipe = creatorId === currentUserId;
            const isFollowed = user?.following?.includes(creatorId);

            return (
              <View
                key={recipeId}
                style={[
                  sf.resultCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => openRecipe(recipe)}
                  style={sf.resultMain}
                >
                  <View
                    style={[
                      sf.resultEmoji,
                      { backgroundColor: recipe.cardColor || "#1A1410" },
                    ]}
                  >
                    {recipe.imageUrl ? (
                      <Image
                        source={{ uri: recipe.imageUrl }}
                        style={sf.resultImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 30 }}>
                        {recipe.emoji || "🍽"}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[sf.resultTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {recipe.title}
                    </Text>

                    <Text
                      style={[sf.resultMeta, { color: theme.muted }]}
                      numberOfLines={1}
                    >
                      {[recipe.meal, recipe.cuisine, recipe.time]
                        .filter(Boolean)
                        .join(" · ") || "Recipe"}
                    </Text>

                    <View style={sf.macroRow}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#4CAF82",
                          fontWeight: "500",
                        }}
                      >
                        P:{recipe.protein || 0}g
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#F5C842",
                          fontWeight: "500",
                        }}
                      >
                        C:{recipe.carbs || 0}g
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#FF5C3A",
                          fontWeight: "500",
                        }}
                      >
                        F:{recipe.fat || 0}g
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted }}>
                        {recipe.calories || 0} kcal
                      </Text>
                    </View>

                    <View style={sf.ratingRow}>
                      <Stars rating={recipe.rating || 0} size={11} />
                      <Text style={{ fontSize: 11, color: theme.muted }}>
                        {recipe.rating || 0} · ♥{" "}
                        {(recipe.likes || 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {creator && (
                  <View
                    style={[
                      sf.resultCreatorRow,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <TouchableOpacity
                      style={sf.resultCreatorLeft}
                      onPress={() =>
                        navigation.navigate("Creator", { creator })
                      }
                    >
                      <Avatar
                        initial={creator.name?.charAt(0)?.toUpperCase() || "?"}
                        color={creator.avatarColor || theme.accent}
                        size={20}
                      />
                      <Text style={{ fontSize: 12, color: theme.muted }}>
                        @{creator.handle}
                      </Text>
                    </TouchableOpacity>

                    {!isOwnRecipe && (
                      <TouchableOpacity
                        onPress={() => toggleFollow(creatorId)}
                        style={[
                          sf.followBtn,
                          {
                            backgroundColor: isFollowed
                              ? theme.pillBg
                              : theme.accentSoft,
                            borderColor: isFollowed
                              ? theme.border
                              : theme.accent + "44",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isFollowed ? theme.muted : theme.accent,
                            fontSize: 11,
                            fontWeight: "500",
                          }}
                        >
                          {isFollowed ? "Following" : "+ Follow"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const sf = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  scroll: { padding: 16, paddingBottom: 32, gap: 12 },
  cuisineScroll: { flexGrow: 0 },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultCount: { fontSize: 12 },
  filterPanel: { borderRadius: 16, padding: 16, borderWidth: 1 },
  filterPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  filterPanelTitle: { fontSize: 15, fontWeight: "700" },
  filterLabel: { fontSize: 12, fontWeight: "500", marginBottom: 8 },
  emptyState: { alignItems: "center", paddingVertical: 50, gap: 12 },
  emptyText: { fontSize: 14 },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  resultCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  resultMain: { flexDirection: "row", padding: 14, gap: 12 },
  resultEmoji: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  resultMeta: { fontSize: 12, marginBottom: 5 },
  macroRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  resultCreatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  resultCreatorLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  resultImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
});
