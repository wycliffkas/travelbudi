import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Calendar, X, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { Match } from '@/types';

function MatchCard({ match, onAccept, onDecline }: {
  match: Match;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.matchCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.matchHeader}>
        <Image source={{ uri: match.user.avatar }} style={styles.matchAvatar} />
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{match.user.name}</Text>
          <View style={styles.compatBadge}>
            <Text style={styles.compatText}>{match.compatibility}% Match</Text>
          </View>
        </View>
      </View>
      <Text style={styles.matchBio}>{match.user.bio}</Text>
      <View style={styles.tripContextCard}>
        <Text style={styles.tripContextTitle}>{match.trip.title}</Text>
        <View style={styles.tripContextDetails}>
          <View style={styles.tripContextItem}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.tripContextText}>{match.trip.location}</Text>
          </View>
          <View style={styles.tripContextItem}>
            <Calendar size={12} color={Colors.textSecondary} />
            <Text style={styles.tripContextText}>{match.trip.dates}</Text>
          </View>
        </View>
      </View>
      {match.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <X size={16} color={Colors.textSecondary} />
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Heart size={16} color={Colors.white} />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
      {match.status === 'accepted' && (
        <View style={styles.acceptedBadge}>
          <Heart size={14} color={Colors.primary} fill={Colors.primary} />
          <Text style={styles.acceptedText}>Matched! You can now message each other</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const { matches, updateMatchStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');

  const pendingMatches = useMemo(() => matches.filter(m => m.status === 'pending'), [matches]);
  const acceptedMatches = useMemo(() => matches.filter(m => m.status === 'accepted'), [matches]);

  const displayedMatches = activeTab === 'pending' ? pendingMatches : acceptedMatches;

  const handleAccept = useCallback((matchId: string) => {
    updateMatchStatus(matchId, 'accepted');
  }, [updateMatchStatus]);

  const handleDecline = useCallback((matchId: string) => {
    updateMatchStatus(matchId, 'declined');
  }, [updateMatchStatus]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingMatches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.tabTextActive]}>
            Accepted ({acceptedMatches.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayedMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onAccept={() => handleAccept(match.id)}
            onDecline={() => handleDecline(match.id)}
          />
        ))}
        {displayedMatches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'No pending matches' : 'No accepted matches yet'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'pending' ? 'New matches will appear here' : 'Accept some matches to start connecting'}
            </Text>
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
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matchAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  matchInfo: {
    flex: 1,
    gap: 4,
  },
  matchName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  compatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compatText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  matchBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tripContextCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  tripContextTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  tripContextDetails: {
    flexDirection: 'row',
    gap: 14,
  },
  tripContextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripContextText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  declineText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptedText: {
    fontSize: 13,
    color: Colors.primary,
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
    textAlign: 'center',
  },
});
