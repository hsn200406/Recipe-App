import { useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar, Pill } from "../components/SharedComponents";
import { useTheme } from "../context/ThemeContext";
import { CREATORS, CUISINES, MEALS, RECIPES } from "../data/mockData";

export default function SearchScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [meal, setMeal] = useState("All");
  const [protein, setProtein] = useState("Any"); // Any | High | Low
  const [carbs, setCarbs] = useState("Any");
  const [fat, setFat] = useState("Any");
  const [showFilters, setShowFilters] = useState(false);
  const [followedCreators, setFollowed] = useState(["sara"]);

  const toggleFollow = useCallback((id) => {
    setFollowed((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const macroOk = (filter, val, max) => {
    if (filter === "High") return val >= max * 0.6;
    if (filter === "Low") return val <= max * 0.4;
    return true;
  };

  // Scoring + filter + sort
  const results = useMemo(() => {
    return RECIPES.map((r) => {
      // Hard filters first
      if (cuisine !== "All" && r.cuisine !== cuisine) return null;
      if (meal !== "All" && r.meal !== meal) return null;
      if (!macroOk(protein, r.protein, 60)) return null;
      if (!macroOk(carbs, r.carbs, 100)) return null;
      if (!macroOk(fat, r.fat, 50)) return null;

      let score = 0;
      if (query) {
        const q = query.toLowerCase();
        if (r.title.toLowerCase().includes(q)) score += 50;
        if (r.cuisine.toLowerCase().includes(q)) score += 30;
        if (r.meal.toLowerCase().includes(q)) score += 20;
        if (r.tags.some((t) => t.toLowerCase().includes(q))) score += 15;
        if (r.desc.toLowerCase().includes(q)) score += 8;
        const cr = CREATORS[r.creatorId];
        if (
          cr.handle.toLowerCase().includes(q) ||
          cr.name.toLowerCase().includes(q)
        )
          score += 10;
        if (score === 0) return null; // no match at all
      }

      // Cuisine/meal filter boosts relevance score further
      if (cuisine !== "All") score += 40;
      if (meal !== "All") score += 25;

      // Popularity signal
      score += r.rating * 8 + Math.log(r.likes + 1) * 3;
      if (followedCreators.includes(r.creatorId)) score += 20;

      return { ...r, _score: score };
    })
      .filter(Boolean)
      .sort((a, b) => b._score - a._score);
  }, [query, cuisine, meal, protein, carbs, fat, followedCreators]);

  const activeFilters = [
    cuisine !== "All",
    meal !== "All",
    protein !== "Any",
    carbs !== "Any",
    fat !== "Any",
  ].filter(Boolean).length;

  const clearAll = () => {
    setCuisine("All");
    setMeal("All");
    setProtein("Any");
    setCarbs("Any");
    setFat("Any");
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
      {/* Header */}
      <View
        style={[
          sf.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[sf.headerTitle, { color: theme.text }]}>Discover</Text>
        {/* Search input */}
        <View
          style={[
            sf.searchRow,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={'"dairy-free pasta" or "high protein"'}
            placeholderTextColor={theme.muted}
            style={[sf.searchInput, { color: theme.text }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text style={{ color: theme.muted, fontSize: 18 }}>×</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowFilters((f) => !f)}
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
              ⚙{activeFilters > 0 ? ` ${activeFilters}` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sf.scroll}
      >
        {/* Filter panel */}
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

        {/* Cuisine quick scroll (when filter panel is closed) */}
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

        {/* Results count */}
        <Text style={[sf.resultCount, { color: theme.muted }]}>
          {results.length} recipe{results.length !== 1 ? "s" : ""}{" "}
          {query || activeFilters > 0 ? "found" : "— search or filter above"}
        </Text>

        {/* Results list */}
        {results.length === 0 ? (
          <View style={sf.emptyState}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🍽️</Text>
            <Text style={[sf.emptyText, { color: theme.muted }]}>
              No recipes match your search.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                clearAll();
              }}
              style={[sf.clearBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Clear All Filters
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          results.map((r) => {
            const cr = CREATORS[r.creatorId];
            const isFollowed = followedCreators.includes(r.creatorId);
            return (
              <View
                key={r.id}
                style={[
                  sf.resultCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("RecipeDetail", {
                      recipe: r,
                      followedCreators,
                      onToggleFollow: toggleFollow,
                    })
                  }
                  style={sf.resultMain}
                >
                  <View
                    style={[sf.resultEmoji, { backgroundColor: r.cardColor }]}
                  >
                    <Text style={{ fontSize: 30 }}>{r.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[sf.resultTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {r.title}
                    </Text>
                    <Text style={[sf.resultMeta, { color: theme.muted }]}>
                      {r.meal} · {r.cuisine} · ★{r.rating} · {r.time}
                    </Text>
                    <View style={sf.macroRow}>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#4CAF82",
                          fontWeight: "500",
                        }}
                      >
                        P:{r.protein}g
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#F5C842",
                          fontWeight: "500",
                        }}
                      >
                        C:{r.carbs}g
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#FF5C3A",
                          fontWeight: "500",
                        }}
                      >
                        F:{r.fat}g
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.muted }}>
                        {r.cal} kcal
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {/* Creator row */}
                <View
                  style={[
                    sf.resultCreatorRow,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <TouchableOpacity
                    style={sf.resultCreatorLeft}
                    onPress={() =>
                      navigation.navigate("Creator", {
                        creator: CREATORS[r.creatorId],
                        followedCreators,
                        onToggleFollow: toggleFollow,
                      })
                    }
                  >
                    <Avatar
                      initial={cr.initial}
                      color={cr.avatarColor}
                      size={20}
                    />
                    <Text style={{ fontSize: 12, color: theme.muted }}>
                      @{cr.handle}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleFollow(r.creatorId)}
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
                </View>
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
  macroRow: { flexDirection: "row", gap: 8 },
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
});
