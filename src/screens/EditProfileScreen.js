import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userAPI } from "../services/api";

const AVATAR_COLORS = [
  "#FF5C3A",
  "#F5C842",
  "#4CAF82",
  "#7C3AED",
  "#2563EB",
  "#EC4899",
];

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, token, updateCurrentUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [handle, setHandle] = useState(user?.handle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [specialty, setSpecialty] = useState(user?.specialty || "");
  const [avatarColor, setAvatarColor] = useState(
    user?.avatarColor || "#FF5C3A",
  );
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    if (!handle.trim()) {
      Alert.alert("Handle required", "Please enter your username.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await userAPI.updateProfile(token, {
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        bio: bio.trim(),
        specialty: specialty.trim(),
        avatarColor,
      });

      await updateCurrentUser(updatedUser);

      Alert.alert("Profile updated", "Your profile was saved.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert("Update failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
      <View
        style={[
          s.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 22, color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>Edit Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={s.avatarPreviewWrap}>
          <View style={[s.avatarPreview, { backgroundColor: avatarColor }]}>
            <Text style={s.avatarInitial}>
              {name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        </View>

        <View>
          <Text style={[s.label, { color: theme.muted }]}>AVATAR COLOR</Text>
          <View style={s.colorRow}>
            {AVATAR_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setAvatarColor(color)}
                style={[
                  s.colorDot,
                  {
                    backgroundColor: color,
                    borderColor:
                      avatarColor === color ? theme.text : "transparent",
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[s.label, { color: theme.muted }]}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.muted}
            style={[
              s.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        <View>
          <Text style={[s.label, { color: theme.muted }]}>USERNAME</Text>
          <TextInput
            value={handle}
            onChangeText={setHandle}
            placeholder="username"
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
            style={[
              s.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        <View>
          <Text style={[s.label, { color: theme.muted }]}>SPECIALTY</Text>
          <TextInput
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="Italian, vegan, high protein..."
            placeholderTextColor={theme.muted}
            style={[
              s.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        <View>
          <Text style={[s.label, { color: theme.muted }]}>BIO</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people what you cook..."
            placeholderTextColor={theme.muted}
            multiline
            style={[
              s.input,
              s.bioInput,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        <TouchableOpacity
          disabled={saving}
          onPress={saveProfile}
          style={[
            s.saveBtn,
            { backgroundColor: saving ? theme.muted : theme.accent },
          ]}
        >
          <Text style={s.saveText}>
            {saving ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  scroll: { padding: 16, paddingBottom: 44, gap: 16 },

  avatarPreviewWrap: { alignItems: "center", marginBottom: 4 },
  avatarPreview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 34, fontWeight: "700" },

  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  colorRow: {
    flexDirection: "row",
    gap: 10,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
  },
  saveBtn: {
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});



