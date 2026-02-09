import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conversations } = useApp();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={styles.conversationCard}
            onPress={() => router.push(`/chat?id=${conv.id}`)}
            testID={`conversation-${conv.id}`}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: conv.user.avatar }} style={styles.avatar} />
              {conv.unreadCount > 0 && (
                <View style={styles.unreadDot}>
                  <Text style={styles.unreadDotText}>{conv.unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.conversationContent}>
              <View style={styles.conversationTopRow}>
                <Text style={[styles.conversationName, conv.unreadCount > 0 && styles.unreadName]}>
                  {conv.user.name}
                </Text>
                <Text style={styles.conversationTime}>{conv.lastMessageTime}</Text>
              </View>
              <Text style={styles.tripContextLabel}>{conv.tripContext}</Text>
              <Text
                style={[styles.lastMessage, conv.unreadCount > 0 && styles.unreadMessage]}
                numberOfLines={1}
              >
                {conv.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {conversations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Accept a match to start chatting</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 2,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  unreadDotText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  conversationContent: {
    flex: 1,
    gap: 2,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  unreadName: {
    fontWeight: '700' as const,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  tripContextLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
