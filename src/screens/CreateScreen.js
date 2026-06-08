import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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

// ── AI Capture Modal ──────────────────────────────────────────────────────────
function AICaptureModal({ visible, onClose }) {
  const { theme } = useTheme();
  const [phase, setPhase] = useState("ready"); // ready | scanning | recording | done
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const startScan = () => {
    setPhase("scanning");
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 3;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current);
        setPhase("recording");
      }
    }, 60);
  };

  const resetAndClose = () => {
    clearInterval(timerRef.current);
    setPhase("ready");
    setProgress(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <TouchableOpacity
        style={[ac.overlay, { backgroundColor: theme.overlay }]}
        activeOpacity={1}
        onPress={resetAndClose}
      />
      <View
        style={[
          ac.sheet,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <View style={ac.handle} />
        <View style={ac.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 20 }}>✦</Text>
            <Text style={[ac.headerTitle, { color: theme.text }]}>
              AI Recipe Capture
            </Text>
            <View style={ac.aiBadge}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                AI
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={resetAndClose}>
            <Text style={{ fontSize: 24, color: theme.muted }}>×</Text>
          </TouchableOpacity>
        </View>

        {/* 🔌 API NOTE: startScan → calls POST /api/ai/scan-ingredients (Google Vision API)
                                    recordingDone → calls POST /api/ai/transcribe (OpenAI Whisper)
            Add to backend .env: GOOGLE_VISION_API_KEY and OPENAI_API_KEY */}

        {phase === "ready" && (
          <View style={ac.phaseContainer}>
            <View
              style={[
                ac.cameraCircle,
                {
                  borderColor: theme.accent,
                  backgroundColor: theme.accent + "15",
                },
              ]}
            >
              <Text style={{ fontSize: 48 }}>📷</Text>
            </View>
            <Text style={[ac.phaseDesc, { color: theme.muted }]}>
              Point your camera at your ingredients. AI will detect them, then
              you speak your cooking instructions.
            </Text>
            <TouchableOpacity
              onPress={startScan}
              style={[ac.primaryBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={ac.primaryBtnText}>Start Scanning Ingredients</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === "scanning" && (
          <View style={ac.phaseContainer}>
            <Text style={{ fontSize: 52, marginBottom: 16 }}>🔍</Text>
            <View style={[ac.progressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  ac.progressFill,
                  { width: `${progress}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>
            <Text style={[ac.phaseLabel, { color: theme.text }]}>
              Scanning ingredients… {progress}%
            </Text>
            <Text style={[ac.phaseHint, { color: theme.muted }]}>
              Powered by Google Vision API
            </Text>
          </View>
        )}

        {phase === "recording" && (
          <View style={{ width: "100%" }}>
            <View
              style={[
                ac.detectedBox,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[ac.detectedTitle, { color: theme.text }]}>
                🎯 Detected Ingredients
              </Text>
              <View style={ac.ingredientChips}>
                {[
                  "Ramen noodles",
                  "Miso paste",
                  "Eggs",
                  "Corn",
                  "Nori",
                  "Sesame oil",
                ].map((i) => (
                  <View
                    key={i}
                    style={[
                      ac.chip,
                      {
                        backgroundColor: theme.accentSoft,
                        borderColor: theme.accent + "44",
                      },
                    ]}
                  >
                    <Text style={{ color: theme.accent, fontSize: 12 }}>
                      {i}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={ac.recordingRow}>
              <View style={ac.recordDot} />
              <Text style={{ color: theme.text, fontSize: 14 }}>
                Recording… speak your instructions
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPhase("done")}
              style={[
                ac.primaryBtn,
                {
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[ac.primaryBtnText, { color: theme.text }]}>
                Finish Recording
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === "done" && (
          <View style={ac.phaseContainer}>
            <Text style={{ fontSize: 52, marginBottom: 12 }}>✅</Text>
            <Text style={[ac.doneTitle, { color: theme.text }]}>
              Recipe Draft Ready!
            </Text>
            <Text style={[ac.phaseDesc, { color: theme.muted }]}>
              AI has transcribed your instructions and structured the recipe.
              Review before publishing.
            </Text>
            <View style={ac.doneButtons}>
              <TouchableOpacity
                onPress={resetAndClose}
                style={[
                  ac.doneBtn,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Save Draft
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetAndClose}
                style={[ac.doneBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Review & Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
const ac = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 48,
    borderTopWidth: 1,
    alignItems: "center",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  aiBadge: {
    backgroundColor: "#7C3AED",
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  phaseContainer: { alignItems: "center", width: "100%" },
  cameraCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: 16,
  },
  phaseDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    marginBottom: 14,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  phaseLabel: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  phaseHint: { fontSize: 12 },
  detectedBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
    width: "100%",
  },
  detectedTitle: { fontSize: 13, fontWeight: "600", marginBottom: 10 },
  ingredientChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    width: "100%",
  },
  recordDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f00",
  },
  doneTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  doneButtons: { flexDirection: "row", gap: 10, width: "100%" },
  doneBtn: {
    flex: 1,
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
    borderWidth: 1,
  },
});

// ── Create Screen ─────────────────────────────────────────────────────────────
export default function CreateScreen() {
  const { theme } = useTheme();

  const { token } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [step, setStep] = useState(1); // 1=details 2=ingredients 3=steps 4=publish
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [meal, setMeal] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [time, setTime] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  // const [videoFile, setVideoFile] = useState(null);
  const [ingredients, setIngredients] = useState([
    { qty: "", name: "" },
    { qty: "", name: "" },
    { qty: "", name: "" },
  ]);
  const [steps, setSteps] = useState(["", ""]);
  const [showAI, setShowAI] = useState(false);

  const pickRecipeImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo access so you can upload a recipe image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.55,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert("Image failed", "Please choose a different image.");
      return;
    }

    const sizeInMb = (asset.base64.length * 0.75) / 1024 / 1024;

    if (sizeInMb > 5) {
      Alert.alert(
        "Image too large",
        "Please choose a smaller image so the recipe can upload smoothly.",
      );
      return;
    }

    setImageUrl(`data:image/jpeg;base64,${asset.base64}`);
  };

  // const pickVideo = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") {
  //     Alert.alert(
  //       "Permission needed",
  //       "Please allow access to your photo library.",
  //     );
  //     return;
  //   }
  //   const res = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: [ImagePicker.MediaType.Video],
  //     quality: 0.8,
  //   });
  //   if (!res.canceled && res.assets[0]) {
  //     setVideoFile(res.assets[0]);
  //     // 🔌 API NOTE: Upload with: await uploadVideo(token, res.assets[0].uri)
  //     // from src/services/api.js — returns a videoUrl to store with the recipe
  //   }
  // };

  const updateIngredient = (i, field, val) => {
    const arr = [...ingredients];
    arr[i] = { ...arr[i], [field]: val };
    setIngredients(arr);
  };

  const updateStep = (i, val) => {
    const arr = [...steps];
    arr[i] = val;
    setSteps(arr);
  };

  // 🔌 API NOTE: publish() calls recipeAPI.create() with all the recipe details to save to backend
  const publish = async () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a recipe title.");
      return;
    }

    try {
      setPublishing(true);

      const cleanIngredients = ingredients.filter((i) => i.name.trim());
      const cleanSteps = steps.filter((s) => s.trim());

      if (cleanIngredients.length === 0) {
        Alert.alert(
          "Ingredients required",
          "Please add at least one ingredient.",
        );
        return;
      }

      if (cleanSteps.length === 0) {
        Alert.alert(
          "Steps required",
          "Please add at least one instruction step.",
        );
        return;
      }

      await recipeAPI.create(token, {
        title: title.trim(),
        description: desc.trim(),
        imageUrl: imageUrl.trim(),
        meal,
        cuisine,
        isPublic,
        ingredients: cleanIngredients,
        steps: cleanSteps,
        videoUrl: "",
        hasVideo: false,
        time: time.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      Alert.alert("Recipe Published!", "Your recipe was saved successfully.");

      setStep(1);
      setTitle("");
      setDesc("");
      setImageUrl("");
      setMeal("");
      setCuisine("");
      setTime("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setIsPublic(true);
      // setVideoFile(null);
      setIngredients([
        { qty: "", name: "" },
        { qty: "", name: "" },
        { qty: "", name: "" },
      ]);
      setSteps(["", ""]);
    } catch (err) {
      Alert.alert("Publish failed", err.message);
    } finally {
      setPublishing(false);
    }
  };

  const inputStyle = [
    cr.input,
    {
      backgroundColor: theme.inputBg,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  return (
    <SafeAreaView style={[cr.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          disabled={Platform.OS === "web"}
        >
          <View style={{ flex: 1 }}>
            {/* <AICaptureModal visible={showAI} onClose={() => setShowAI(false)} /> */}

            {/* Header */}
            <View
              style={[
                cr.header,
                {
                  backgroundColor: theme.surface,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <Text style={[cr.headerTitle, { color: theme.text }]}>
                New Recipe
              </Text>
              {/* Step indicator */}
              <View style={cr.steps}>
                {[1, 2, 3, 4].map((n) => (
                  <View key={n} style={cr.stepItem}>
                    <View
                      style={[
                        cr.stepDot,
                        {
                          backgroundColor:
                            step >= n ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        {n}
                      </Text>
                    </View>
                    {n < 4 && (
                      <View
                        style={[
                          cr.stepLine,
                          {
                            backgroundColor:
                              step > n ? theme.accent : theme.border,
                          },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
              <Text style={[cr.stepLabel, { color: theme.muted }]}>
                {["Details", "Ingredients", "Steps", "Publish"][step - 1]}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={cr.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* STEP 1: Details */}
              {step === 1 && (
                <View style={{ gap: 16 }}>
                  {/* AI Banner */}
                  {/* <TouchableOpacity onPress={() => setShowAI(true)}
              style={[cr.aiBanner, { backgroundColor: theme.dark ? '#1a0a2e' : '#f0ebff', borderColor: '#7C3AED44' }]}
            >
              <Text style={{ fontSize: 28 }}>🤖</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[cr.aiBannerTitle, { color: theme.text }]}>AI Recipe Capture</Text>
                  <View style={{ backgroundColor: '#7C3AED', borderRadius: 100, paddingHorizontal: 7, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>AI</Text>
                  </View>
                </View>
                <Text style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>Point camera · Speak · Let AI do the rest</Text>
              </View>
              <Text style={{ color: theme.muted, fontSize: 18 }}>→</Text>
            </TouchableOpacity> */}

                  <View>
                    <Text style={[cr.label, { color: theme.muted }]}>
                      RECIPE TITLE *
                    </Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="e.g. Nonna's Tomato Sauce"
                      placeholderTextColor={theme.muted}
                      style={inputStyle}
                    />
                  </View>

                  <View>
                    <Text style={[cr.label, { color: theme.muted }]}>
                      DESCRIPTION
                    </Text>
                    <TextInput
                      value={desc}
                      onChangeText={setDesc}
                      placeholder="A short description of your recipe…"
                      placeholderTextColor={theme.muted}
                      multiline
                      numberOfLines={3}
                      style={[
                        inputStyle,
                        {
                          minHeight: 80,
                          textAlignVertical: "top",
                          lineHeight: 20,
                        },
                      ]}
                    />
                  </View>

                  <View>
                    <Text style={[cr.label, { color: theme.muted }]}>
                      RECIPE PHOTO
                    </Text>
                    <TouchableOpacity
                      onPress={pickRecipeImage}
                      activeOpacity={0.82}
                      style={[
                        cr.imagePicker,
                        {
                          backgroundColor: theme.card,
                          borderColor: imageUrl ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      {imageUrl ? (
                        <Image
                          source={{ uri: imageUrl }}
                          style={cr.imagePreview}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={cr.imageEmpty}>
                          <Text style={[cr.imageIcon, { color: theme.muted }]}>
                            +
                          </Text>
                          <Text
                            style={[cr.imageTitle, { color: theme.text }]}
                          >
                            Upload a recipe photo
                          </Text>
                          <Text
                            style={[cr.imageHint, { color: theme.muted }]}
                          >
                            Choose from files or photos
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {imageUrl ? (
                      <View style={cr.imageActions}>
                        <TouchableOpacity
                          onPress={pickRecipeImage}
                          style={[
                            cr.imageActionBtn,
                            { borderColor: theme.border },
                          ]}
                        >
                          <Text
                            style={{ color: theme.text, fontWeight: "600" }}
                          >
                            Change Photo
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setImageUrl("")}
                          style={[
                            cr.imageActionBtn,
                            { borderColor: "#EF4444" },
                          ]}
                        >
                          <Text style={{ color: "#EF4444", fontWeight: "600" }}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>

                  <View style={cr.twoCol}>
                    <View style={{ flex: 1 }}>
                      <Text style={[cr.label, { color: theme.muted }]}>
                        MEAL TYPE
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {MEALS.filter((m) => m !== "All").map((m) => (
                          <View key={m} style={{ marginRight: 6 }}>
                            <Pill
                              active={meal === m}
                              onPress={() => setMeal(m)}
                              small
                            >
                              {m}
                            </Pill>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>

                  <View>
                    <Text style={[cr.label, { color: theme.muted }]}>
                      CUISINE
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
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
                  </View>

                  <View>
                    <Text style={[cr.label, { color: theme.muted }]}>TIME</Text>
                    <TextInput
                      value={time}
                      onChangeText={setTime}
                      placeholder="e.g. 30 min"
                      placeholderTextColor={theme.muted}
                      style={inputStyle}
                    />
                  </View>

                  <View style={cr.twoCol}>
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

                  <View style={cr.twoCol}>
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

                  {/* Video upload */}
                  {/* <View>
              <Text style={[cr.label, { color: theme.muted }]}>
                RECIPE VIDEO (OPTIONAL)
              </Text>
              <TouchableOpacity
                onPress={pickVideo}
                style={[
                  cr.videoPicker,
                  {
                    borderColor: videoFile ? theme.green : theme.border,
                    backgroundColor: videoFile
                      ? theme.dark
                        ? "#0d1a12"
                        : "#f0fff6"
                      : theme.inputBg,
                  },
                ]}
              >
                <Text style={{ fontSize: 30, marginBottom: 6 }}>
                  {videoFile ? "✅" : "🎬"}
                </Text>
                <Text
                  style={[
                    cr.videoLabel,
                    { color: videoFile ? theme.green : theme.muted },
                  ]}
                >
                  {videoFile
                    ? videoFile.uri.split("/").pop()
                    : "Tap to upload a cooking video"}
                </Text>
                <Text
                  style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}
                >
                  MP4, MOV · max 500MB
                </Text>
              </TouchableOpacity>
            </View> */}

                  {/* Visibility */}
                  <View
                    style={[
                      cr.visibilityRow,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View>
                      <Text style={[cr.visTitle, { color: theme.text }]}>
                        {isPublic ? "🌍 Public" : "🔒 Private"}
                      </Text>
                      <Text style={[cr.visDesc, { color: theme.muted }]}>
                        {isPublic
                          ? "Anyone can discover this recipe"
                          : "Only you can see this"}
                      </Text>
                    </View>
                    <Toggle
                      value={isPublic}
                      onToggle={() => setIsPublic((p) => !p)}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (!title.trim()) {
                        Alert.alert(
                          "Title required",
                          "Please enter a recipe title.",
                        );
                        return;
                      }
                      setStep(2);
                    }}
                    style={[cr.nextBtn, { backgroundColor: theme.accent }]}
                  >
                    <Text style={cr.nextBtnText}>
                      Continue → Add Ingredients
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: Ingredients */}
              {step === 2 && (
                <View style={{ gap: 12 }}>
                  <Text style={[cr.stepHeading, { color: theme.text }]}>
                    Ingredients
                  </Text>
                  <Text style={[cr.stepHint, { color: theme.muted }]}>
                    Add your ingredients with quantities.
                  </Text>
                  {ingredients.map((ing, i) => (
                    <View key={i} style={cr.ingRow}>
                      <TextInput
                        value={ing.qty}
                        onChangeText={(v) => updateIngredient(i, "qty", v)}
                        placeholder="Qty"
                        placeholderTextColor={theme.muted}
                        style={[inputStyle, cr.qtyInput]}
                      />
                      <TextInput
                        value={ing.name}
                        onChangeText={(v) => updateIngredient(i, "name", v)}
                        placeholder={`Ingredient ${i + 1}`}
                        placeholderTextColor={theme.muted}
                        style={[inputStyle, { flex: 1 }]}
                      />
                      {ingredients.length > 1 && (
                        <TouchableOpacity
                          onPress={() =>
                            setIngredients((arr) =>
                              arr.filter((_, idx) => idx !== i),
                            )
                          }
                        >
                          <Text style={{ color: theme.muted, fontSize: 20 }}>
                            ×
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() =>
                      setIngredients((arr) => [...arr, { qty: "", name: "" }])
                    }
                    style={[cr.addRowBtn, { borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.accent, fontWeight: "600" }}>
                      + Add Ingredient
                    </Text>
                  </TouchableOpacity>
                  <View style={cr.navBtns}>
                    <TouchableOpacity
                      onPress={() => setStep(1)}
                      style={[cr.backBtn2, { borderColor: theme.border }]}
                    >
                      <Text style={{ color: theme.text, fontWeight: "600" }}>
                        ← Back
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStep(3)}
                      style={[
                        cr.nextBtn,
                        { backgroundColor: theme.accent, flex: 1 },
                      ]}
                    >
                      <Text style={cr.nextBtnText}>Continue → Add Steps</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: Steps */}
              {step === 3 && (
                <View style={{ gap: 12 }}>
                  <Text style={[cr.stepHeading, { color: theme.text }]}>
                    Instructions
                  </Text>
                  <Text style={[cr.stepHint, { color: theme.muted }]}>
                    Add your step-by-step cooking instructions.
                  </Text>
                  {steps.map((step_text, i) => (
                    <View key={i} style={cr.stepRow}>
                      <View
                        style={[
                          cr.stepNumCircle,
                          { backgroundColor: theme.accent },
                        ]}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          {i + 1}
                        </Text>
                      </View>
                      <TextInput
                        value={step_text}
                        onChangeText={(v) => updateStep(i, v)}
                        placeholder={`Step ${i + 1}…`}
                        placeholderTextColor={theme.muted}
                        multiline
                        style={[
                          inputStyle,
                          { flex: 1, textAlignVertical: "top", lineHeight: 20 },
                        ]}
                      />
                      {steps.length > 1 && (
                        <TouchableOpacity
                          onPress={() =>
                            setSteps((arr) => arr.filter((_, idx) => idx !== i))
                          }
                        >
                          <Text style={{ color: theme.muted, fontSize: 20 }}>
                            ×
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => setSteps((arr) => [...arr, ""])}
                    style={[cr.addRowBtn, { borderColor: theme.border }]}
                  >
                    <Text style={{ color: theme.accent, fontWeight: "600" }}>
                      + Add Step
                    </Text>
                  </TouchableOpacity>
                  <View style={cr.navBtns}>
                    <TouchableOpacity
                      onPress={() => setStep(2)}
                      style={[cr.backBtn2, { borderColor: theme.border }]}
                    >
                      <Text style={{ color: theme.text, fontWeight: "600" }}>
                        ← Back
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStep(4)}
                      style={[
                        cr.nextBtn,
                        { backgroundColor: theme.accent, flex: 1 },
                      ]}
                    >
                      <Text style={cr.nextBtnText}>Continue → Review</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 4: Review & Publish */}
              {step === 4 && (
                <View style={{ gap: 16 }}>
                  <Text style={[cr.stepHeading, { color: theme.text }]}>
                    Review & Publish
                  </Text>
                  {/* Summary */}
                  <View
                    style={[
                      cr.summaryCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[cr.summaryTitle, { color: theme.text }]}>
                      {title || "Untitled Recipe"}
                    </Text>
                    <Text style={[cr.summaryMeta, { color: theme.muted }]}>
                      {[meal, cuisine, isPublic ? "Public" : "Private"]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                    {desc ? (
                      <Text style={[cr.summaryDesc, { color: theme.subtext }]}>
                        {desc}
                      </Text>
                    ) : null}
                    <Text style={[cr.summaryStat, { color: theme.muted }]}>
                      {ingredients.filter((i) => i.name).length} ingredients ·{" "}
                      {steps.filter((s) => s).length} steps
                      {/* {videoFile ? " · 🎬 Video included" : ""} */}
                    </Text>
                  </View>
                  <View style={cr.navBtns}>
                    <TouchableOpacity
                      onPress={() => setStep(3)}
                      style={[cr.backBtn2, { borderColor: theme.border }]}
                    >
                      <Text style={{ color: theme.text, fontWeight: "600" }}>
                        ← Back
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={publishing}
                      onPress={publish}
                      style={[
                        cr.nextBtn,
                        { backgroundColor: theme.accent, flex: 1 },
                      ]}
                    >
                      <Text style={cr.nextBtnText}>
                        {publishing ? "Publishing..." : "Publish Recipe"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cr = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  steps: { flexDirection: "row", alignItems: "center" },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: { width: 24, height: 2 },
  stepLabel: { fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 44 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  imagePicker: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageEmpty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  imageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    textAlign: "center",
    lineHeight: 42,
    fontSize: 28,
    marginBottom: 10,
  },
  imageTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  imageHint: {
    fontSize: 12,
  },
  imageActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  imageActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  twoCol: { flexDirection: "row", gap: 12 },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  aiBannerTitle: { fontSize: 14, fontWeight: "600" },
  videoPicker: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  videoLabel: { fontSize: 13, fontWeight: "500" },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
  },
  visTitle: { fontSize: 14, fontWeight: "500", marginBottom: 2 },
  visDesc: { fontSize: 12 },
  nextBtn: { padding: 15, borderRadius: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  stepHeading: { fontSize: 20, fontWeight: "700" },
  stepHint: { fontSize: 13, marginTop: -8 },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyInput: { width: 70 },
  addRowBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  navBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  backBtn2: {
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    flexShrink: 0,
  },
  summaryCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 6 },
  summaryTitle: { fontSize: 18, fontWeight: "700" },
  summaryMeta: { fontSize: 13 },
  summaryDesc: { fontSize: 13, lineHeight: 20 },
  summaryStat: { fontSize: 12, marginTop: 4 },
});
