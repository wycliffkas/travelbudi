export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  phone: string;
  dateOfBirth: string;
  interests: string[];
  verifications: {
    email: boolean;
    phone: boolean;
    identity: 'verified' | 'pending' | 'none';
  };
  stats: {
    trips: number;
    organized: number;
    rating: number;
  };
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
}

export interface TripDay {
  day: number;
  title: string;
  location: string;
  description: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  location: string;
  images: string[];
  startDate: string;
  endDate: string;
  duration: number;
  stops: number;
  ageRange: string;
  spotsTotal: number;
  spotsLeft: number;
  categories: string[];
  whatsSpecial: string;
  itinerary: TripDay[];
  organizer: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    tripsOrganized: number;
    verifications: {
      email: boolean;
      phone: boolean;
      identity: 'verified' | 'pending' | 'none';
    };
  };
  isRecurring: boolean;
  recurringLabel: string;
  tripType: string;
  gender: string;
}

export interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  compatibility: number;
  trip: {
    id: string;
    title: string;
    location: string;
    dates: string;
  };
  status: 'pending' | 'accepted' | 'declined';
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  tripContext: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface OnboardingData {
  name: string;
  username: string;
  dateOfBirth: string;
  phone: string;
  gender: string;
  interests: string[];
  avatar: string;
  notificationsEnabled: boolean;
}
