import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toggle } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userAPI } from "../services/api";

function SettingsRow({ icon, label, right, onPress, danger, last }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        s.row,
        { borderBottomColor: theme.border, borderBottomWidth: last ? 0 : 1 },
      ]}
    >
      <Text style={{ fontSize: 18, width: 28 }}>{icon}</Text>
      <Text style={[s.rowLabel, { color: danger ? "#EF4444" : theme.text }]}>
        {label}
      </Text>
      <View style={s.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

function SettingsSection({ title, children }) {
  const { theme } = useTheme();
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: theme.muted }]}>{title}</Text>
      <View
        style={[
          s.sectionCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, dark, toggleDark } = useTheme();
  const { logout, user, token } = useAuth();
  const navigation = useNavigation();

  const chevron = <Text style={{ fontSize: 18, color: theme.muted }}>›</Text>;

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
  const deleteAccount = async () => {
    try {
      await userAPI.deleteMe(token);
      await logout();
    } catch (err) {
      Alert.alert("Delete failed", err.message);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View
        style={[
          s.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 22, color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View
          style={[
            s.profileCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={[s.profileAvatar, { backgroundColor: theme.accent }]}>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.profileName, { color: theme.text }]}>
              {user?.name || "Unknown User"}
            </Text>
            <Text style={[s.profileHandle, { color: theme.muted }]}>
              @{user?.handle || "unknown"}
            </Text>
          </View>
          <TouchableOpacity
            style={[s.editProfileBtn, { borderColor: theme.border }]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={[s.editProfileText, { color: theme.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <SettingsSection title="APPEARANCE">
          <SettingsRow
            icon="🌙"
            label="Dark Mode"
            last
            right={<Toggle value={dark} onToggle={toggleDark} />}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="ACCOUNT">
          <SettingsRow
            icon="👤"
            label="Edit Profile"
            right={chevron}
            onPress={() => navigation.navigate("EditProfile")}
            last
          />
          {/* <SettingsRow icon="🔒" label="Change Password"    right={chevron} onPress={() => Alert.alert('Change Password', '🔌 PUT /api/auth/password')} />
          <SettingsRow icon="🔗" label="Connected Accounts" right={chevron} onPress={() => Alert.alert('Connected Accounts', 'Google, Apple Sign-In support via Expo AuthSession.')} last /> */}
        </SettingsSection>

        {/* About */}
        <SettingsSection title="ABOUT">
          <SettingsRow
            icon="📋"
            label="Terms of Service"
            right={chevron}
            onPress={() =>
              Alert.alert("Terms", "https://recipesocial.app/terms")
            }
          />
          <SettingsRow
            icon="🔐"
            label="Privacy Policy"
            right={chevron}
            onPress={() =>
              Alert.alert("Privacy", "https://recipesocial.app/privacy")
            }
          />
          <SettingsRow
            icon="ℹ️"
            label="App Version"
            right={
              <Text style={{ color: theme.muted, fontSize: 13 }}>
                1.0.0 (SDK 54)
              </Text>
            }
            last
          />
        </SettingsSection>

        {/* Danger zone */}
        <SettingsSection title="DANGER ZONE">
          <SettingsRow
            icon="🚪"
            label="Log Out"
            danger
            onPress={() =>
              confirmAction("Log Out", "Are you sure you want to log out?", async () => {
                await logout();
              })
            }
          />
          <SettingsRow
            icon="🗑"
            label="Delete Account"
            danger
            last
            onPress={() =>
              confirmAction(
                "Delete Account",
                "This cannot be undone. All your recipes will be permanently deleted.",
                deleteAccount,
              )
            }
          />
        </SettingsSection>

        <View style={{ height: 24 }} />
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
  headerTitle: { fontSize: 20, fontWeight: "700", flex: 1 },
  scroll: { padding: 16, gap: 0 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  profileHandle: { fontSize: 13 },
  editProfileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  editProfileText: { fontSize: 13, fontWeight: "500" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { flex: 1, fontSize: 15, marginLeft: 10 },
  rowRight: { alignItems: "flex-end" },
});

