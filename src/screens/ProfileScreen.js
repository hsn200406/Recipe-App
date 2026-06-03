import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StyleSheet, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { RECIPES, CREATORS } from '../data/mockData';
import { Avatar, Stars, StatCell } from '../components/SharedComponents';

export default function ProfileScreen() {
  const { theme }  = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('recipes');

  // My profile data (replace with useAuth() user once backend is connected)
  const me = {
    name: 'Alex Rivera',
    handle: 'alexcooks',
    initial: 'A',
    bio: 'Home cook obsessed with ramen, tacos, and anything under 30 min 🍜\nVancouver, BC 🇨🇦',
    specialty: 'Asian · Italian',
    recipeCount: 12,
    followers: 348,
    following: 91,
  };

  // Show a few recipes as "mine"
  const myRecipes  = RECIPES.slice(0, 3);
  const likedRecipes = RECIPES.filter(r => r.liked);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Cover */}
        <View style={[s.cover, { backgroundColor: theme.dark ? '#1A1208' : '#F0EDE8' }]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={[s.settingsBtn, { backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.15)' }]}
          >
            <Text style={{ fontSize: 18 }}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[s.notifBtn, { backgroundColor: 'rgba(0,0,0,0.35)', borderColor: 'rgba(255,255,255,0.15)' }]}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            <View style={[s.badge, { backgroundColor: theme.accent }]}>
              <Text style={s.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={s.avatarContainer}>
          <View style={[s.avatarBorder, { borderColor: theme.bg }]}>
            <Avatar initial={me.initial} color={theme.accent} size={76} />
          </View>
        </View>

        {/* Info */}
        <View style={s.infoSection}>
          <Text style={[s.name, { color: theme.text }]}>{me.name}</Text>
          <Text style={[s.handle, { color: theme.muted }]}>@{me.handle}</Text>
          <Text style={[s.bio, { color: theme.subtext }]}>{me.bio}</Text>
          <View style={[s.specialtyBadge, { backgroundColor: theme.accentSoft, borderColor: theme.accent + '33' }]}>
            <Text style={{ fontSize: 13 }}>🍽</Text>
            <Text style={{ fontSize: 12, color: theme.accent, fontWeight: '500' }}>{me.specialty}</Text>
          </View>

          {/* Stats */}
          <View style={[s.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <StatCell value={me.recipeCount}               label="Recipes"   borderRight />
            <StatCell value={me.followers.toLocaleString()} label="Followers" borderRight />
            <StatCell value={me.following}                 label="Following" />
          </View>

          {/* Edit / Share */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.editBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => Alert.alert('Edit Profile', '🔌 Connect to backend: PUT /api/users/me with JWT token.')}
            >
              <Text style={[s.editBtnText, { color: theme.text }]}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.editBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => Alert.alert('Share Profile', 'Profile link:\nhttps://recipesocial.app/@alexcooks')}
            >
              <Text style={[s.editBtnText, { color: theme.text }]}>↗ Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content tabs */}
        <View style={[s.tabs, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[['recipes', '🍴 Recipes'], ['liked', '♥ Liked']].map(([id, label]) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveTab(id)}
              style={[s.tabBtn, { backgroundColor: activeTab === id ? theme.accent : 'transparent' }]}
            >
              <Text style={{ color: activeTab === id ? '#fff' : theme.muted, fontWeight: '500', fontSize: 13 }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recipe list */}
        <View style={s.recipeList}>
          {(activeTab === 'recipes' ? myRecipes : likedRecipes).map(r => {
            const creator = CREATORS[r.creatorId];
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => navigation.navigate('RecipeDetail', { recipe: r })}
                style={[s.recipeCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[s.recipeHero, { backgroundColor: r.cardColor }]}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: r.accentColor + '44' }]} />
                  <Text style={{ fontSize: 30 }}>{r.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.recipeTitle, { color: theme.text }]} numberOfLines={1}>{r.title}</Text>
                  <Text style={[s.recipeMeta, { color: theme.muted }]}>{r.meal} · {r.cuisine}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <Stars rating={r.rating} size={11} />
                    <Text style={{ fontSize: 11, color: theme.muted }}>
                      ♥ {r.likes.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: theme.muted, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            );
          })}
          {activeTab === 'liked' && likedRecipes.length === 0 && (
            <View style={s.emptyTab}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>♡</Text>
              <Text style={[s.emptyText, { color: theme.muted }]}>No liked recipes yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1 },
  scroll:          { paddingBottom: 44 },
  cover:           { height: 160, position: 'relative' },
  settingsBtn:     { position: 'absolute', top: 16, right: 60, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  notifBtn:        { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badge:           { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText:       { color: '#fff', fontSize: 9, fontWeight: '700' },
  avatarContainer: { paddingHorizontal: 16 },
  avatarBorder:    { marginTop: -38, alignSelf: 'flex-start', borderWidth: 4, borderRadius: 42 },
  infoSection:     { paddingHorizontal: 16, paddingTop: 10, gap: 10 },
  name:            { fontSize: 22, fontWeight: '700' },
  handle:          { fontSize: 14, marginTop: -6 },
  bio:             { fontSize: 14, lineHeight: 22 },
  specialtyBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  statsRow:        { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  actionRow:       { flexDirection: 'row', gap: 10 },
  editBtn:         { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  editBtnText:     { fontSize: 14, fontWeight: '500' },
  tabs:            { flexDirection: 'row', margin: 16, borderRadius: 12, padding: 4, gap: 4, borderWidth: 1 },
  tabBtn:          { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  recipeList:      { paddingHorizontal: 16, gap: 10 },
  recipeCard:      { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 12 },
  recipeHero:      { width: 54, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  recipeTitle:     { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  recipeMeta:      { fontSize: 12 },
  emptyTab:        { alignItems: 'center', paddingVertical: 40 },
  emptyText:       { fontSize: 14 },
});
