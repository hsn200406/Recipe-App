import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, MacroBar, Stars } from '../components/SharedComponents';
import { useTheme } from '../context/ThemeContext';
import { CREATORS } from '../data/mockData';

// ── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({ visible, recipe, onClose }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const friends = [
    { handle: 'mikec',    initial: 'M', color: '#7C3AED' },
    { handle: 'jas_cook', initial: 'J', color: '#2563EB' },
    { handle: 'fitvegan', initial: 'F', color: '#059669' },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={[ms.overlay, { backgroundColor: theme.overlay }]} activeOpacity={1} onPress={onClose} />
      <View style={[ms.sheet, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={ms.sheetHandle} />
        <View style={ms.sheetHeader}>
          <Text style={[ms.sheetTitle, { color: theme.text }]}>Share Recipe</Text>
          <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22, color: theme.muted }}>×</Text></TouchableOpacity>
        </View>
        <Text style={[ms.label, { color: theme.muted }]}>Send to a friend on the app:</Text>
        <View style={ms.friendsRow}>
          {friends.map(f => (
            <TouchableOpacity key={f.handle} onPress={() => { setSentTo(f.handle); }} style={ms.friendItem}>
              <View style={{ borderWidth: 2, borderColor: sentTo === f.handle ? theme.accent : 'transparent', borderRadius: 24, padding: 2 }}>
                <Avatar initial={f.initial} color={f.color} size={44} />
              </View>
              <Text style={{ fontSize: 11, color: sentTo === f.handle ? theme.accent : theme.muted, marginTop: 4 }}>@{f.handle}</Text>
              {sentTo === f.handle && <Text style={{ fontSize: 10, color: theme.green }}>✓ Sent!</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={[ms.linkRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Text style={{ flex: 1, color: theme.muted, fontSize: 12 }} numberOfLines={1}>
            https://recipesocial.app/recipe/{recipe?.id}
          </Text>
          <TouchableOpacity
            onPress={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={[ms.copyBtn, { backgroundColor: copied ? theme.green : theme.accent }]}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', fontSize: 11, color: theme.muted, marginTop: 8 }}>
          Anyone with this link can view the recipe
        </Text>
      </View>
    </Modal>
  );
}
const ms = StyleSheet.create({
  overlay:    { ...StyleSheet.absoluteFillObject },
  sheet:      { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 44, borderTopWidth: 1 },
  sheetHandle:{ width: 36, height: 4, backgroundColor: '#444', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  label:      { fontSize: 13, marginBottom: 12 },
  friendsRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  friendItem: { alignItems: 'center' },
  linkRow:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, borderWidth: 1, gap: 10 },
  copyBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
});

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ visible, onClose, onSubmit }) {
  const { theme } = useTheme();
  const [stars, setStars]     = useState(0);
  const [comment, setComment] = useState('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : height}
      >
        {/* Overlay */}
        <TouchableOpacity
          style={[ms.overlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom sheet wrapper */}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View
            style={[
              ms.sheet,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
                maxHeight: '80%',
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Handle (this is your “line on top”) */}
              <View style={ms.sheetHandle} />

              <View style={ms.sheetHeader}>
                <Text style={[ms.sheetTitle, { color: theme.text }]}>
                  Leave a Review
                </Text>

                <TouchableOpacity onPress={onClose}>
                  <Text style={{ fontSize: 22, color: theme.muted }}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Stars */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {[1,2,3,4,5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setStars(s)}>
                    <Text style={{ fontSize: 38, color: s <= stars ? theme.gold : theme.border }}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input */}
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Share your thoughts on this recipe…"
                placeholderTextColor={theme.muted}
                multiline
                style={[
                  rm.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border,
                    color: theme.text,
                    minHeight: 100,
                  },
                ]}
                textAlignVertical="top"
              />

              {/* Button */}
              <TouchableOpacity
                onPress={() => {
                  if (stars > 0) {
                    onSubmit({ stars, comment });
                    onClose();
                    setStars(0);
                    setComment('');
                  }
                }}
                style={[
                  rm.submitBtn,
                  { backgroundColor: stars > 0 ? theme.accent : theme.pillBg },
                ]}
              >
                <Text style={{ color: stars > 0 ? '#fff' : theme.muted }}>
                  Submit Review
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
 
}
const rm = StyleSheet.create({
  input:     { padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 14, lineHeight: 20, marginBottom: 14, minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { padding: 14, borderRadius: 13, alignItems: 'center' },
});

// ── Main Detail Screen ────────────────────────────────────────────────────────
export default function RecipeDetailScreen() {
  const { theme }  = useTheme();
  const navigation = useNavigation();
  const route      = useRoute();
  const { recipe: initialRecipe, followedCreators = [], onToggleFollow } = route.params || {};

  const recipe = initialRecipe || {};
  const safeRecipe = {
    ...recipe,
    ingredients: recipe?.ingredients || [],
    steps: recipe?.steps || [],
    tags: recipe?.tags || [],
  };
  const [tab, setTab]             = useState('ingredients');
  const [checked, setChecked]= useState([]);
  const [liked, setLiked]         = useState(initialRecipe?.liked);
  const [likeCount, setLikeCount] = useState(initialRecipe?.likes);
  const [saved, setSaved]         = useState(initialRecipe?.saved);
  const [reviews, setReviews]     = useState(initialRecipe?.reviews || []);
  const [comment, setComment]     = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showReview, setShowReview] = useState(false);

  if (!recipe) return null;
  const creator = CREATORS?.[recipe.creatorId] || {
    handle: 'unknown',
    initial: '?',
    avatarColor: '#999',
    name: 'Unknown Creator',
    specialty: '',
    followers: 0
  };
  const isFollowed = followedCreators.includes(recipe.creatorId);
  const fmtCount   = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  const toggleStep = i => setChecked(cs => cs.includes(i) ? cs.filter(x => x !== i) : [...cs, i]);

  const addComment = () => {
    if (!comment.trim()) return;
    setReviews(r => [...r, { id: Date.now().toString(), user: 'you', initial: 'A', color: theme.accent, rating: 0, text: comment.trim(), time: 'just now' }]);
    setComment('');
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ShareModal  visible={showShare}  recipe={recipe} onClose={() => setShowShare(false)} />
      <ReviewModal visible={showReview} onClose={() => setShowReview(false)}
        onSubmit={({ stars, comment: c }) => {
          setReviews(r => [...r, { id: Date.now().toString(), user: 'you', initial: 'A', color: theme.accent, rating: stars, text: c, time: 'just now' }]);
        }}
      />

      {/* Hero */}
      <View style={[s.hero, { backgroundColor: recipe.cardColor }]}>
        <View style={[s.heroGlow, { backgroundColor: recipe.accentColor + '55' }]} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.heroEmoji}>{recipe.emoji}</Text>
        {recipe.hasVideo && (
          <TouchableOpacity style={s.watchBtn} onPress={() => Alert.alert('Video', '🔌 Connect your backend to stream the real recipe video here.\n\nBackend: POST /api/recipes/upload-video\nStore in S3/Cloudflare R2, return a videoUrl.')}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>▶  Watch Recipe Video</Text>
          </TouchableOpacity>
        )}
        <View style={s.heroRating}>
          <Text style={{ color: theme.gold, fontWeight: '600', fontSize: 12 }}>★ {recipe.rating}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}> · {recipe.ratingCount} reviews</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Title + tags */}
        <View style={s.titleRow}>
          <Text style={[s.title, { color: theme.text }]}>{recipe.title}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {[recipe.meal, recipe.cuisine, ...safeRecipe.tags].map((t, i) => (
            <View key={i} style={[s.tag, { backgroundColor: i < 2 ? theme.accentSoft : theme.pillBg, borderColor: i < 2 ? theme.accent + '44' : theme.border }]}>
              <Text style={{ fontSize: 11, color: i < 2 ? theme.accent : theme.pillText, fontWeight: i < 2 ? '600' : '400' }}>{t}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Creator card */}
        <TouchableOpacity
          style={[s.creatorCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Creator', { creator, followedCreators, onToggleFollow })}
        >
          <Avatar initial={creator.initial} color={creator.avatarColor} size={42} />
          <View style={{ flex: 1 }}>
            <Text style={[s.creatorName, { color: theme.text }]}>{creator.name}</Text>
            <Text style={[s.creatorMeta, { color: theme.muted }]}>
              {creator.specialty} · {creator.followers.toLocaleString()} followers
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleFollow && onToggleFollow(recipe.creatorId)}
            style={[s.followBtn, { backgroundColor: isFollowed ? theme.pillBg : theme.accent, borderColor: isFollowed ? theme.border : theme.accent }]}
          >
            <Text style={{ color: isFollowed ? theme.muted : '#fff', fontSize: 12, fontWeight: '600' }}>
              {isFollowed ? 'Following' : '+ Follow'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <Text style={[s.sectionTitle, { color: theme.muted, marginTop: 16 }]}>DESCRIPTION</Text>
        <Text style={[s.desc, { color: theme.subtext, marginBottom: 16 }]}>{recipe.desc}</Text>

        {/* Nutrition card */}
        <View style={[s.nutritionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.sectionLabel, { color: theme.muted }]}>NUTRITION PER SERVING</Text>
          <View style={s.nutritionInner}>
            <View style={s.calBox}>
              <Text style={[s.calNum, { color: theme.text }]}>{recipe.cal}</Text>
              <Text style={[s.calLabel, { color: theme.muted }]}>kcal</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
              <MacroBar label="Protein" value={recipe.protein} max={60}  color="#4CAF82" />
              <MacroBar label="Carbs"   value={recipe.carbs}   max={100} color="#F5C842" />
              <MacroBar label="Fat"     value={recipe.fat}     max={50}  color="#FF5C3A" />
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.actionGrid}>
          {[
            { icon: liked ? '♥' : '♡', label: fmtCount(likeCount), color: theme.accent, active: liked,
              onPress: () => { setLiked(l => !l); setLikeCount(c => liked ? c - 1 : c + 1); } },
            { icon: saved ? '🔖' : '🏷', label: 'Save',   color: theme.gold,   active: saved,  onPress: () => setSaved(s => !s) },
            { icon: '💬',  label: 'Review', color: theme.muted,  active: false, onPress: () => setShowReview(true) },
            { icon: '↗',   label: 'Share',  color: theme.muted,  active: false, onPress: () => setShowShare(true) },
          ].map(btn => (
            <TouchableOpacity key={btn.label} onPress={btn.onPress}
              style={[s.actionBtn, { backgroundColor: btn.active ? btn.color + '18' : theme.card, borderColor: btn.active ? btn.color : theme.border }]}
            >
              <Text style={{ fontSize: 20, color: btn.active ? btn.color : theme.muted }}>{btn.icon}</Text>
              <Text style={{ fontSize: 11, color: btn.active ? btn.color : theme.muted, marginTop: 2 }}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats strip */}
        <View style={[s.statsStrip, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[['⏱', recipe.time], ['🔥', `${recipe.cal} cal`], ['💬', recipe.commentCount], ['↗', recipe.shares]].map(([icon, val], i) => (
            <View key={i} style={[s.statCell, { borderRightWidth: i < 3 ? 1 : 0, borderRightColor: theme.border }]}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={[s.statVal, { color: theme.muted }]}>{val}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={[s.tabs, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {['ingredients', 'steps', 'reviews'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[s.tabBtn, { backgroundColor: tab === t ? theme.accent : 'transparent' }]}
            >
              <Text style={{ color: tab === t ? '#fff' : theme.muted, fontWeight: '500', fontSize: 12 }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ingredients */}
        {tab === 'ingredients' && (
          <View>
            {safeRecipe.ingredients.map((ing, i) => (
              <View key={i} style={[s.ingRow, { borderBottomColor: theme.border }]}>
                <Text style={[s.ingQty, { color: recipe.accentColor }]}>{ing.qty}</Text>
                <Text style={[s.ingName, { color: theme.text }]}>{ing.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Steps */}
        {tab === 'steps' && (
          <View style={{ gap: 10 }}>
            {safeRecipe.steps.map((step, i) => {
              const done = checked.includes(i);
              return (
                <TouchableOpacity key={i} onPress={() => toggleStep(i)}
                  style={[s.stepCard, {
                    backgroundColor: done ? theme.surface : theme.card,
                    borderColor: done ? recipe.accentColor + '55' : theme.border,
                  }]}
                >
                  <View style={[s.stepNum, {
                    backgroundColor: done ? recipe.accentColor : theme.surface,
                    borderColor: done ? recipe.accentColor : theme.border,
                  }]}>
                    <Text style={{ color: done ? '#fff' : theme.muted, fontSize: 12, fontWeight: '700' }}>
                      {done ? '✓' : i + 1}
                    </Text>
                  </View>
                  <Text style={[s.stepText, {
                    color: done ? theme.muted : theme.text,
                    textDecorationLine: done ? 'line-through' : 'none',
                  }]}>{step}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <View style={{ gap: 10 }}>
            {reviews.map(r => (
              <View key={r.id} style={[s.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={s.reviewHeader}>
                  <Avatar initial={r.initial} color={r.color} size={28} />
                  <Text style={[s.reviewUser, { color: theme.text }]}>@{r.user}</Text>
                  {r.rating > 0 && <Stars rating={r.rating} size={12} />}
                  <Text style={[s.reviewTime, { color: theme.muted }]}>{r.time}</Text>
                </View>
                <Text style={[s.reviewText, { color: theme.muted }]}>{r.text}</Text>
              </View>
            ))}

            <TouchableOpacity onPress={() => setShowReview(true)}
              style={[s.writeReviewBtn, { backgroundColor: theme.accentSoft, borderColor: theme.accent + '44' }]}
            >
              <Text style={{ color: theme.accent, fontWeight: '600', fontSize: 14 }}>+ Write a Review</Text>
            </TouchableOpacity>

            {/* Comment box
            <View style={[s.commentBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                value={comment} onChangeText={setComment}
                placeholder="Leave a comment…"
                placeholderTextColor={theme.muted}
                style={[s.commentInput, { color: theme.text }]}
              />
              <TouchableOpacity onPress={addComment}
                style={[s.commentSend, { backgroundColor: comment.trim() ? theme.accent : theme.pillBg }]}
              >
                <Text style={{ color: comment.trim() ? '#fff' : theme.muted, fontSize: 16 }}>↑</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1 },
  hero:          { height: 230, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroGlow:      { ...StyleSheet.absoluteFillObject },
  backBtn:       { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  heroEmoji:     { fontSize: 76, zIndex: 1 },
  watchBtn:      { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8, marginTop: 8 },
  heroRating:    { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' },
  scroll:        { padding: 16, paddingBottom: 44, gap: 14 },
  titleRow:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title:         { fontSize: 26, fontWeight: '700', lineHeight: 32, flex: 1 },
  tag:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, marginRight: 6 },
  creatorCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  creatorName:   { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  creatorMeta:   { fontSize: 12 },
  followBtn:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  desc:          { fontSize: 14, lineHeight: 22 },
  nutritionCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  sectionLabel:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
  nutritionInner:{ flexDirection: 'row', alignItems: 'center', gap: 14 },
  calBox:        { alignItems: 'center', width: 60 },
  calNum:        { fontSize: 26, fontWeight: '700' },
  calLabel:      { fontSize: 11 },
  actionGrid:    { flexDirection: 'row', gap: 8 },
  actionBtn:     { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  statsStrip:    { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  statCell:      { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 3 },
  statVal:       { fontSize: 11 },
  tabs:          { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4, borderWidth: 1 },
  tabBtn:        { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  ingRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  ingQty:        { fontSize: 13, fontWeight: '600', minWidth: 60 },
  ingName:       { fontSize: 14 },
  stepCard:      { flexDirection: 'row', gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  stepNum:       { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, flexShrink: 0, marginTop: 2 },
  stepText:      { fontSize: 14, lineHeight: 22, flex: 1 },
  reviewCard:    { padding: 14, borderRadius: 14, borderWidth: 1, gap: 8 },
  reviewHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewUser:    { fontSize: 13, fontWeight: '600' },
  reviewTime:    { marginLeft: 'auto', fontSize: 11 },
  reviewText:    { fontSize: 13, lineHeight: 20 },
  writeReviewBtn:{ padding: 14, borderRadius: 13, alignItems: 'center', borderWidth: 1 },
  commentBox:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 14, borderWidth: 1 },
  commentInput:  { flex: 1, fontSize: 14, paddingVertical: 6, paddingHorizontal: 8 },
  commentSend:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 21, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5,},
  desc: { fontSize: 14, lineHeight: 22,}
});
