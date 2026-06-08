import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen() {
  const { theme } = useTheme();

  const { login, register } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  // Refs for better keyboard navigation between inputs
  const nameRef = useRef(null);
  const handleRef = useRef(null);
  const emailRef = useRef(null);
  const passRef = useRef(null);

  // simple validation for enabling submit
  const canSubmit = (() => {
    if (loading) return false;
    if (mode === "login")
      return email.trim().length > 0 && password.trim().length > 0;
    return (
      name.trim().length > 0 &&
      handle.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8
    );
  })();

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        console.log("Login successful");
      } else {
        const data = await register(name, handle, email, password);

        Alert.alert(
          "Welcome!",
          `Account created successfully. Hi ${data.user.name}!`,
        );
        console.log("Registration success:", data);
      }
    } catch (err) {
      console.log("Auth error:", err);
      Alert.alert("Authentication failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    ls.input,
    {
      backgroundColor: theme.inputBg,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  return (
    <SafeAreaView style={[ls.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
        style={{ flex: 1 }}
      >
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
        <ScrollView
          contentContainerStyle={ls.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo area */}
          <View style={ls.logoArea}>
            <Text style={{ fontSize: 52 }}>🍴</Text>
            <Text style={[ls.appName, { color: theme.accent }]}>
              RecipeSocial
            </Text>
            <Text style={[ls.tagline, { color: theme.muted }]}>
              Create, share, and discover recipes
            </Text>
          </View>

          {/* Tab switcher */}
          <View
            style={[
              ls.tabRow,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {[
              ["login", "Sign In"],
              ["register", "Create Account"],
            ].map(([id, label]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setMode(id)}
                style={[
                  ls.tab,
                  {
                    backgroundColor: mode === id ? theme.accent : "transparent",
                  },
                ]}
              >
                <Text
                  style={{
                    color: mode === id ? "#fff" : theme.muted,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={ls.form}>
            {mode === "register" && (
              <>
                <View>
                  <Text style={[ls.label, { color: theme.muted }]}>
                    FULL NAME
                  </Text>
                  <TextInput
                    ref={nameRef}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Alex Rivera"
                    placeholderTextColor={theme.muted}
                    style={inputStyle}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => handleRef.current?.focus()}
                    blurOnSubmit={false}
                    textContentType="name"
                  />
                </View>
                <View>
                  <Text style={[ls.label, { color: theme.muted }]}>
                    USERNAME
                  </Text>
                  <View style={{ position: "relative" }}>
                    <Text style={[ls.atSign, { color: theme.muted }]}>@</Text>
                    <TextInput
                      ref={handleRef}
                      value={handle}
                      onChangeText={setHandle}
                      placeholder="yourhandle"
                      placeholderTextColor={theme.muted}
                      style={[inputStyle, { paddingLeft: 32 }]}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                </View>
              </>
            )}

            <View>
              <Text style={[ls.label, { color: theme.muted }]}>EMAIL</Text>
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.muted}
                style={inputStyle}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                blurOnSubmit={false}
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            <View>
              <Text style={[ls.label, { color: theme.muted }]}>PASSWORD</Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  ref={passRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={
                    mode === "register" ? "Min. 8 characters" : "Your password"
                  }
                  placeholderTextColor={theme.muted}
                  secureTextEntry={!showPass}
                  style={[inputStyle, { paddingRight: 44 }]}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={submit}
                  textContentType="password"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  style={ls.eyeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={
                    showPass ? "Hide password" : "Show password"
                  }
                >
                  <Text style={{ color: theme.muted, fontSize: 16 }}>
                    {showPass ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* inline hint for password when registering */}
            {mode === "register" &&
              password.length > 0 &&
              password.length < 8 && (
                <Text style={{ fontSize: 12, color: theme.error || "#e74c3c" }}>
                  Password should be at least 8 characters
                </Text>
              )}

            <TouchableOpacity
              onPress={submit}
              disabled={!canSubmit}
              style={[
                ls.submitBtn,
                {
                  backgroundColor: theme.accent,
                  opacity: canSubmit ? 1 : 0.5,
                },
              ]}
              accessibilityState={{ disabled: !canSubmit }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={ls.submitText}>
                  {mode === "login" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ls = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 44 },
  logoArea: { alignItems: "center", paddingVertical: 32, gap: 8 },
  appName: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { fontSize: 14 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  form: { gap: 14 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15 },
  atSign: { position: "absolute", left: 13, top: 14, zIndex: 1, fontSize: 15 },
  eyeBtn: { position: "absolute", right: 12, top: 12 },
  submitBtn: {
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  guestBtn: { alignItems: "center", paddingVertical: 8 },
  guestText: { fontSize: 14 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: 13 },
  socialRow: { gap: 10 },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
});
