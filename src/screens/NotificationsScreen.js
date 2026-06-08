import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { notificationAPI } from "../services/api";

const NOTIF_ICON = {
  follow: "+",
  like: "♥",
};

const NOTIF_COLOR = (type, theme) =>
  ({
    follow: theme.green,
    like: theme.accent,
  })[type] || theme.muted;

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const data = await notificationAPI.getAll(token);
      setNotifs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Notifications error:", err.message);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const markRead = async (id) => {
    setNotifs((current) =>
      current.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );

    try {
      await notificationAPI.markRead(token, id);
    } catch (err) {
      console.log("Mark read error:", err.message);
    }
  };

  const markAllRead = async () => {
    setNotifs((current) => current.map((n) => ({ ...n, read: true })));

    try {
      await notificationAPI.markAllRead(token);
    } catch (err) {
      console.log("Mark all read error:", err.message);
    }
  };

  const getNotificationText = (notif) => {
    if (notif.type === "follow") return "started following you";

    if (notif.type === "like") {
      return `liked your recipe${
        notif.recipeId?.title ? `: ${notif.recipeId.title}` : ""
      }`;
    }

    return "interacted with you";
  };

  const getTime = (dateValue) => {
    const diff = Date.now() - new Date(dateValue).getTime();
    const minutes = Math.max(1, Math.floor(diff / 60000));

    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  };

  const groups = [
    {
      label: "Recent",
      items: notifs.filter((n) => {
        const hours = (Date.now() - new Date(n.createdAt).getTime()) / 3600000;
        return hours < 24;
      }),
    },
    {
      label: "Earlier",
      items: notifs.filter((n) => {
        const hours = (Date.now() - new Date(n.createdAt).getTime()) / 3600000;
        return hours >= 24;
      }),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View
        style={[
          s.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 22, color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={s.markAllBtn}>
            <Text
              style={{ color: theme.accent, fontSize: 13, fontWeight: "600" }}
            >
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View
          style={[
            s.unreadBanner,
            {
              backgroundColor: theme.accentSoft,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <Text
            style={{ color: theme.accent, fontSize: 13, fontWeight: "600" }}
          >
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </Text>
        </View>
      )}

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
        {notifs.length === 0 ? (
          <View style={s.empty}>
            <Text style={[s.emptyIcon, { color: theme.muted }]}>bell</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>
              No notifications yet
            </Text>
            <Text style={[s.emptyDesc, { color: theme.muted }]}>
              Follows and recipe likes will show up here.
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.label}>
              <Text style={[s.groupLabel, { color: theme.muted }]}>
                {group.label.toUpperCase()}
              </Text>
              {group.items.map((notif) => (
                <TouchableOpacity
                  key={notif._id}
                  onPress={() => markRead(notif._id)}
                  activeOpacity={0.75}
                  style={[
                    s.notifRow,
                    {
                      backgroundColor: notif.read
                        ? theme.card
                        : theme.dark
                          ? "#1E1A14"
                          : "#FFF9F7",
                      borderColor: notif.read
                        ? theme.border
                        : theme.accent + "44",
                    },
                  ]}
                >
                  <View style={s.avatarWrap}>
                    <Avatar
                      initial={
                        notif.actorId?.name?.charAt(0)?.toUpperCase() || "?"
                      }
                      color={notif.actorId?.avatarColor || theme.accent}
                      size={42}
                    />
                    <View
                      style={[
                        s.typeBadge,
                        { backgroundColor: NOTIF_COLOR(notif.type, theme) },
                      ]}
                    >
                      <Text style={s.typeBadgeText}>
                        {NOTIF_ICON[notif.type] || ""}
                      </Text>
                    </View>
                  </View>

                  <View style={s.notifContent}>
                    <Text style={[s.notifText, { color: theme.text }]}>
                      <Text style={{ fontWeight: "700" }}>
                        @{notif.actorId?.handle || "someone"}
                      </Text>{" "}
                      {getNotificationText(notif)}
                    </Text>
                    <Text style={[s.notifTime, { color: theme.muted }]}>
                      {getTime(notif.createdAt)}
                    </Text>
                  </View>

                  {!notif.read && (
                    <View
                      style={[s.unreadDot, { backgroundColor: theme.accent }]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: "700" },
  markAllBtn: { padding: 4 },
  unreadBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  scroll: { padding: 16, paddingBottom: 36, gap: 8 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  avatarWrap: { position: "relative" },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  notifContent: { flex: 1, gap: 3 },
  notifText: { fontSize: 14, lineHeight: 20 },
  notifTime: { fontSize: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 52,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
