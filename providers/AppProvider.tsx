import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { User, Trip, Match, Conversation, Message, OnboardingData } from '@/types';
import {
  getUser,
  saveUser as saveUserToFirebase,
  getTrips,
  saveTrip,
  getMatches,
  updateMatch as updateMatchInFirebase,
  getConversations,
  saveConversation,
  getBookmarks,
  saveBookmarks as saveBookmarksToFirebase,
  deleteUserData,
} from '@/services/firebase';

const DEFAULT_USER: User = {
  id: 'me',
  name: '',
  username: '',
  avatar: '',
  bio: '',
  phone: '',
  dateOfBirth: '',
  interests: [],
  verifications: { email: true, phone: false, identity: 'pending' },
  stats: { trips: 8, organized: 3, rating: 4.8 },
  notificationsEnabled: true,
  onboardingComplete: false,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log('[AppProvider] Fetching user from Firebase...');
      const firebaseUser = await getUser();
      return firebaseUser ?? DEFAULT_USER;
    },
  });

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      console.log('[AppProvider] Fetching bookmarks from Firebase...');
      return await getBookmarks();
    },
  });

  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      console.log('[AppProvider] Fetching trips from Firebase...');
      return await getTrips();
    },
  });

  const matchesQuery = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      console.log('[AppProvider] Fetching matches from Firebase...');
      return await getMatches();
    },
  });

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      console.log('[AppProvider] Fetching conversations from Firebase...');
      return await getConversations();
    },
  });

  useEffect(() => {
    if (userQuery.data) setUser(userQuery.data);
  }, [userQuery.data]);

  useEffect(() => {
    if (bookmarksQuery.data) setBookmarks(bookmarksQuery.data);
  }, [bookmarksQuery.data]);

  useEffect(() => {
    if (tripsQuery.data) setTrips(tripsQuery.data);
  }, [tripsQuery.data]);

  useEffect(() => {
    if (matchesQuery.data) setMatches(matchesQuery.data);
  }, [matchesQuery.data]);

  useEffect(() => {
    if (conversationsQuery.data) setConversations(conversationsQuery.data);
  }, [conversationsQuery.data]);

  const saveUserMutation = useMutation({
    mutationFn: async (updatedUser: User) => {
      console.log('[AppProvider] Saving user to Firebase...');
      await saveUserToFirebase(updatedUser);
      return updatedUser;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.log('[AppProvider] Error saving user:', error);
    },
  });

  const saveBookmarksMutation = useMutation({
    mutationFn: async (updatedBookmarks: string[]) => {
      console.log('[AppProvider] Saving bookmarks to Firebase...');
      await saveBookmarksToFirebase(updatedBookmarks);
      return updatedBookmarks;
    },
    onSuccess: (data) => {
      setBookmarks(data);
    },
    onError: (error) => {
      console.log('[AppProvider] Error saving bookmarks:', error);
    },
  });

  const saveTripMutation = useMutation({
    mutationFn: async (trip: Trip) => {
      console.log('[AppProvider] Saving trip to Firebase...');
      await saveTrip(trip);
      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error) => {
      console.log('[AppProvider] Error saving trip:', error);
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: 'accepted' | 'declined' }) => {
      console.log('[AppProvider] Updating match in Firebase...');
      await updateMatchInFirebase(matchId, status);
      return { matchId, status };
    },
    onSuccess: ({ matchId, status }) => {
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      console.log('[AppProvider] Error updating match:', error);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, text }: { conversationId: string; text: string }) => {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text,
        senderId: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        const updatedConv: Conversation = {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: text,
          lastMessageTime: 'Just now',
          unreadCount: 0,
        };
        await saveConversation(updatedConv);
        return { conversationId, updatedConv };
      }
      throw new Error('Conversation not found');
    },
    onSuccess: ({ conversationId, updatedConv }) => {
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? updatedConv : c)
      );
    },
    onError: (error) => {
      console.log('[AppProvider] Error sending message:', error);
    },
  });

  const completeOnboarding = useCallback((data: OnboardingData) => {
    const updatedUser: User = {
      ...user,
      name: data.name,
      username: data.username,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone,
      interests: data.interests,
      avatar: data.avatar,
      notificationsEnabled: data.notificationsEnabled,
      onboardingComplete: true,
    };
    saveUserMutation.mutate(updatedUser);
  }, [user]);

  const updateUser = useCallback((updates: Partial<User>) => {
    const updatedUser = { ...user, ...updates };
    saveUserMutation.mutate(updatedUser);
  }, [user]);

  const toggleBookmark = useCallback((tripId: string) => {
    const updated = bookmarks.includes(tripId)
      ? bookmarks.filter(id => id !== tripId)
      : [...bookmarks, tripId];
    saveBookmarksMutation.mutate(updated);
  }, [bookmarks]);

  const addTrip = useCallback((trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
    saveTripMutation.mutate(trip);
  }, []);

  const updateMatchStatus = useCallback((matchId: string, status: 'accepted' | 'declined') => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
    updateMatchMutation.mutate({ matchId, status });
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastMessageTime: 'Just now', unreadCount: 0 }
          : c
      )
    );
    sendMessageMutation.mutate({ conversationId, text });
  }, [conversations]);

  const logout = useCallback(async () => {
    console.log('[AppProvider] Logging out, clearing Firebase user data...');
    try {
      await deleteUserData();
    } catch (error) {
      console.log('[AppProvider] Error during logout cleanup:', error);
    }
    setUser(DEFAULT_USER);
    setBookmarks([]);
    queryClient.invalidateQueries();
  }, [queryClient]);

  const isLoading = userQuery.isLoading || tripsQuery.isLoading;

  return {
    user,
    trips,
    matches,
    conversations,
    bookmarks,
    isLoading,
    completeOnboarding,
    updateUser,
    toggleBookmark,
    addTrip,
    updateMatchStatus,
    sendMessage,
    logout,
  };
});
