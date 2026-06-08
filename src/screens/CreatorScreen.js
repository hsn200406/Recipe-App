import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
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
import { recipeAPI, userAPI } from "../services/api";

export default function CreatorScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user, toggleFollow } = useAuth();
  const { creator } = route.params || {};
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.96)).current;

  const [creatorProfile, setCreatorProfile] = useState(creator);
  const [theirRecipes, setTheirRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [socialModal, setSocialModal] = useState({
    visible: false,
    title: "",
    users: [],
    loading: false,
  });
  const creatorId = creator?._id || creator?.id;
  const currentUserId = user?._id || user?.id;
  const isOwnProfile = creatorId === currentUserId;
  const isFollowed = user?.following?.includes(creatorId);

  const loadCreator = useCallback(async () => {
    try {
      if (!creator?.handle || !creatorId) return;

      const freshCreator = await userAPI.getProfile(creator.handle);
      const recipes = await recipeAPI.getByUser(creatorId);

      setCreatorProfile(freshCreator);
      setTheirRecipes(recipes || []);
    } catch (err) {
      console.log("Creator load error:", err.message);
    }
  }, [creator?.handle, creatorId]);

  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  useEffect(() => {
    if (!socialModal.visible) return;

    modalOpacity.setValue(0);
    modalScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalOpacity, modalScale, socialModal.visible]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCreator();
    setRefreshing(false);
  }, [loadCreator]);

  const displayCreator = creatorProfile || creator;

  const toggle = async () => {
    await toggleFollow(creatorId);
  };

  const openSocialList = async (type) => {
    if (!creatorId) return;

    const title = type === "followers" ? "Followers" : "Following";

    setSocialModal({
      visible: true,
      title,
      users: [],
      loading: true,
    });

    try {
      const users =
        type === "followers"
          ? await userAPI.getFollowers(creatorId)
          : await userAPI.getFollowing(creatorId);

      setSocialModal({
        visible: true,
        title,
        users: Array.isArray(users) ? users : [],
        loading: false,
      });
    } catch (err) {
      console.log("Social list error:", err.message);
      setSocialModal({
        visible: true,
        title,
        users: [],
        loading: false,
      });
    }
  };

  if (!creator) return null;

  const featuredRecipes = [];
  const heroRecipe = theirRecipes[0];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <Modal
        visible={socialModal.visible}
        transparent
        animationType="none"
        onRequestClose={() =>
          setSocialModal((prev) => ({ ...prev, visible: false }))
        }
      >
        <Animated.View style={[s.modalOverlay, { opacity: modalOpacity }]}>
          <Animated.View
            style={[
              s.modalSheet,
              { backgroundColor: theme.card, borderColor: theme.border },
              { transform: [{ scale: modalScale }] },
            ]}
          >
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: theme.text }]}>
                {socialModal.title}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setSocialModal((prev) => ({ ...prev, visible: false }))
                }
                style={[
                  s.modalCloseBtn,
                  { backgroundColor: theme.pillBg, borderColor: theme.border },
                ]}
              >
                <Text style={[s.modalCloseText, { color: theme.muted }]}>
                  X
                </Text>
              </TouchableOpacity>
            </View>

            {socialModal.loading ? (
              <Text style={{ color: theme.muted, paddingVertical: 20 }}>
                Loading...
              </Text>
            ) : socialModal.users.length === 0 ? (
              <Text style={{ color: theme.muted, paddingVertical: 20 }}>
                No users to show yet.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 360 }}>
                {socialModal.users.map((person) => (
                  <TouchableOpacity
                    key={person._id || person.id}
                    style={[s.userRow, { borderBottomColor: theme.border }]}
                    onPress={() => {
                      setSocialModal((prev) => ({ ...prev, visible: false }));
                      navigation.push("Creator", { creator: person });
                    }}
                  >
                    <Avatar
                      initial={person.name?.charAt(0)?.toUpperCase() || "?"}
                      color={person.avatarColor || theme.accent}
                      size={34}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.userName, { color: theme.text }]}>
                        {person.name}
                      </Text>
                      <Text style={[s.userHandle, { color: theme.muted }]}>
                        @{person.handle}
                      </Text>
                    </View>
                    <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

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
        {/* Cover */}
        <View
          style={[
            s.cover,
            { backgroundColor: heroRecipe?.cardColor || "#1A1410" },
          ]}
        >
          {heroRecipe && (
            <View
              style={[
                s.coverGlow,
                { backgroundColor: heroRecipe.accentColor + "55" },
              ]}
            />
          )}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={s.profileSection}>
          {/* Avatar */}
          <View style={[s.avatarWrap, { borderColor: theme.bg }]}>
            <Avatar
              initial={displayCreator?.name?.charAt(0)?.toUpperCase() || "?"}
              color={displayCreator?.avatarColor || theme.accent}
              size={76}
            />
          </View>

          {/* Name + follow */}
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.name, { color: theme.text }]}>
                {displayCreator?.name}
              </Text>
              <Text style={[s.handle, { color: theme.muted }]}>
                @{displayCreator?.handle}
              </Text>
            </View>
            {!isOwnProfile && (
              <TouchableOpacity
                onPress={toggle}
                style={[
                  s.followBtn,
                  {
                    backgroundColor: isFollowed ? theme.pillBg : theme.accent,
                    borderColor: isFollowed ? theme.border : theme.accent,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isFollowed ? theme.muted : "#fff",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {isFollowed ? "Following" : "+ Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bio */}
          <Text style={[s.bio, { color: theme.subtext }]}>
            {displayCreator?.bio || "No bio yet"}
          </Text>

          {/* Specialty badge */}
          <View
            style={[
              s.specialtyBadge,
              {
                backgroundColor: theme.accentSoft,
                borderColor: theme.accent + "33",
              },
            ]}
          >
            <Text style={{ fontSize: 14 }}>🍽</Text>
            <Text
              style={{ fontSize: 12, color: theme.accent, fontWeight: "500" }}
            >
              Specialises in {displayCreator?.specialty || "cooking"}
            </Text>
          </View>

          {/* Stats */}
          <View
            style={[
              s.statsRow,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <StatCell value={theirRecipes.length} label="Recipes" borderRight />
            <TouchableOpacity
              style={s.statButton}
              onPress={() => openSocialList("followers")}
            >
              <StatCell
                value={(displayCreator?.followers?.length || 0).toLocaleString()}
                label="Followers"
                borderRight
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.statButton}
              onPress={() => openSocialList("following")}
            >
              <StatCell
                value={displayCreator?.following?.length || 0}
                label="Following"
              />
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={s.actionRow}>
            {!isOwnProfile && (
              <TouchableOpacity
                onPress={toggle}
                style={[
                  s.actionBtn,
                  {
                    backgroundColor: isFollowed ? theme.pillBg : theme.accent,
                    flex: 2,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isFollowed ? theme.muted : "#fff",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {isFollowed ? "✓ Following" : "+ Follow"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                s.actionBtn,
                {
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  flex: 1,
                },
              ]}
            >
              <Text style={{ color: theme.text, fontSize: 14 }}>↗ Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Recipes */}
        {featuredRecipes.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.text }]}>
              ⭐ Featured Recipes
            </Text>
            <View style={s.featuredGrid}>
              {featuredRecipes.map((r) => (
                <TouchableOpacity
                  key={r._id || r.id}
                  onPress={() =>
                    navigation.navigate("RecipeDetail", {
                      recipe: r,
                    })
                  }
                  style={[
                    s.featuredCard,
                    { backgroundColor: r.cardColor, borderColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: r.accentColor + "33" },
                    ]}
                  />
                  <Text style={{ fontSize: 36 }}>{r.emoji}</Text>
                  <Text
                    style={[s.featuredTitle, { color: "#fff" }]}
                    numberOfLines={2}
                  >
                    {r.title}
                  </Text>
                  <View style={s.featuredMeta}>
                    <Stars rating={r.rating} size={10} />
                    <Text
                      style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}
                    >
                      {" "}
                      {r.rating}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Recipes */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.text }]}>
            All Recipes ({theirRecipes.length})
          </Text>
          {theirRecipes.map((r) => (
            <TouchableOpacity
              key={r._id || r.id}
              onPress={() =>
                navigation.navigate("RecipeDetail", {
                  recipe: r,
                })
              }
              style={[
                s.recipeRow,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={[s.recipeEmoji, { backgroundColor: r.cardColor }]}>
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: r.accentColor + "33" },
                  ]}
                />
                <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[s.recipeTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {r.title}
                </Text>
                <Text style={[s.recipeMeta, { color: theme.muted }]}>
                  {r.meal} · {r.cuisine} · {r.time}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 3,
                  }}
                >
                  <Stars rating={r.rating} size={11} />
                  <Text style={{ fontSize: 11, color: theme.muted }}>
                    {r.rating} · ♥ {(r.likes || 0).toLocaleString()} · 💬{" "}
                    {r.commentCount}
                  </Text>
                </View>
              </View>
              <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 44 },
  cover: { height: 180, position: "relative", justifyContent: "flex-end" },
  coverGlow: { ...StyleSheet.absoluteFillObject },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: { padding: 16, gap: 12 },
  avatarWrap: {
    marginTop: -38,
    borderWidth: 4,
    borderRadius: 42,
    alignSelf: "flex-start",
  },
  nameRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  name: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  handle: { fontSize: 14 },
  followBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1,
  },
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
  statButton: { flex: 1 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  section: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  featuredGrid: { flexDirection: "row", gap: 10 },
  featuredCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
    borderWidth: 1,
    minHeight: 130,
  },
  featuredTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 16,
  },
  featuredMeta: { flexDirection: "row", alignItems: "center" },
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  recipeEmoji: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  recipeTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  recipeMeta: { fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    padding: 16,
    maxHeight: "72%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { fontSize: 13, fontWeight: "800" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userName: { fontSize: 14, fontWeight: "700" },
  userHandle: { fontSize: 12, marginTop: 2 },
});
