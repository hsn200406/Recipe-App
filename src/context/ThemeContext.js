import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const makeTheme = (dark) => ({
  dark,
  bg: dark ? "#0D0D0D" : "#F5F2ED",
  surface: dark ? "#161616" : "#FFFFFF",
  card: dark ? "#1C1C1C" : "#FFFFFF",
  border: dark ? "#2A2A2A" : "#E8E2D9",
  text: dark ? "#F0EDE8" : "#1A1410",
  subtext: dark ? "#BBBBBB" : "#555555",
  muted: dark ? "#777777" : "#999999",
  accent: "#FF5C3A",
  accentSoft: dark ? "rgba(255,92,58,0.14)" : "rgba(255,92,58,0.10)",
  gold: dark ? "#F5C842" : "#C9960C",
  green: dark ? "#4CAF82" : "#2E7D5A",
  inputBg: dark ? "#222222" : "#EDE9E2",
  navBg: dark ? "#111111" : "#FFFFFF",
  pillBg: dark ? "#252525" : "#EDEAE4",
  pillText: dark ? "#AAAAAA" : "#666666",
  shadow: dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.72)",
});

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const theme = makeTheme(dark);
  return (
    <ThemeContext.Provider
      value={{ theme, dark, toggleDark: () => setDark((d) => !d) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
