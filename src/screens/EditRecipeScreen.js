import { useRoute, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  Image,
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
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pill, Toggle } from "../components/SharedComponents";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CUISINES, MEALS } from "../data/mockData";
import { recipeAPI } from "../services/api";

export default function EditRecipeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const { recipe } = route.params || {};

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(recipe?.title || "");
  const [desc, setDesc] = useState(recipe?.description || "");
  const [imageUrl, setImageUrl] = useState(recipe?.imageUrl || "");
  const [meal, setMeal] = useState(recipe?.meal || "");
  const [cuisine, setCuisine] = useState(recipe?.cuisine || "");
  const [time, setTime] = useState(recipe?.time || "");
  const [calories, setCalories] = useState(String(recipe?.calories || ""));
  const [protein, setProtein] = useState(String(recipe?.protein || ""));
  const [carbs, setCarbs] = useState(String(recipe?.carbs || ""));
  const [fat, setFat] = useState(String(recipe?.fat || ""));
  const [isPublic, setIsPublic] = useState(recipe?.isPublic ?? true);
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients?.length ? recipe.ingredients : [{ qty: "", name: "" }],
  );
  const [steps, setSteps] = useState(
    recipe?.steps?.length ? recipe.steps : [""],
  );

  const recipeId = recipe?._id || recipe?.id;

  const pickRecipeImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.55,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    const asset = result.assets[0];
    const sizeInMb = (asset.base64.length * 0.75) / 1024 / 1024;

    if (sizeInMb > 5) {
      Alert.alert("Image too large", "Please choose a smaller image.");
      return;
    }

    setImageUrl(`data:image/jpeg;base64,${asset.base64}`);
  };

  const updateIngredient = (i, field, value) => {
    setIngredients((current) =>
      current.map((item, index) =>
        index === i ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updateStep = (i, value) => {
    setSteps((current) =>
      current.map((item, index) => (index === i ? value : item)),
    );
  };

  const saveRecipe = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a recipe title.");
      return;
    }

    const cleanIngredients = ingredients.filter((item) => item.name.trim());
    const cleanSteps = steps.filter((item) => item.trim());

    if (cleanIngredients.length === 0) {
      Alert.alert("Ingredients required", "Please add at least one ingredient.");
      return;
    }

    if (cleanSteps.length === 0) {
      Alert.alert("Steps required", "Please add at least one step.");
      return;
    }

    try {
      setSaving(true);

      await recipeAPI.update(token, recipeId, {
        title: title.trim(),
        description: desc.trim(),
        imageUrl,
        meal,
        cuisine,
        isPublic,
        ingredients: cleanIngredients,
        steps: cleanSteps,
        time: time.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      Alert.alert("Recipe updated", "Your changes were saved.");
      navigation.navigate("Main", { screen: "Profile" });
    } catch (err) {
      Alert.alert("Update failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    er.input,
    {
      backgroundColor: theme.inputBg,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  if (!recipe) return null;

  return (
    <SafeAreaView style={[er.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          disabled={Platform.OS === "web"}
        >
          <View style={{ flex: 1 }}>
            <View
              style={[
                er.header,
                {
                  backgroundColor: theme.surface,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ color: theme.text, fontSize: 22 }}>←</Text>
              </TouchableOpacity>
              <Text style={[er.headerTitle, { color: theme.text }]}>
                Edit Recipe
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={er.scroll}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <Text style={[er.label, { color: theme.muted }]}>TITLE *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Recipe title"
                placeholderTextColor={theme.muted}
                style={inputStyle}
              />

              <Text style={[er.label, { color: theme.muted }]}>DESCRIPTION</Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="Short description"
                placeholderTextColor={theme.muted}
                multiline
                style={[inputStyle, er.textArea]}
              />

              <Text style={[er.label, { color: theme.muted }]}>PHOTO</Text>
              <TouchableOpacity
                onPress={pickRecipeImage}
                style={[
                  er.imagePicker,
                  {
                    backgroundColor: theme.card,
                    borderColor: imageUrl ? theme.accent : theme.border,
                  },
                ]}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={er.imagePreview}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={{ color: theme.muted }}>Upload a photo</Text>
                )}
              </TouchableOpacity>

              {!!imageUrl && (
                <View style={er.imageActions}>
                  <TouchableOpacity
                    onPress={pickRecipeImage}
                    style={[er.secondaryBtn, { borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.text, fontWeight: "600" }}>
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setImageUrl("")}
                    style={[er.secondaryBtn, { borderColor: "#EF4444" }]}
                  >
                    <Text style={{ color: "#EF4444", fontWeight: "600" }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[er.label, { color: theme.muted }]}>MEAL TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MEALS.filter((m) => m !== "All").map((m) => (
                  <View key={m} style={{ marginRight: 6 }}>
                    <Pill active={meal === m} onPress={() => setMeal(m)} small>
                      {m}
                    </Pill>
                  </View>
                ))}
              </ScrollView>

              <Text style={[er.label, { color: theme.muted }]}>CUISINE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CUISINES.filter((c) => c !== "All").map((c) => (
                  <View key={c} style={{ marginRight: 6 }}>
                    <Pill
                      active={cuisine === c}
                      onPress={() => setCuisine(c)}
                      small
                    >
                      {c}
                    </Pill>
                  </View>
                ))}
              </ScrollView>

              <Text style={[er.label, { color: theme.muted }]}>TIME</Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="e.g. 30 min"
                placeholderTextColor={theme.muted}
                style={inputStyle}
              />

              <View style={er.twoCol}>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="Calories"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                  style={[inputStyle, { flex: 1 }]}
                />
                <TextInput
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="Protein"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                  style={[inputStyle, { flex: 1 }]}
                />
              </View>

              <View style={er.twoCol}>
                <TextInput
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="Carbs"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                  style={[inputStyle, { flex: 1 }]}
                />
                <TextInput
                  value={fat}
                  onChangeText={setFat}
                  placeholder="Fat"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                  style={[inputStyle, { flex: 1 }]}
                />
              </View>

              <Text style={[er.label, { color: theme.muted }]}>INGREDIENTS</Text>
              {ingredients.map((ingredient, i) => (
                <View key={i} style={er.row}>
                  <TextInput
                    value={ingredient.qty}
                    onChangeText={(value) => updateIngredient(i, "qty", value)}
                    placeholder="Qty"
                    placeholderTextColor={theme.muted}
                    style={[inputStyle, er.qtyInput]}
                  />
                  <TextInput
                    value={ingredient.name}
                    onChangeText={(value) => updateIngredient(i, "name", value)}
                    placeholder={`Ingredient ${i + 1}`}
                    placeholderTextColor={theme.muted}
                    style={[inputStyle, { flex: 1 }]}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={() =>
                  setIngredients((current) => [
                    ...current,
                    { qty: "", name: "" },
                  ])
                }
                style={[er.addBtn, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.accent, fontWeight: "600" }}>
                  + Add Ingredient
                </Text>
              </TouchableOpacity>

              <Text style={[er.label, { color: theme.muted }]}>STEPS</Text>
              {steps.map((stepText, i) => (
                <TextInput
                  key={i}
                  value={stepText}
                  onChangeText={(value) => updateStep(i, value)}
                  placeholder={`Step ${i + 1}`}
                  placeholderTextColor={theme.muted}
                  multiline
                  style={[inputStyle, er.textArea]}
                />
              ))}
              <TouchableOpacity
                onPress={() => setSteps((current) => [...current, ""])}
                style={[er.addBtn, { borderColor: theme.border }]}
              >
                <Text style={{ color: theme.accent, fontWeight: "600" }}>
                  + Add Step
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  er.visibilityRow,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View>
                  <Text style={[er.visTitle, { color: theme.text }]}>
                    {isPublic ? "Public" : "Private"}
                  </Text>
                  <Text style={[er.visDesc, { color: theme.muted }]}>
                    {isPublic
                      ? "Anyone can discover this recipe"
                      : "Only you can see this recipe"}
                  </Text>
                </View>
                <Toggle value={isPublic} onToggle={() => setIsPublic((v) => !v)} />
              </View>

              <TouchableOpacity
                disabled={saving}
                onPress={saveRecipe}
                style={[er.saveBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={er.saveText}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const er = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  scroll: { padding: 16, paddingBottom: 44, gap: 12 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  textArea: { minHeight: 80, textAlignVertical: "top", lineHeight: 20 },
  imagePicker: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: { width: "100%", height: "100%", backgroundColor: "#111" },
  imageActions: { flexDirection: "row", gap: 10 },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  twoCol: { flexDirection: "row", gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  qtyInput: { width: 72 },
  addBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
  },
  visTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  visDesc: { fontSize: 12 },
  saveBtn: { padding: 15, borderRadius: 14, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
