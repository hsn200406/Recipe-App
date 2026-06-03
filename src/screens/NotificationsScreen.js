import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { NOTIFICATIONS } from '../data/mockData';
import { Avatar } from '../components/SharedComponents';

const NOTIF_ICON = { follow: '👤', like: '♥', comment: '💬', share: '↗' };
const NOTIF_COLOR = (type, theme) => ({
  follow:  theme.green,
  like:    theme.accent,
  comment: '#3B82F6',
  share:   theme.gold,
}[type] || theme.muted);

export default function NotificationsScreen() {
  const { theme }  = useTheme();
  const navigation = useNavigation();
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const unreadCount = notifs.filter(n => !n.read).length;
  const markRead    = id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()  => setNotifs(ns => ns.map(n => ({ ...n, read: true })));

  // Group by today / this week / earlier
  const groups = [
    { label: 'Recent',   items: notifs.filter(n => ['2m ago','8m ago','15m ago','1h ago'].includes(n.time)) },
    { label: 'Earlier',  items: notifs.filter(n => ['3h ago','5h ago','1d ago'].includes(n.time)) },
  ].filter(g => g.items.length > 0);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 22, color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={s.markAllBtn}>
            <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '600' }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread counter */}
      {unreadCount > 0 && (
        <View style={[s.unreadBanner, { backgroundColor: theme.accentSoft, borderBottomColor: theme.border }]}>
          <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '600' }}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {notifs.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
            <Text style={[s.emptyTitle, { color: theme.text }]}>No notifications yet</Text>
            <Text style={[s.emptyDesc, { color: theme.muted }]}>
              When people follow you, like or share your recipes, you'll see it here.
            </Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.label}>
              <Text style={[s.groupLabel, { color: theme.muted }]}>{group.label.toUpperCase()}</Text>
              {group.items.map(notif => (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => markRead(notif.id)}
                  activeOpacity={0.75}
                  style={[
                    s.notifRow,
                    {
                      backgroundColor: notif.read
                        ? theme.card
                        : (theme.dark ? '#1E1A14' : '#FFF9F7'),
                      borderColor: notif.read ? theme.border : theme.accent + '44',
                    },
                  ]}
                >
                  {/* Avatar with type icon badge */}
                  <View style={s.avatarWrap}>
                    <Avatar initial={notif.initial} color={notif.color} size={42} />
                    <View style={[s.typeBadge, { backgroundColor: NOTIF_COLOR(notif.type, theme) }]}>
                      <Text style={{ color: '#fff', fontSize: 9 }}>{NOTIF_ICON[notif.type]}</Text>
                    </View>
                  </View>

                  {/* Text */}
                  <View style={s.notifContent}>
                    <Text style={[s.notifText, { color: theme.text }]}>
                      <Text style={{ fontWeight: '700' }}>@{notif.actor}</Text>
                      {' '}{notif.text}
                    </Text>
                    <Text style={[s.notifTime, { color: theme.muted }]}>{notif.time}</Text>
                  </View>

                  {/* Unread dot */}
                  {!notif.read && (
                    <View style={[s.unreadDot, { backgroundColor: theme.accent }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, gap: 10 },
  backBtn:       { padding: 4 },
  title:         { flex: 1, fontSize: 20, fontWeight: '700' },
  markAllBtn:    { padding: 4 },
  unreadBanner:  { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  scroll:        { padding: 16, paddingBottom: 36, gap: 8 },
  groupLabel:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  notifRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  avatarWrap:    { position: 'relative' },
  typeBadge:     { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifContent:  { flex: 1, gap: 3 },
  notifText:     { fontSize: 14, lineHeight: 20 },
  notifTime:     { fontSize: 12 },
  unreadDot:     { width: 8, height: 8, borderRadius: 4 },
  empty:         { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 10 },
  emptyTitle:    { fontSize: 20, fontWeight: '700' },
  emptyDesc:     { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
