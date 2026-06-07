import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ initial, color, size = 36 }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: theme.border,
      }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.4, fontWeight: "700" }}>
        {initial}
      </Text>
    </View>
  );
}

// ── Pill / Tag chip ───────────────────────────────────────────────────────────
export function Pill({ children, active, onPress, small }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? theme.accent : theme.pillBg,
        borderColor: active ? theme.accent : theme.border,
        borderWidth: 1,
        borderRadius: 100,
        paddingHorizontal: small ? 10 : 14,
        paddingVertical: small ? 4 : 7,
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : theme.pillText,
          fontSize: small ? 11 : 12,
          fontWeight: "500",
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// ── Star rating display ───────────────────────────────────────────────────────
export function Stars({ rating, size = 13 }) {
  const { theme } = useTheme();
  const full = Math.floor(rating);
  const empty = 5 - full;
  return (
    <Text style={{ color: theme.gold, fontSize: size, letterSpacing: -1 }}>
      {"★".repeat(full)}
      {"☆".repeat(empty)}
    </Text>
  );
}

// ── Macro bar ─────────────────────────────────────────────────────────────────
export function MacroBar({ label, value, max, color }) {
  const { theme } = useTheme();
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10, color: theme.muted, marginBottom: 3 }}>
        {label}
      </Text>
      <View
        style={{
          backgroundColor: theme.border,
          borderRadius: 4,
          height: 5,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            height: "100%",
            borderRadius: 4,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 11,
          color: theme.text,
          marginTop: 3,
          fontWeight: "500",
        }}
      >
        {value}g
      </Text>
    </View>
  );
}

// ── Header row ────────────────────────────────────────────────────────────────
export function ScreenHeader({ title, onBack, right }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.surface,
      }}
    >
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={{ marginRight: 12, padding: 4 }}
        >
          <Text style={{ fontSize: 22, color: theme.text }}>←</Text>
        </TouchableOpacity>
      )}
      <Text
        style={{ flex: 1, fontSize: 18, fontWeight: "700", color: theme.text }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
export function SectionHeading({ children }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        color: theme.muted,
        fontWeight: "600",
        letterSpacing: 0.8,
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      {children.toUpperCase()}
    </Text>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
export function Toggle({ value, onToggle }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        backgroundColor: value ? theme.accent : theme.pillBg,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: "center",
        paddingHorizontal: 2,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#fff",
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </TouchableOpacity>
  );
}

// ── Stat cell (for profile/creator grids) ────────────────────────────────────
export function StatCell({ value, label, borderRight }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderRightWidth: borderRight ? 1 : 0,
        borderRightColor: theme.border,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}
