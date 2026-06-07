import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CREATORS } from "../data/mockData";
import { Avatar, MacroBar, Stars } from "./SharedComponents";

// ── Recipe Card ──────────────────────────────────────────────────────────────
function RecipeCard({ recipe, followedCreators, onToggleFollow }) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, toggleLike, toggleSave } = useAuth();
  const creator =
    typeof recipe.creatorId === "object"
      ? recipe.creatorId
      : CREATORS?.[recipe.creatorId] || {
          handle: "unknown",
          initial: "?",
          avatarColor: "#999",
        };
  const creatorId = creator._id || recipe.creatorId;
  const currentUserId = user?._id || user?.id;
  const isOwnRecipe = creatorId === currentUserId;
  const recipeId = recipe._id || recipe.id;
  const authLiked = user?.likedRecipes?.includes(recipeId);
  const authSaved = user?.savedRecipes?.includes(recipeId);

  const [liked, setLiked] = useState(authLiked);
  const [saved, setSaved] = useState(authSaved);
  const [likeCount, setLikeCount] = useState(recipe.likes || 0);

  useEffect(() => {
    setLiked(authLiked);
  }, [authLiked]);

  useEffect(() => {
    setSaved(authSaved);
  }, [authSaved]);

  useEffect(() => {
    setLikeCount(recipe.likes || 0);
  }, [recipe.likes]);

  const authFollowed = (followedCreators || []).includes(creatorId);
  const [isFollowed, setIsFollowed] = useState(authFollowed);

  useEffect(() => {
    setIsFollowed(authFollowed);
  }, [authFollowed]);

  const fmtCount = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() =>
        navigation.navigate("RecipeDetail", {
          recipe: {
            ...recipe,
            likes: likeCount,
            isLiked: liked,
            isSaved: saved,
          },
        })
      }
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {/* Hero gradient area */}
      <View style={[styles.hero, { backgroundColor: recipe.cardColor }]}>
        <View
          style={[
            styles.heroGlow,
            { backgroundColor: recipe.accentColor + "44" },
          ]}
        />
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
        )}

        {recipe.hasVideo && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>▶ Video</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={{ fontSize: 11, color: theme.gold, fontWeight: "600" }}>
            ★ {recipe.rating}
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            setSaved((s) => !s);
            await toggleSave(recipeId);
          }}
          style={[
            styles.saveOverlay,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text
            style={{ fontSize: 22, color: saved ? theme.gold : theme.muted }}
          >
            {saved ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
        <View style={styles.mealBadge}>
          <Text style={{ fontSize: 10, color: "#fff" }}>
            {recipe.meal} · {recipe.cuisine}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Creator row */}
        <View style={styles.creatorRow}>
          <TouchableOpacity
            style={styles.creatorLeft}
            onPress={() => navigation.navigate("Creator", { creator })}
          >
            <Avatar
              initial={creator.initial || creator.name?.charAt(0) || "?"}
              color={creator.avatarColor}
              size={22}
            />
            <Text style={[styles.creatorHandle, { color: theme.muted }]}>
              @{creator.handle}
            </Text>
          </TouchableOpacity>
          {!isOwnRecipe && (
            <TouchableOpacity
              onPress={async () => {
                setIsFollowed((v) => !v);
                await onToggleFollow?.(creatorId);
              }}
              style={[
                styles.followBtn,
                {
                  backgroundColor: isFollowed ? theme.pillBg : theme.accent,
                  borderColor: isFollowed ? theme.border : theme.accent,
                },
              ]}
            >
              <Text
                style={{
                  color: isFollowed ? theme.muted : "#fff",
                  fontSize: 11,
                  fontWeight: "500",
                }}
              >
                {isFollowed ? "Following" : "+ Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={[styles.cardTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {recipe.title}
        </Text>
        <Text
          style={[styles.cardDesc, { color: theme.muted }]}
          numberOfLines={2}
        >
          {recipe.description}
        </Text>

        {/* Macros */}
        <View style={styles.macroRow}>
          <MacroBar
            label="Protein"
            value={recipe.protein}
            max={60}
            color="#4CAF82"
          />
          <MacroBar
            label="Carbs"
            value={recipe.carbs}
            max={100}
            color="#F5C842"
          />
          <MacroBar label="Fat" value={recipe.fat} max={50} color="#FF5C3A" />
        </View>

        {/* Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagScroll}
        >
          {(recipe.tags || []).map((t) => (
            <View
              key={t}
              style={[
                styles.tag,
                { backgroundColor: theme.pillBg, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: theme.pillText, fontSize: 11 }}>{t}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.ratingRow}>
            <Stars rating={recipe.rating} size={11} />
            <Text style={[styles.ratingCount, { color: theme.muted }]}>
              ({recipe.ratingCount})
            </Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={async () => {
                const nextLiked = !liked;

                setLiked(nextLiked);
                setLikeCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

                const data = await toggleLike(recipeId);

                if (data) {
                  setLiked(data.likedRecipes.includes(recipeId));
                  setLikeCount(data.likes);
                }
              }}
              style={styles.actionBtn}
            >
              <Text
                style={{
                  fontSize: 40,
                  color: liked ? theme.accent : theme.muted,
                }}
              >
                {liked ? "♥" : "♡"}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  color: liked ? theme.accent : theme.muted,
                  marginLeft: 3,
                }}
              >
                {fmtCount(likeCount)}
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => toggleSave(recipeId)} style={styles.actionBtn}>
              <Text style={{ fontSize: 26, color: saved ? theme.gold : theme.muted }}>
                {saved ? '★' : '☆'}
              </Text>
            </TouchableOpacity> */}
            <View style={styles.actionBtn}>
              <Text style={{ fontSize: 15, color: theme.muted }}>
                Reviews: {recipe.commentCount || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default RecipeCard;

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: "hidden", borderWidth: 1, elevation: 2 },
  hero: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 0 },
  heroEmoji: { fontSize: 64, zIndex: 1 },

  videoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  videoBadgeText: { color: "#fff", fontSize: 11, fontWeight: "500" },

  ratingBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  mealBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  cardBody: { padding: 14, gap: 8 },
  creatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creatorLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  creatorHandle: { fontSize: 12 },

  followBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },

  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardDesc: { fontSize: 12, lineHeight: 18 },

  macroRow: { flexDirection: "row", gap: 12 },

  tagScroll: { flexGrow: 0 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    marginRight: 6,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },

  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingCount: { fontSize: 11 },

  actionRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  actionBtn: {
    minWidth: 44,
    minHeight: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
});
