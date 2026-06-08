import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

import RootNavigator from "./src/navigation/RootNavigator";

const linking = {
  prefixes: ["https://magical-melba-9488ff.netlify.app", "recipesocial://"],
  config: {
    screens: {
      Main: "",
      RecipeDetail: "recipe/:recipeId",
      Creator: "creator/:handle",
    },
  },
};

function AppInner() {
  const { dark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={dark ? "light" : "dark"} />

      <View style={styles.appShell}>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 520 : undefined,
    alignSelf: "center",
  },
});
