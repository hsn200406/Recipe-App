import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../components/RecipeCard";
import { Avatar } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
// import { RECIPES } from '../data/mockData'; // To test with moch data
import { recipeAPI } from "../services/api";

// ── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  // Setting state variables for theme, navigation, feed tab selection, followed creators list, and unread notifications count
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [feedTab, setFeedTab] = useState("foryou");
  const unreadNotifs = 0;
  const opacity = useRef(new Animated.Value(1)).current;
  const [animating, setAnimating] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token, toggleFollow } = useAuth();
  const followedCreators = user?.following || [];
  const followedKey = followedCreators.join(",");
  const goToRecipe = (recipe) => {
    navigation.navigate("RecipeDetail", { recipe });
  };

  // Scoring in loadfeed and filtering only in render
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);

      const data = await recipeAPI.getFeed(token);

      const recipes = Array.isArray(data?.recipes) ? data.recipes : data || [];

      const scored = recipes.map((r) => {
        let score = r.rating * 10 + Math.log((r.likes || 0) + 1) * 4;

        const creatorId =
          typeof r.creatorId === "object" ? r.creatorId._id : r.creatorId;

        if (creatorId && followedCreators.includes(creatorId)) {
          score += 50;
        }

        return { ...r, _score: score };
      });

      scored.sort((a, b) => b._score - a._score);

      setFeed(scored);
    } catch (err) {
      console.log("Feed error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [token, followedKey]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed]),
  );

  useEffect(() => {
    const stackParent = navigation.getParent()?.getParent();

    const unsubscribe = stackParent?.addListener("focus", () => {
      loadFeed();
    });

    return unsubscribe;
  }, [navigation, loadFeed]);

  useEffect(() => {
    setAnimating(true);

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,

        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setAnimating(false));
  }, [feedTab]);

  const filteredFeed =
    feedTab === "following"
      ? feed.filter((r) => {
          const creatorId =
            typeof r.creatorId === "object" ? r.creatorId._id : r.creatorId;
          return creatorId && followedCreators.includes(creatorId);
        })
      : feed;

  // Recommendation algorithm — boost followed creators + rating + popularity (FOR MOCH DATA)
  // const scored = RECIPES.map(r => {
  //   let s = r.rating * 10 + Math.log(r.likes + 1) * 4 + r.saves * 0.04;
  //   if (followedCreators.includes(r.creatorId)) s += 50;
  //   return { ...r, _score: s };
  // }).sort((a, b) => b._score - a._score);

  // const feed = feedTab === 'following'
  //   ? scored.filter(r => followedCreators.includes(r.creatorId))
  //   : scored;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: theme.muted }]}>
            Good evening 👋
          </Text>
          <Text style={[styles.headline, { color: theme.text }]}>
            What's{" "}
            <Text style={{ fontStyle: "italic", color: theme.accent }}>
              cooking?
            </Text>
          </Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={[
              styles.notifBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {unreadNotifs > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <Text style={styles.badgeText}>{unreadNotifs}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.userChip}>
              <Avatar
                initial={user?.name?.charAt(0).toUpperCase() || "?"}
                color={user?.avatarColor || theme.accent}
                size={40}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* AI Capture Banner */}
          {/* <TouchableOpacity
            style={[
              styles.aiBanner,
              {
                backgroundColor: theme.dark ? "#1a0a2e" : "#f3eeff",
                borderColor: "#7C3AED44",
              },
            ]}
          >
            <Text style={{ fontSize: 26 }}>✦</Text>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                }}
              >
                <Text
                  style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}
                >
                  AI Recipe Capture
                </Text>
                <View style={styles.aiBadge}>
                  <Text
                    style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}
                  >
                    AI
                  </Text>
                </View>
              </View>
              <Text style={{ color: theme.muted, fontSize: 12 }}>
                Point camera · Speak instructions · Done
              </Text>
            </View>
            <Text style={{ color: theme.accent, fontSize: 18 }}>→</Text>
          </TouchableOpacity> */}

          {/* Feed tab switcher */}
          <View
            style={[
              styles.tabSwitcher,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {[
              ["foryou", "✦ For You"],
              ["following", "Following"],
            ].map(([id, label]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setFeedTab(id)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor:
                      feedTab === id ? theme.accent : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: feedTab === id ? "#fff" : theme.muted,
                    fontWeight: "500",
                    fontSize: 13,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feed */}
          {feedTab === "following" && filteredFeed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>👥</Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                Follow some creators to see their recipes here.
              </Text>
            </View>
          ) : (
            filteredFeed.map((r) => (
              <RecipeCard
                key={r._id || r.id}
                recipe={r}
                followedCreators={followedCreators}
                onToggleFollow={toggleFollow}
                onPress={() =>
                  navigation.navigate("RecipeDetail", { recipe: r })
                }
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 12, marginBottom: 2 },
  headline: { fontSize: 22, fontWeight: "700" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  scroll: { padding: 16, paddingBottom: 32, gap: 16 },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  aiBadge: {
    backgroundColor: "#7C3AED",
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabSwitcher: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 14, textAlign: "center" },
  userChip: { flexDirection: "row", alignItems: "center", gap: 8 },
});
